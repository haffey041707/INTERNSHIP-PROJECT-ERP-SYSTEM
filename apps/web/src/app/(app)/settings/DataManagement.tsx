'use client';

import { useFormStatus } from 'react-dom';
import { Database, Trash2 } from 'lucide-react';
import { loadSampleData, clearInstitutionData } from '../actions';

function LoadBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
      <Database size={16} /> {pending ? 'Loading...' : 'Load sample data'}
    </button>
  );
}
function ClearBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/20 disabled:opacity-60">
      <Trash2 size={16} /> {pending ? 'Clearing...' : 'Clear all data'}
    </button>
  );
}

export function DataManagement() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white">Populate workspace records</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Adds classes, teachers, students, attendance, fees, and exams. Edit or clear the records anytime.</p>
        </div>
        <form action={loadSampleData}><LoadBtn /></form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white">Clear workspace records</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Permanently removes every record in this institution. Your account stays.</p>
        </div>
        <form action={clearInstitutionData}
          onSubmit={(e) => { if (!confirm('Delete ALL records for this institution? This cannot be undone.')) e.preventDefault(); }}>
          <ClearBtn />
        </form>
      </div>
    </div>
  );
}
