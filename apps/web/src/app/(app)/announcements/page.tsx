import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { longDate } from '@/lib/format';
import { createAnnouncement, deleteAnnouncement } from '../actions';
import { Megaphone, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const AUDIENCE = ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS'];

export default async function AnnouncementsPage() {
  const institutionId = getSession()!.institutionId;
  const items = await db.announcement.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Announcements</h1>
        <p className="text-slate-500 text-sm">Broadcast notices to your institution.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Composer */}
        <form action={createAnnouncement} className="lg:col-span-1 h-fit space-y-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Megaphone size={18} className="text-brand-600" /> New announcement</h2>
          <input name="title" required placeholder="Title"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
          <textarea name="body" required rows={4} placeholder="Write your message…"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
          <label className="block text-sm text-slate-600">Audience
            <select name="audience" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
              {AUDIENCE.map((a) => <option key={a} value={a}>{a[0] + a.slice(1).toLowerCase()}</option>)}
            </select>
          </label>
          <button className="w-full py-2 rounded-lg bg-brand-600 text-white text-sm">Publish</button>
        </form>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-3">
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <Megaphone className="mx-auto mb-2 text-slate-300" /> No announcements yet.
            </div>
          )}
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">{a.audience}</span>
                    {' · '}{a.authorName ?? 'Admin'} · {longDate(a.createdAt)}
                  </p>
                </div>
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-slate-300 hover:text-danger"><Trash2 size={16} /></button>
                </form>
              </div>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
