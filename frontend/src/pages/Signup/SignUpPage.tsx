import { useLanguage } from '@/i18n/context';
import { useForm } from 'react-hook-form';
import { useCreateManager } from './queries.js';
import { useRef, useState } from 'react';
import type { SignUpForm } from './types.js';
import { Link } from 'react-router-dom';
import BillingSetupLayout from '@/pages/Subscription/onboarding/BillingSetupLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUp() {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpForm>();
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const createManager = useCreateManager();
  const busy = createManager.isPending || isSubmitting;
  const accountCreated = createManager.isSuccess && createManager.data.sessionEstablished === false;
  const onSubmit = async (data: SignUpForm) => {
    if (submitting.current || accountCreated) return;
    submitting.current = true;
    setError(null);
    try {
      await createManager.mutateAsync(data);
    } catch (cause) {
      const message = (cause as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message === 'Manager with this email already exists' ? message : 'Account creation could not finish. Check your details and try again.');
    } finally { submitting.current = false; }
  };
  const fieldError = (name: keyof SignUpForm) => errors[name] ? <p id={`${name}-error`} role="alert" style={{ color: 'var(--billing-red)', fontSize: 14, marginBlockStart: 'var(--billing-space-xs)' }}>
    {t(errors[name]?.message ?? 'Check this field.')}
  </p> : null;
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, marginBlockEnd: 'var(--billing-space-sm)' } as const;

  return <BillingSetupLayout currentStep="account" completedSteps={[]} footer={accountCreated ? <span>{t('Card details stay with Paddle.')}</span> : undefined}>
    <section aria-labelledby="signup-heading" style={{ maxWidth: 460, marginInline: 'auto', paddingBlock: 'var(--billing-space-xl)' }}>
      <h1 id="signup-heading">{t('Create your workspace')}</h1>
      <p style={{ color: 'var(--billing-muted)', marginBlockStart: 'var(--billing-space-md)' }}>{t('Create your company owner account, then review the available plans.')}</p>
      {accountCreated ? <div role="status" style={{ display: 'grid', gap: 'var(--billing-space-lg)', marginBlockStart: 'var(--billing-space-wide)' }}>
        <p>{t('Account created. Sign in to continue.')}</p>
        <Button asChild><Link to="/login">{t('Sign in')}</Link></Button>
      </div> : <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={busy} style={{ marginBlockStart: 'var(--billing-space-wide)' }}>
        <fieldset disabled={busy} style={{ display: 'grid', gap: 'var(--billing-space-panel)', margin: 0, padding: 0, border: 0, minWidth: 0 }}>
          <div>
            <label htmlFor="name" style={labelStyle}>{t('Full Name')}</label>
            <Input className="placeholder:text-[var(--billing-muted)] placeholder:opacity-100" id="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name', { required: 'Name is required', validate: (value) => value.trim().length > 0 || 'Name is required' })} placeholder={t('Your name')} />
            {fieldError('name')}
          </div>
          <div>
            <label htmlFor="companyName" style={labelStyle}>{t('Company Name')}</label>
            <Input className="placeholder:text-[var(--billing-muted)] placeholder:opacity-100" id="companyName" autoComplete="organization" aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? 'companyName-error' : undefined}
              {...register('companyName', { required: 'Company Name is required', validate: (value) => value.trim().length > 0 || 'Company Name is required' })} placeholder={t('Your company')} />
            {fieldError('companyName')}
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>{t('Email')}</label>
            <Input className="placeholder:text-[var(--billing-muted)] placeholder:opacity-100" id="email" type="email" dir="ltr" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' } })} placeholder="you@example.com" />
            {fieldError('email')}
          </div>
          <div>
            <label htmlFor="password" style={labelStyle}>{t('Password')}</label>
            <Input className="placeholder:text-[var(--billing-muted)] placeholder:opacity-100" id="password" type="password" dir="ltr" autoComplete="new-password" minLength={6} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} />
            {fieldError('password')}
          </div>
          {error ? <p role="alert" style={{ color: 'var(--billing-red)', fontSize: 14 }}>{t(error)}</p> : null}
          <Button type="submit" disabled={busy} style={{ width: '100%' }}>{t(busy ? 'Creating…' : 'Create account & choose plan')}</Button>
        </fieldset>
        <p style={{ marginBlockStart: 'var(--billing-space-xl)', fontSize: 14, color: 'var(--billing-muted)' }}>
          {t('Already have an account?')} <Link to="/login">{t('Log in')}</Link>
        </p>
      </form>}
    </section>
  </BillingSetupLayout>;
}
