import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { getCurrentUser } from '@/api/auth';
import { getPaddle, subscribePaddleEvents, CheckoutEventNames } from '@/lib/paddle';
import { getBillingLifecycle, prepareBillingCheckout } from '../api';
import { billingLifecycleKey } from '../queries';
import { serviceInformation, getPublicSupport } from '@/pages/Help/serviceInformation';
import type { BillingCheckoutResume, BillingInterval, PlanCode, ValidatedBillingLifecycle } from '../types';

type Selection = { plan: PlanCode; interval: BillingInterval };
export type BillingCheckoutStatus = 'idle' | 'loading' | 'open' | 'reopenable' | 'pre-submit-error' | 'uncertain' | 'pending';
type Scope = Readonly<{ companyId?: number; ownerId?: number; role?: string }>;
type View = { scope: Scope | null; status: BillingCheckoutStatus; prepared: BillingCheckoutResume | null; message: string | null };
type Session = {
  scope: Scope; companyId: number; ownerId: number; active: boolean; locked: boolean;
  uncertain: boolean; completed: boolean; overlayOpen: boolean;
  prepared: BillingCheckoutResume | null; controller: AbortController | null;
  paddle: Awaited<ReturnType<typeof getPaddle>> | null;
};
const unavailable = 'Billing is temporarily unavailable. Refresh status to try again.';
const uncertain = 'We could not confirm the outcome. Check subscription status before trying another payment.';
const sameSelection = (a: Selection, b: Selection) => a.plan === b.plan && a.interval === b.interval;
const sameDraft = (a: BillingCheckoutResume, b: BillingCheckoutResume) => sameSelection(a, b) && a.transactionId === b.transactionId;

