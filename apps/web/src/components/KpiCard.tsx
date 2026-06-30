import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;          // percentage change
  spark?: number[];        // mini sparkline values
  accent?: boolean;        // use aurora gradient hero style
}

export function KpiCard({ label, value, delta, spark = [], accent }: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  const max = Math.max(...spark, 1);

  return (
    <div className={`rounded-xl p-4 shadow-card ${accent ? 'bg-aurora text-white' : 'glass'}`}>
      <p className={`text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-2xl font-display font-bold">{value}</span>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium
            ${accent ? 'text-white/90' : up ? 'text-success' : 'text-danger'}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      {spark.length > 0 && (
        <svg viewBox="0 0 100 24" className="mt-3 w-full h-6">
          <polyline
            fill="none"
            stroke={accent ? 'rgba(255,255,255,.8)' : 'var(--brand-600)'}
            strokeWidth="2"
            points={spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${24 - (v / max) * 22}`).join(' ')}
          />
        </svg>
      )}
    </div>
  );
}
