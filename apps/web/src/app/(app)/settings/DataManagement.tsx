'use client';

import { useFormStatus } from 'react-dom';
import { Database, Trash2 } from 'lucide-react';
import { loadSampleData, clearInstitutionData } from '../actions';

function LoadBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm disabled:opacity-60">
      <Database size={16} /> {pending ? 'Loading…' : 'Load sample data'}
    </button>
  );
}
function ClearBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-danger text-danger text-sm hover:bg-red-50 disabled:opacity-60">
      <Trash2 size={16} /> {pending ? 'Clearing…' : 'Clear all data'}
    </button>
  );
}

export function DataManagement() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Populate with a realistic dataset</p>
          <p className="text-xs text-slate-500">Adds classes, teachers, students, attendance, fees and exams. It’s your data — edit or clear it anytime.</p>
        </div>
        <form action={loadSampleData}><LoadBtn /></form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/40 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Clear all data</p>
          <p className="text-xs text-slate-500">Permanently removes every record in this institution. Your account stays.</p>
        </div>
        <form action={clearInstitutionData}
          onSubmit={(e) => { if (!confirm('Delete ALL records for this institution? This cannot be undone.')) e.preventDefault(); }}>
          <ClearBtn />
        </form>
      </div>
    </div>
  );
}
