'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { forgotPasswordAction } from '../login/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}
    className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition disabled:opacity-60">
    {pending ? 'Sending…' : 'Send reset link'}</button>;
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, null as any);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-slate-200 p-8 space-y-4">
        <Link href="/login" className="text-sm text-slate-500">← Back to sign in</Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1>
        <p className="text-sm text-slate-500">Enter your account email and we’ll send you a link to reset your password.</p>

        {state?.ok ? (
          <div className="space-y-3">
            <p className="text-sm bg-green-50 text-success rounded-lg px-3 py-2">{state.message}</p>
            {state.devLink && (
              <div className="text-xs bg-amber-50 text-amber-800 rounded-lg px-3 py-2 break-all">
                <b>Dev mode (no email service configured):</b> use this link to reset:
                <br /><Link href={state.devLink.replace(/^https?:\/\/[^/]+/, '')} className="underline text-brand-600">{state.devLink}</Link>
              </div>
            )}
            <Link href="/login" className="block text-center text-sm text-brand-600">Return to sign in</Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <label className="block"><span className="text-sm text-slate-600">Email</span>
              <input name="email" type="email" required placeholder="you@institution.edu"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>
            <SubmitButton />
          </form>
        )}
      </div>
    </div>
  );
}
