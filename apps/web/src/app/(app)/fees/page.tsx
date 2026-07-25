import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { BarChart3, CheckCircle2, CreditCard, FileText, ShieldCheck, WalletCards } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { collectPayment } from '../actions';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const [institution, invoices] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.feeInvoice.findMany({
      where: { institutionId },
      include: { student: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);
  const isHigherEd = terms.type === 'COLLEGE' || terms.type === 'UNIVERSITY';

  const billed = invoices.reduce((n, i) => n + i.amountCents, 0);
  const collected = invoices.reduce((n, i) => n + i.paidCents, 0);
  const outstanding = billed - collected;
  const fmt = (c: number) => `$${(c / 100).toLocaleString()}`;
  const financeCopy = {
    title: terms.type === 'UNIVERSITY' ? 'Fees & Receivables Center' : terms.type === 'COLLEGE' ? 'Fees & Scholarship Center' : terms.type === 'INSTITUTE' ? 'Payments Control Center' : 'Fees Control Center',
    summary: isHigherEd
      ? 'Tuition invoices, semester dues, scholarship adjustments, payment collection, receipt tracking, outstanding balances, and student account follow-up in one modern finance desk.'
      : terms.type === 'INSTITUTE'
        ? 'Course invoices, installment plans, payment collection, receipt tracking, discounts, pending balances, and learner payment follow-up in one clean finance desk.'
        : 'Invoice creation, payment collection, receipt tracking, concessions, outstanding balances, and parent payment follow-up in one clean finance desk.',
    ledgerTitle: isHigherEd ? 'Student Account Ledger' : 'Invoice Ledger',
    quickLinks: terms.type === 'SCHOOL'
      ? [
          ['Invoice Builder', '/modules/school/fees-and-campus-services/fee-invoices'],
          ['Receipt Register', '/modules/school/fees-and-campus-services/receipt-register'],
          ['Concessions', '/modules/school/fees-and-campus-services/fee-concessions'],
        ]
      : terms.type === 'INSTITUTE'
        ? [
            ['Payment Plans', '/institutes'],
            ['Receipt Register', '/institutes'],
            ['Certification Clearance', '/institutes'],
          ]
        : [
            ['Tuition Ledger', terms.type === 'COLLEGE' ? '/colleges' : '/university'],
            ['Scholarship Review', terms.type === 'COLLEGE' ? '/colleges' : '/university'],
            ['Receivables Report', terms.type === 'COLLEGE' ? '/colleges' : '/university'],
          ],
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Finance operations</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">{financeCopy.title}</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {financeCopy.summary}
            </p>
            <div className="mt-4 grid gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              {financeCopy.quickLinks.map(([label, href]) => (
                <Link key={label} href={href} className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <FeeVisual billed={fmt(billed)} collected={fmt(collected)} outstanding={fmt(outstanding)} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat label="Invoices" value={String(invoices.length)} icon={<FileText size={18} />} tone="from-violet-600 to-fuchsia-500" />
        <Stat label="Billed" value={fmt(billed)} icon={<WalletCards size={18} />} tone="from-sky-500 to-cyan-500" />
        <Stat label="Collected" value={fmt(collected)} icon={<CheckCircle2 size={18} />} tone="from-emerald-500 to-teal-500" accent />
        <Stat label="Outstanding" value={fmt(outstanding)} icon={<BarChart3 size={18} />} tone="from-amber-500 to-orange-500" />
      </div>

      <section className="grid gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FeePanel icon={<CreditCard size={18} />} title="Collection Counter" detail={`Cash, card, online, receipt proof, cashier owner, and ${isHigherEd ? 'student account' : terms.type === 'INSTITUTE' ? 'learner payer' : 'parent payer'} record.`} tone="from-emerald-500 to-teal-500" />
        <FeePanel icon={<ShieldCheck size={18} />} title={isHigherEd ? 'Scholarship Review' : 'Concession Review'} detail="Scholarship, discount, waiver, refund, approval evidence, and policy match." tone="from-violet-600 to-fuchsia-500" />
        <FeePanel icon={<BarChart3 size={18} />} title="Balance Monitor" detail="Due, paid, part-paid, overdue, blocked service, reminder, and statement output." tone="from-amber-500 to-orange-500" />
        <FeePanel icon={<FileText size={18} />} title="Finance Reports" detail="Collection summary, outstanding list, receipt ledger, concessions, and audit export." tone="from-sky-500 to-cyan-500" />
      </section>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm md:block">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="font-bold text-white">{financeCopy.ledgerTitle}</h2>
            <p className="text-xs text-slate-400">Collecting a payment updates the database immediately.</p>
          </div>
          <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">{invoices.length} invoices</span>
        </div>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Status</th><th className="text-right px-4">Action</th></tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-t border-white/10 text-slate-100">
                <td className="px-4 py-3 font-semibold">{i.student.firstName} {i.student.lastName}</td>
                <td className="px-4 py-3 text-slate-300">{i.title}</td>
                <td className="px-4 py-3">{fmt(i.amountCents)}</td>
                <td className="px-4 py-3">{fmt(i.paidCents)}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${i.status === 'PAID' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {i.status !== 'PAID' ? (
                    <form action={collectPayment} className="inline-flex items-center gap-1">
                      <input type="hidden" name="invoiceId" value={i.id} />
                      <select name="method" className="rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-xs text-white outline-none">
                        <option value="CASH">Cash</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
                      </select>
                      <button className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400">Collect</button>
                    </form>
                  ) : <span className="text-xs text-slate-400">Settled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {invoices.map((i) => (
          <article key={i.id} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{i.student.firstName} {i.student.lastName}</p>
                <p className="mt-1 truncate text-sm text-slate-400">{i.title}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${i.status === 'PAID' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
                {i.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <MiniStat label="Amount" value={fmt(i.amountCents)} />
              <MiniStat label="Paid" value={fmt(i.paidCents)} />
            </div>
            {i.status !== 'PAID' && (
              <form action={collectPayment} className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                <input type="hidden" name="invoiceId" value={i.id} />
                <select name="method" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/8 px-2 py-2 text-xs text-white">
                  <option value="CASH">Cash</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
                </select>
                <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white">Collect</button>
              </form>
            )}
          </article>
        ))}
        {invoices.length === 0 && <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center text-sm text-slate-400 shadow-sm">No invoices yet.</div>}
      </div>
    </div>
  );
}

function FeeVisual({ billed, collected, outstanding }: { billed: string; collected: string; outstanding: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/15 text-emerald-200 sm:h-11 sm:w-11 sm:rounded-2xl">
          <CreditCard size={20} />
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/75 sm:px-3 sm:text-[11px]">Live ledger</span>
      </div>
      <div className="mt-4 space-y-3 sm:mt-5">
        {[
          ['Billed', billed, 'w-full', 'bg-sky-400'],
          ['Collected', collected, 'w-3/4', 'bg-emerald-400'],
          ['Outstanding', outstanding, 'w-1/2', 'bg-amber-400'],
        ].map(([label, value, width, color]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between gap-3 text-[11px] text-slate-300 sm:text-xs"><span>{label}</span><span className="truncate">{value}</span></div>
            <div className="h-2 rounded-full bg-white/10"><div className={`h-2 rounded-full ${width} ${color}`} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone, accent }: { label: string; value: string; icon: ReactNode; tone: string; accent?: boolean }) {
  return <div className={`rounded-xl p-3 shadow-sm sm:rounded-2xl sm:p-4 ${accent ? `bg-gradient-to-br ${tone} text-white` : 'border border-white/10 bg-[#0F172A] text-white'}`}>
    <span className={`grid h-8 w-8 place-items-center rounded-xl sm:h-9 sm:w-9 ${accent ? 'bg-white/18' : `bg-gradient-to-br ${tone}`}`}>{icon}</span>
    <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-widest text-white/55 sm:mt-3 sm:text-xs">{label}</p>
    <p className="mt-1 break-words text-lg font-extrabold sm:text-xl">{value}</p></div>;
}

function FeePanel({ icon, title, detail, tone }: { icon: ReactNode; title: string; detail: string; tone: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0F172A] p-3 shadow-sm sm:rounded-2xl sm:p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white sm:h-10 sm:w-10 sm:rounded-2xl`}>{icon}</span>
      <h2 className="mt-3 break-words text-sm font-bold text-white sm:mt-4 sm:text-base">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{detail}</p>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/8 px-3 py-2"><p className="text-[11px] text-slate-400">{label}</p><p className="truncate text-sm font-semibold text-white">{value}</p></div>;
}
