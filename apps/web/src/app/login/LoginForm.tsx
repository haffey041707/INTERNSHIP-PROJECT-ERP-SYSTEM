'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}
      className="auth-bar auth-submit-button grid w-full place-items-center rounded-lg bg-brand-600 text-sm text-white font-medium hover:bg-brand-700 transition disabled:opacity-60">
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export function LoginForm({ google }: { google: boolean }) {
  const [state, formAction] = useFormState(loginAction, null as { error?: string } | null);

  return (
    <div className="w-full space-y-2.5">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Sign in</h2>
        <p className="hidden text-xs text-slate-500 sm:block">Access your institution workspace.</p>
      </div>

      {state?.error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}

      <form action={formAction} className="space-y-2.5">
        <label className="block">
          <span className="text-xs text-slate-600">Email</span>
          <input name="email" type="email" placeholder="you@institution.edu" autoComplete="email" required
            className="auth-bar mt-1 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
        </label>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Password</span>
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
          </div>
          <input name="password" type="password" autoComplete="current-password" required
            className="auth-bar mt-1 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>

        <SubmitButton />
      </form>

      <div className="hidden items-center gap-3 text-[11px] text-slate-400 sm:flex">
        <span className="h-px bg-slate-200 flex-1" /> Social sign in <span className="h-px bg-slate-200 flex-1" />
      </div>

      <OAuthButtons google={google} />

      <p className="text-[11px] text-center text-slate-500 sm:text-xs">
        Don’t have an account?{' '}
        <Link href="/signup" className="text-brand-600 font-medium hover:underline">Create your institution</Link>
      </p>
    </div>
  );
}

function OAuthButtons({ google }: { google: boolean }) {
  return (
    <div className="space-y-2.5">
      <OAuthButton provider="google" label="Continue with Google" enabled={google} icon={<GoogleIcon />} />
    </div>
  );
}

function OAuthButton({ provider, label, enabled, icon }:
  { provider: string; label: string; enabled: boolean; icon: React.ReactNode }) {
  if (!enabled) {
    return (
      <a href={`/api/auth/${provider}`}
        title={`${label} is not configured yet`}
        className="auth-bar oauth-provider-button relative flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 shadow-sm opacity-85 transition hover:bg-slate-50 hover:border-slate-400">
        <span className="absolute left-3.5 flex items-center">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a href={`/api/auth/${provider}`}
      title={label}
      className="auth-bar relative flex items-center justify-center gap-3 w-full rounded-lg border border-slate-300
        oauth-provider-button bg-white text-sm font-medium text-slate-700 shadow-sm transition
        hover:bg-slate-50 hover:border-slate-400 active:scale-[.99]">
      <span className="absolute left-3.5 flex items-center">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

/** Authentic Google "G" mark. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
