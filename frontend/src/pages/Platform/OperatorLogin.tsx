import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import LanguageChoice from '@/components/common/LanguageChoice';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/context';
import { clearOperatorSession, rejectOperatorCallback } from './operatorSession';
import { operatorUrdu } from './operatorTranslations';
import '@/workspace.css';
import '@/workspace-refresh.css';
import './operator.css';

function useOperatorText() {
  const { language } = useLanguage();
  return (text: string) => language === 'ur' ? operatorUrdu[text] ?? text : text;
}

export function OperatorShell({ title, children }: { title: string; children: ReactNode }) {
  const text = useOperatorText();
  useEffect(() => { document.title = `${text(title)} | Hygene Ops`; }, [title, text]);
  return <div className="workspace operator-page">
    <header className="operator-header"><BrandLogo /><LanguageChoice /></header>
    <main className="operator-content">
      <ShieldCheck size={32} aria-hidden="true" />
      <h1>{text(title)}</h1>
      {children}
    </main>
  </div>;
}

export default function OperatorLogin() {
  const text = useOperatorText();
  return <OperatorShell title="Platform sign in">
    <p>{text('Separate access for provisioned platform operators.')}</p>
    <section className="operator-notice" aria-labelledby="operator-unavailable">
      <h2 id="operator-unavailable">{text('Sign-in provider unavailable')}</h2>
      <p id="operator-signin-reason">{text('Platform sign in is not configured. Contact your platform administrator for access.')}</p>
      <Button disabled aria-describedby="operator-signin-reason">{text('Continue with identity provider')}</Button>
    </section>
    <ul className="operator-requirements">
      <li>{text('A company owner, manager or staff account does not grant platform access.')}</li>
      <li>{text('Named operator account and multi-factor authentication are required.')}</li>
      <li>{text('No public operator registration or local password recovery is available.')}</li>
    </ul>
    <Link className="operator-link" to="/login">{text('Company sign in')}</Link>
  </OperatorShell>;
}

export function OperatorCallback() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const text = useOperatorText();
  // Remove untrusted authorization response material before rendering any links.
  useEffect(() => {
    rejectOperatorCallback();
    void clearOperatorSession(queryClient).catch(() => undefined);
  }, [queryClient]);
  if (location.search || location.hash) return <Navigate to="/platform/callback" replace />;
  return <OperatorShell title="Platform sign in">
    <section className="operator-notice" role="alert">
      <h2>{text('Sign-in response rejected')}</h2>
      <p>{text('This sign-in response cannot be verified. No platform session was created. Return to platform sign in.')}</p>
    </section>
    <Link className="operator-link" to="/platform/login">{text('Return to platform sign in')}</Link>
  </OperatorShell>;
}

export function OperatorSecurity() {
  const queryClient = useQueryClient();
  const text = useOperatorText();
  const [status, setStatus] = useState<'idle' | 'pending' | 'cleared' | 'error'>('idle');
  async function clear() {
    if (status === 'pending') return;
    setStatus('pending');
    try { await clearOperatorSession(queryClient); setStatus('cleared'); }
    catch { setStatus('error'); }
  }
  return <OperatorShell title="Platform security">
    <section className="operator-notice" aria-labelledby="operator-no-session">
      <h2 id="operator-no-session">{text('No platform session')}</h2>
      <p id="operator-security-reason">{text('Multi-factor authentication and account recovery must be managed through the approved identity provider. That connection is unavailable.')}</p>
      <Button disabled aria-describedby="operator-security-reason">{text('Open security provider')}</Button>
    </section>
    <Button variant="outline" disabled={status === 'pending'} onClick={() => void clear()}>{text(status === 'pending' ? 'Clearing…' : 'Clear platform session')}</Button>
    {status === 'cleared' && <p role="status">{text('Platform data cleared from this browser. Your company session is unchanged. This does not sign you out of an identity provider.')}</p>}
    {status === 'error' && <p role="alert">{text('Platform data could not be fully cleared. Reload and try again.')}</p>}
    <Link className="operator-link" to="/platform/login">{text('Return to platform sign in')}</Link>
  </OperatorShell>;
}

/** No tenant role/Redux state can enter an operator surface. */
export function OperatorBoundary(props: { children: ReactNode }) {
  void props.children;
  return <OperatorLogin />;
}