/** Owns one mounted owner's action, never entitlement or a persistent checkout cache. */
export function useBillingCheckout() {
  const { user } = useAuth();
  const companyId = user?.companyId, ownerId = user?.id, role = user?.role;
  const scope = useMemo(() => ({ companyId, ownerId, role }), [companyId, ownerId, role]);
  const queryClient = useQueryClient();
  const session = useRef<Session | null>(null);
  const [view, setView] = useState<View>({ scope: null, status: 'idle', prepared: null, message: null });

  useLayoutEffect(() => {
    if (role !== 'ADMIN' || !companyId || !ownerId) return;
    const current: Session = { scope, companyId, ownerId, active: true, locked: false, uncertain: false, completed: false,
      overlayOpen: false, prepared: null, controller: null, paddle: null };
    session.current = current;
    const unsubscribe = subscribePaddleEvents((event) => {
      if (!current.active || session.current !== current || !current.prepared || event.data?.transaction_id !== current.prepared.transactionId) return;
      let status: BillingCheckoutStatus;
      if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
        current.completed = true; status = 'pending';
      } else if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
        current.overlayOpen = false;
        status = current.completed ? 'pending' : current.uncertain ? 'uncertain' : 'reopenable';
      } else if ([CheckoutEventNames.CHECKOUT_ERROR, CheckoutEventNames.CHECKOUT_PAYMENT_ERROR, CheckoutEventNames.CHECKOUT_FAILED, CheckoutEventNames.CHECKOUT_PAYMENT_FAILED].includes(event.name!)) {
        current.uncertain = true; status = 'uncertain';
      } else return;
      setView({ scope, status, prepared: current.prepared, message: status === 'uncertain' ? uncertain : null });
      // Browser events only request fresh server facts, never set paid/ready flags.
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: billingLifecycleKey(companyId, ownerId) }),
        queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
      ]).catch(() => {});
    });
    return () => {
      current.active = false;
      current.controller?.abort();
      unsubscribe();
      if (current.overlayOpen) {
        try { current.paddle?.Checkout.close(); } catch { /* Provider owns teardown. */ }
      }
      if (session.current === current) session.current = null;
      const key = billingLifecycleKey(companyId, ownerId);
      if (!queryClient.getQueryCache().find({ queryKey: key, exact: true })?.getObserversCount()) queryClient.removeQueries({ queryKey: key, exact: true });
    };
  }, [companyId, ownerId, role, scope, queryClient]);

  const run = async (selection?: Selection, open = true) => {
    const current = session.current;
    if (!current || !current.active || current.scope !== scope || current.locked) return;
    current.locked = true;
    const controller = new AbortController(); current.controller = controller;
    let submitted = false;
    const alive = () => current.active && session.current === current && !controller.signal.aborted;
    const publish = (status: BillingCheckoutStatus, message: string | null = null) => {
      if (alive()) setView({ scope, status, message, prepared: current.prepared });
    };
    const verifyOwner = async () => {
      const actor = await getCurrentUser();
      if (!alive()) throw new Error('Canceled');
      if (actor?.role !== 'ADMIN' || actor.id !== current.ownerId || actor.companyId !== current.companyId) throw new Error('Account changed');
    };
    const read = async () => {
      const facts = await getBillingLifecycle(controller.signal, current.companyId);
      if (!alive()) throw new Error('Canceled');
      queryClient.setQueryData(billingLifecycleKey(current.companyId, current.ownerId), facts);
      return facts;
    };
    const ready = (facts: ValidatedBillingLifecycle) => facts.company.isActive && facts.company.operationalStatus === 'ACTIVE' &&
      facts.billingConfigured && facts.checkoutAvailable && facts.checkoutReadiness === 'READY' && !facts.reconciliationRequired && !facts.subscription && facts.providerState !== 'MIRRORED';
    const reconcile = (facts: ValidatedBillingLifecycle) => {
      if (facts.workspaceAccessAllowed || facts.subscription || facts.providerState === 'MIRRORED' || current.completed) { publish('pending'); return false; }
      if (!ready(facts)) { publish(facts.reconciliationRequired || facts.checkoutReadiness === 'RECONCILIATION_PENDING' ? 'uncertain' : 'pre-submit-error', facts.reconciliationRequired ? uncertain : unavailable); return false; }
      if (current.prepared) {
        if (!facts.checkoutResume || !sameDraft(current.prepared, facts.checkoutResume)) { current.uncertain = true; publish('uncertain', uncertain); return false; }
      } else if (facts.checkoutResume) current.prepared = facts.checkoutResume;
      if (current.uncertain && !facts.checkoutResume) { publish('uncertain', uncertain); return false; }
      if (facts.checkoutResume) current.uncertain = false;
      return true;
    };
    publish('loading');
    try {
      await verifyOwner();
      let facts = await read();
      if (!reconcile(facts)) return;
      if (!open) { publish(current.prepared ? 'reopenable' : 'idle'); return; }
      const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT?.trim();
      const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.trim();
      if (!['sandbox', 'production'].includes(environment ?? '') || facts.billingEnvironment !== environment ||
        !token?.startsWith(environment === 'sandbox' ? 'test_' : 'live_')) throw new Error('Config unavailable');
      if (environment === 'production') {
        if (!facts.ownerVerified || !serviceInformation().policiesReady || !(await getPublicSupport(controller.signal)).email) throw new Error('Checkout unavailable');
        if (!alive()) return;
      }
      const paddle = await getPaddle();
      if (!alive()) return;
      current.paddle = paddle;
      // SDK and commercial checks can take time: refresh identity/capabilities again before mutation.
      await verifyOwner(); facts = await read();
      if (!reconcile(facts)) return;
      if (facts.billingEnvironment !== environment || (environment === 'production' && !facts.ownerVerified)) throw new Error('Checkout unavailable');
      if (current.prepared && selection && !sameSelection(current.prepared, selection)) { publish('reopenable', 'Your prepared checkout is ready to reopen.'); return; }
      if (!current.prepared) {
        if (!selection || !['STARTER', 'PRO', 'ADVANCED'].includes(selection.plan) || !['month', 'year'].includes(selection.interval)) throw new Error('Invalid selection');
        submitted = true;
        const result = await prepareBillingCheckout(selection.plan, selection.interval, controller.signal);
        if (!alive()) return;
        current.prepared = { ...selection, transactionId: result.transactionId };
        await verifyOwner();
      }
      if (!alive()) return;
      if (!/^txn_[a-z0-9]{26}$/.test(current.prepared.transactionId)) throw new Error('Invalid transaction');
      if (current.completed || current.uncertain) { publish(current.completed ? 'pending' : 'uncertain', current.uncertain ? uncertain : null); return; }
      current.overlayOpen = true;
      paddle.Checkout.open({ transactionId: current.prepared.transactionId, settings: { displayMode: 'overlay', theme: 'light', successUrl: new URL('/welcome', window.location.origin).toString() } });
      if (current.overlayOpen && !current.completed && !current.uncertain) publish('open');
    } catch (cause) {
      if (!alive()) return;
      const status = (cause as { response?: { status?: number } })?.response?.status;
      if ((submitted && !current.prepared) || status === 409) {
        current.uncertain = true; publish('uncertain', uncertain);
      } else if (current.prepared) {
        publish('reopenable', 'Checkout could not open. Try again.');
      } else publish('pre-submit-error', unavailable);
      void queryClient.invalidateQueries({ queryKey: billingLifecycleKey(current.companyId, current.ownerId) }).catch(() => {});
    } finally {
      current.locked = false;
      if (current.controller === controller) current.controller = null;
    }
  };
  const visible = view.scope === scope ? view : { scope, status: 'idle' as const, prepared: null, message: null };
  return { status: visible.status, message: visible.message, prepared: visible.prepared, isBusy: visible.status === 'loading',
    openCheckout: (selection?: Selection) => run(selection), checkStatus: () => run(undefined, false) };
}
