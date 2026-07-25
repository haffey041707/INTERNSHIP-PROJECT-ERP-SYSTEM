import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileQuestion,
  FileText,
  GraduationCap,
  Headphones,
  MessageCircle,
  MessagesSquare,
  PlayCircle,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const categories = [
  {
    title: 'Getting Started',
    text: 'Learn the basics of using the ERP workspace, dashboard, records, and daily tools.',
    articles: 0,
    href: '/modules/help-centre/getting-started',
    icon: <Sparkles size={20} strokeWidth={2.25} />,
    accent: 'from-violet-600 to-fuchsia-500',
  },
  {
    title: 'Internships',
    text: 'Guides for internship records, approvals, tasks, evaluations, and certificates.',
    articles: 0,
    href: '/modules/help-centre/internships',
    icon: <GraduationCap size={20} strokeWidth={2.25} />,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Training',
    text: 'Understand training programmes, batches, submissions, and learner progress.',
    articles: 0,
    href: '/modules/help-centre/training',
    icon: <BookOpen size={20} strokeWidth={2.25} />,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Payments & Billing',
    text: 'Payment methods, invoices, fee collection, failed payments, and receipts.',
    articles: 0,
    href: '/modules/help-centre/payments-and-billing',
    icon: <CreditCard size={20} strokeWidth={2.25} />,
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    title: 'Certificates',
    text: 'Certificate generation, verification, release rules, and download support.',
    articles: 0,
    href: '/modules/help-centre/certificates',
    icon: <ShieldCheck size={20} strokeWidth={2.25} />,
    accent: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Account & Settings',
    text: 'Manage account access, password changes, Google login, and profile settings.',
    articles: 0,
    href: '/modules/help-centre/account-and-settings',
    icon: <Settings size={20} strokeWidth={2.25} />,
    accent: 'from-purple-600 to-indigo-500',
  },
];

const articles: string[] = [];

const options = [
  { title: 'FAQs', text: 'Quick answers to common questions.', icon: <FileQuestion size={18} strokeWidth={2.25} />, href: '/modules/help-centre/faq-library', accent: 'from-violet-600 to-fuchsia-500' },
  { title: 'Video Guides', text: 'Step-by-step visual walkthroughs.', icon: <PlayCircle size={18} strokeWidth={2.25} />, href: '/modules/help-centre/video-guides', accent: 'from-emerald-500 to-teal-500' },
  { title: 'Community', text: 'Ask questions and learn from others.', icon: <MessagesSquare size={18} strokeWidth={2.25} />, href: '/community', accent: 'from-sky-500 to-cyan-500' },
  { title: 'Report an Issue', text: 'Tell us what is not working.', icon: <MessageCircle size={18} strokeWidth={2.25} />, href: '/modules/help-centre/report-an-issue', accent: 'from-amber-500 to-orange-500' },
];

const popularSearches = [
  'Reset password',
  'Create account',
  'Google login issue',
  'Payment failed',
  'Certificate download',
  'Submit task',
  'Upload documents',
  'Internship approval',
  'Contact support',
  'Change profile',
];

