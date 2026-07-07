import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { isConfigured } from '@/lib/oauth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

const BANNERS: Record<string, { kind: 'ok' | 'err'; text: string }> = {
  registered: { kind: 'ok', text: 'Account created. Please sign in.' },
  reset: { kind: 'ok', text: 'Password updated. Sign in with your new password.' },
  google_not_configured: { kind: 'err', text: 'Google sign-in is not set up yet. Add the Google client ID and secret in .env.' },
  microsoft_not_configured: { kind: 'err', text: 'Microsoft sign-in isn’t set up yet — see AUTH_SETUP.md to enable it.' },
  oauth_failed: { kind: 'err', text: 'Sign-in with that provider failed. Please try again.' },
  oauth_no_account: { kind: 'err', text: 'No institution account matches that email. Create your institution first.' },
};

export default function LoginPage({ searchParams }:
  { searchParams: { registered?: string; reset?: string; error?: string } }) {
  const key = searchParams.registered ? 'registered' : searchParams.reset ? 'reset' : searchParams.error;
  const banner = key ? BANNERS[key] : undefined;

  return (
    <div className="premium-login min-h-[100svh] grid lg:grid-cols-[1.05fr_.95fr] bg-white">
      {/* Brand panel */}
      <div className="premium-brand-panel hidden lg:flex flex-col justify-between p-8 bg-aurora text-white border-r border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-2xl font-extrabold"><GraduationCap size={26} /> EduNexus</div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">The premium ERP for modern institutions.</h1>
          <p className="mt-3 text-sm text-white/80 max-w-md">Students, teachers, attendance, exams and fees in one workspace.</p>
        </div>
        <p className="text-white/60 text-sm">Each institution gets its own isolated, private workspace.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center overflow-y-auto p-2 sm:p-5">
        <div className="login-mobile-brand mb-1.5 flex items-center gap-2 text-base font-extrabold lg:hidden">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-aurora text-white"><GraduationCap size={16} /></span>
          EduNexus
        </div>
        <div className="premium-auth-card w-full max-w-[370px] space-y-2.5 glass rounded-2xl border border-white/50 p-3 sm:p-4">
          {banner && (
            <p className={`text-sm rounded-lg px-3 py-2 ${banner.kind === 'ok' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
              {banner.text}
            </p>
          )}
          <LoginForm google={isConfigured('google')} />
        </div>
        <p className="login-legal-text mt-2 hidden max-w-[370px] text-center text-[11px] leading-4 text-slate-400 sm:block">
          By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> &amp; <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
