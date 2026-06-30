'use client';

import Link from 'next/link';
import { GraduationCap, Check } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { signupAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}
    className="auth-bar auth-submit-button grid w-full place-items-center rounded-lg bg-brand-600 text-sm text-white font-medium hover:bg-brand-700 transition disabled:opacity-60">
    {pending ? 'Creating your workspace…' : 'Create institution'}</button>;
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, null as { error?: string } | null);

  return (
    <div className="premium-login min-h-[100svh] grid lg:grid-cols-[1.05fr_.95fr] bg-white">
      <div className="premium-brand-panel hidden lg:flex flex-col justify-between p-8 bg-aurora text-white border-r border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-2xl font-extrabold"><GraduationCap size={26} /> EduNexus</div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Create your institution workspace.</h1>
          <p className="mt-3 max-w-md text-sm text-white/80">Set up the profile, admin account, and workspace in one clean step.</p>
          <ul className="mt-5 space-y-2 text-white/85 text-sm">
            <li className="flex items-center gap-2"><Check size={16} className="shrink-0" /> Your own private, isolated workspace</li>
            <li className="flex items-center gap-2"><Check size={16} className="shrink-0" /> A unique Institution ID</li>
            <li className="flex items-center gap-2"><Check size={16} className="shrink-0" /> Students, attendance, exams &amp; fees out of the box</li>
          </ul>
        </div>
        <p className="text-white/60 text-sm">No credit card required.</p>
      </div>

      <div className="flex flex-col items-center justify-center overflow-y-auto p-2 sm:p-5">
        <div className="login-mobile-brand mb-1.5 flex items-center gap-2 text-base font-extrabold lg:hidden">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-aurora text-white"><GraduationCap size={16} /></span>
          EduNexus
        </div>
        <form action={formAction} className="premium-auth-card w-full max-w-[390px] space-y-2.5 glass rounded-2xl border border-white/50 p-3 sm:p-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">Create institution</h2>
            <p className="hidden text-xs text-slate-500 sm:block">Register the workspace and admin account.</p>
          </div>
          {state?.error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}

          <div className="grid gap-2.5 sm:grid-cols-2">
            <Field name="name" label="Institution name" placeholder="Greenfield College" required />
            <label className="block"><span className="text-xs text-slate-600">Type</span>
              <select name="type" className="auth-bar mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500">
                <option value="SCHOOL">School</option><option value="COLLEGE">College</option>
                <option value="UNIVERSITY">University</option><option value="INSTITUTE">Institute</option>
              </select></label>
            <Field name="adminName" label="Your name" placeholder="Jane Principal" required />
            <Field name="email" label="Admin email" type="email" placeholder="you@institution.edu" autoComplete="email" required />
            <Field name="password" label="Password" type="password" placeholder="min 6 chars" required />
            <Field name="confirm" label="Confirm" type="password" required />
          </div>

          <SubmitButton />
          <p className="text-[11px] text-center text-slate-500 sm:text-xs">
            Already have an account? <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, autoComplete, required }:
  { name: string; label: string; type?: string; placeholder?: string; autoComplete?: string; required?: boolean }) {
  return <label className="block"><span className="text-xs text-slate-600">{label}</span>
    <input name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required}
      className="auth-bar mt-1 w-full px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>;
}
