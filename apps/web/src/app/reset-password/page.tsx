'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { resetPasswordAction } from '../login/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}
    className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition disabled:opacity-60">
    {pending ? 'Updating…' : 'Set new password'}</button>;
}

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const [state, formAction] = useFormState(resetPasswordAction, null as { error?: string } | null);
  const token = searchParams.token ?? '';

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-slate-200 p-8 space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Choose a new password</h1>
        {!token && <p className="text-sm bg-red-50 text-danger rounded-lg px-3 py-2">Missing reset token. Request a new link.</p>}
        {state?.error && <p className="text-sm bg-red-50 text-danger rounded-lg px-3 py-2">{state.error}</p>}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <label className="block"><span className="text-sm text-slate-600">New password</span>
            <input name="password" type="password" required minLength={6} placeholder="min 6 chars"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>
          <label className="block"><span className="text-sm text-slate-600">Confirm password</span>
            <input name="confirm" type="password" required minLength={6}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>
          <SubmitButton />
        </form>
        <Link href="/login" className="block text-center text-sm text-slate-500">Back to sign in</Link>
      </div>
    </div>
  );
}