export default function HelpCentrePage() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="hover:text-brand-600">Home</Link>
              <ChevronRight size={14} />
              <span className="text-slate-600">Help Centre</span>
            </div>
            <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_300px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Knowledge base</p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Help Centre</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Find answers, solve issues, and learn how to use the ERP system with simple guides and support paths.
                </p>
              </div>
              <ChatVisual />
            </div>
          </div>

          <aside className="border-t border-slate-900 bg-[#0F172A] p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-slate-900 bg-[#0F172A] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950">Still need help?</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Our support team can assist you with account, payment, and system issues.</p>
                </div>
                <IconBadge accent="from-violet-600 to-fuchsia-500">
                  <Headphones size={21} strokeWidth={2.25} />
                </IconBadge>
              </div>
              <SupportVisual />
              <Link href="/support" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                Contact support <ArrowRight size={15} />
              </Link>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Average response within 24 hours
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-900 bg-[#0F172A] p-4 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">How can we help you?</h2>
        <form action="/search" className="mt-3 flex min-w-0 gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-900 bg-slate-950/70 px-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-500">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              name="q"
              placeholder="Search reset password, payments, certificates, submissions..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button className="grid h-11 w-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700" aria-label="Search help">
            <Search size={18} />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-brand-600 px-3 py-1.5 font-semibold text-white shadow-sm">Popular guides</span>
          {popularSearches.map((item) => (
            <Link key={item} href={`/search?q=${encodeURIComponent(item)}`} className="rounded-full border border-slate-900 bg-slate-950/70 px-3 py-1.5 font-medium text-slate-300 shadow-sm hover:text-white">
              {item}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <main className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Browse by categories</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-950">Choose what you need help with</h2>
              </div>
              <Link href="/modules/help-centre/all-categories" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                View all categories <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((item) => (
                <Link key={item.title} href={item.href} className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300">
                  <IconBadge accent={item.accent}>{item.icon}</IconBadge>
                  <h3 className="mt-4 text-sm font-extrabold text-slate-950">{item.title}</h3>
                  <p className="mt-2 min-h-16 text-xs leading-5 text-slate-500">{item.text}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-brand-600">
                    <span>{item.articles} published articles</span>
                    <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <IconBadge accent="from-violet-600 to-fuchsia-500" compact>
                <FileText size={17} strokeWidth={2.25} />
              </IconBadge>
              <h2 className="text-lg font-extrabold text-slate-950">Popular articles</h2>
            </div>
            {articles.length > 0 ? (
              <>
                <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {articles.map((article) => (
                    <Link key={article} href={`/modules/help-centre/${slugify(article)}`} className="flex min-w-0 items-center gap-3 px-3 py-3 text-sm transition hover:bg-slate-50">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                        <FileText size={14} />
                      </span>
                      <span className="min-w-0 flex-1 break-words font-medium text-slate-700">{article}</span>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
                <Link href="/modules/help-centre/all-articles" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-white">
                  View all articles <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No published articles yet. Search guides are available above.
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-950">Help options</h2>
            <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {options.map((item) => (
                <Link key={item.title} href={item.href} className="flex items-center gap-3 px-3 py-3 transition hover:bg-slate-50">
                  <IconBadge accent={item.accent} compact>{item.icon}</IconBadge>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-4 text-slate-500">{item.text}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <IconBadge accent="from-emerald-500 to-teal-500">
                <ShieldCheck size={22} strokeWidth={2.25} />
              </IconBadge>
              <div>
                <h2 className="text-base font-extrabold text-emerald-950">We are here to help</h2>
                <p className="mt-1 text-sm leading-5 text-emerald-800/75">Your success is our priority. Search guides first or contact support when you need direct assistance.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div
      className="erp-main-visual-frame hidden w-full max-w-[300px] shadow-[0_22px_55px_rgba(76,29,149,.18)] lg:block"
      style={{
        borderRadius: 22,
        clipPath: 'inset(0 round 22px)',
        overflow: 'hidden',
        WebkitClipPath: 'inset(0 round 22px)',
      }}
    >
      <img
        src="/images/help-centre-main-rounded.png?v=1"
        alt=""
        className="erp-main-visual-image w-full object-contain object-center"
        style={{
          borderRadius: 22,
          clipPath: 'inset(0 round 22px)',
          overflow: 'hidden',
          WebkitClipPath: 'inset(0 round 22px)',
        }}
      />
    </div>
  );
}

function SupportVisual() {
  return (
    <div className="mt-4 rounded-2xl border border-slate-900 bg-slate-950/70 p-4">
      <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-slate-800 bg-[#0F172A] shadow-[0_16px_35px_rgba(2,6,23,.24)]">
        <span className="absolute inset-3 rounded-full bg-slate-900/80" />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#0F172A] text-white shadow-[0_14px_28px_rgba(2,6,23,.34)] ring-1 ring-slate-700">
          <span className="absolute inset-px rounded-[15px] bg-[linear-gradient(135deg,rgba(148,163,184,.22),rgba(255,255,255,0)_48%,rgba(2,6,23,.20))]" />
          <Headphones size={30} strokeWidth={2.2} className="relative" />
        </span>
      </div>
      <div className="mx-auto mt-3 flex max-w-36 items-center justify-center gap-1 rounded-full border border-slate-800 bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm">
        <Send size={13} /> Support ready
      </div>
    </div>
  );
}

function IconBadge({ children, accent, compact = false }: { children: ReactNode; accent: string; compact?: boolean }) {
  return (
    <span className={`relative isolate grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br ${accent} text-white shadow-[0_14px_30px_rgba(15,23,42,.16)] ring-1 ring-white/70 ${compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12 rounded-2xl'}`}>
      <span className="absolute inset-px rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,.36),rgba(255,255,255,0)_46%,rgba(15,23,42,.10))]" />
      <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/25 blur-sm" />
      <span className="relative drop-shadow-sm">{children}</span>
    </span>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
