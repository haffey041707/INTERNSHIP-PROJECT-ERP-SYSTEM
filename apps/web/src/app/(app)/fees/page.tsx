import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { collectPayment } from '../actions';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
  const institutionId = getSession()!.institutionId;
  const invoices = await db.feeInvoice.findMany({
    where: { institutionId },
    include: { student: true },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  });

  const billed = invoices.reduce((n, i) => n + i.amountCents, 0);
  const collected = invoices.reduce((n, i) => n + i.paidCents, 0);
  const outstanding = billed - collected;
  const fmt = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Fees</h1>
      <p className="text-slate-500 text-sm mb-4">Collecting a payment updates the database immediately.</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Billed" value={fmt(billed)} />
        <Stat label="Collected" value={fmt(collected)} accent />
        <Stat label="Outstanding" value={fmt(outstanding)} />
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-400 text-left">
            <tr><th className="px-4 py-3">Student</th><th>Invoice</th><th>Amount</th><th>Paid</th><th>Status</th><th className="text-right px-4">Action</th></tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{i.student.firstName} {i.student.lastName}</td>
                <td className="text-slate-500">{i.title}</td>
                <td>{fmt(i.amountCents)}</td>
                <td>{fmt(i.paidCents)}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === 'PAID' ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'}`}>
                    {i.status}
                  </span>
                </td>
                <td className="text-right px-4 py-2">
                  {i.status !== 'PAID' ? (
                    <form action={collectPayment} className="inline-flex items-center gap-1">
                      <input type="hidden" name="invoiceId" value={i.id} />
                      <select name="method" className="px-2 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-900">
                        <option value="CASH">Cash</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
                      </select>
                      <button className="px-2.5 py-1 rounded-md bg-brand-600 text-white text-xs">Collect</button>
                    </form>
                  ) : <span className="text-xs text-slate-400">Settled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-xl p-4 shadow-sm ${accent ? 'bg-aurora text-white' : 'bg-white border border-slate-200'}`}>
    <p className={`text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
    <p className="text-xl font-bold">{value}</p></div>;
}
