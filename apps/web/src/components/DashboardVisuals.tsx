import type { ReactNode } from 'react';

interface AttendancePoint {
  date: string;
  pct: number;
  present: number;
  absent: number;
  late: number;
  has: boolean;
}

interface FinancePoint {
  label: string;
  billed: number;
  collected: number;
}

interface GrowthPoint {
  label: string;
  count: number;
}

interface PerformancePoint {
  range: string;
  count: number;
}

interface StatusPoint {
  name: string;
  value: number;
}

interface DashboardVisualsProps {
  attendance: AttendancePoint[];
  finance: FinancePoint[];
  growth: GrowthPoint[];
  performance: PerformancePoint[];
  feeStatus: StatusPoint[];
  workspaceStatus: StatusPoint[];
  collectedPct: number;
}

const colors = {
  navy: '#0F172A',
  canvas: 'rgba(255, 255, 255, 0.045)',
  line: 'rgba(226, 232, 240, 0.16)',
  axis: '#CBD5E1',
  muted: '#94A3B8',
  cyan: '#38BDF8',
  blue: '#2563EB',
  teal: '#14B8A6',
  green: '#22C55E',
  gold: '#EAB308',
  violet: '#8B5CF6',
  orange: '#F97316',
  red: '#EF4444',
  white: '#F8FAFC',
};

function maxOf(...values: number[]) {
  return Math.max(1, ...values.map((value) => (Number.isFinite(value) ? value : 0)));
}

function sum(items: number[]) {
  return items.reduce((total, item) => total + item, 0);
}

function hasAny(values: number[]) {
  return values.some((value) => value > 0);
}

function formatNumber(value: number) {
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}m`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

function linePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return linePath(points);
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;
    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function areaPath(points: Array<{ x: number; y: number }>, bottom: number) {
  if (!points.length) return '';
  const last = points[points.length - 1];
  const first = points[0];
  return `${smoothPath(points)} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function gridLines({ x, y, width, height, rows = 4 }: { x: number; y: number; width: number; height: number; rows?: number }) {
  return Array.from({ length: rows + 1 }, (_, index) => {
    const lineY = y + (height / rows) * index;
    return (
      <line
        key={index}
        x1={x}
        x2={x + width}
        y1={lineY}
        y2={lineY}
        stroke={colors.line}
        strokeDasharray={index === rows ? '0' : '5 8'}
      />
    );
  });
}

function Card({ title, subtitle, children, className = '' }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-slate-700 bg-[#0F172A] p-3 text-white shadow-[0_14px_42px_rgba(2,6,23,.24)] ${className}`}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="break-words text-sm font-extrabold text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-300">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-300">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function EmptyPlot({
  graphName,
  label,
  type = 'axis',
  className = '',
}: {
  graphName: string;
  label: string;
  type?: 'axis' | 'donut' | 'radar' | 'pipeline' | 'gauge';
  className?: string;
}) {
  if (type === 'donut') {
    return (
      <svg data-dashboard-graph={graphName} viewBox="0 0 240 250" className="h-40 w-full max-w-full">
        <rect x="10" y="10" width="220" height="230" rx="22" fill={colors.canvas} />
        <circle cx="120" cy="100" r="52" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="18" />
        <circle cx="120" cy="100" r="32" fill="rgba(15,23,42,.76)" />
        <text x="120" y="98" textAnchor="middle" fill={colors.white} fontSize="25" fontWeight="800">0</text>
        <text x="120" y="119" textAnchor="middle" fill={colors.axis} fontSize="11" fontWeight="700">records</text>
        <text x="120" y="185" textAnchor="middle" fill={colors.axis} fontSize="13" fontWeight="800">No invoices yet</text>
        <text x="120" y="205" textAnchor="middle" fill={colors.muted} fontSize="11">Add fee records</text>
      </svg>
    );
  }

  if (type === 'radar') {
    const center = { x: 310, y: 160 };
    const levels = [44, 74, 104];
    const axes = [0, 72, 144, 216, 288].map((angle) => polarPoint(center.x, center.y, 104, angle));
    return (
      <svg data-dashboard-graph={graphName} viewBox="0 0 620 330" className="h-44 w-full">
        <rect x="10" y="10" width="600" height="310" rx="24" fill={colors.canvas} />
        {levels.map((radius) => {
          const points = [0, 72, 144, 216, 288].map((angle) => polarPoint(center.x, center.y, radius, angle));
          return <polygon key={radius} points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={colors.line} />;
        })}
        {axes.map((point, index) => <line key={index} x1={center.x} y1={center.y} x2={point.x} y2={point.y} stroke={colors.line} />)}
        <circle cx={center.x} cy={center.y} r="5" fill={colors.gold} />
        <text x={center.x} y="292" textAnchor="middle" fill={colors.axis} fontSize="13" fontWeight="800">{label}</text>
      </svg>
    );
  }

  if (type === 'pipeline') {
    return (
      <svg data-dashboard-graph={graphName} viewBox="0 0 620 330" className="h-44 w-full">
        <rect x="10" y="10" width="600" height="310" rx="24" fill={colors.canvas} />
        <line x1="90" x2="530" y1="165" y2="165" stroke={colors.line} strokeWidth="8" strokeLinecap="round" />
        {[90, 236, 383, 530].map((x, index) => (
          <g key={x}>
            <circle cx={x} cy="165" r="18" fill="rgba(255,255,255,.08)" stroke={colors.line} />
            <text x={x} y="221" textAnchor="middle" fill={colors.axis} fontSize="12">{['Draft', 'Review', 'Approved', 'Closed'][index]}</text>
          </g>
        ))}
        <text x="310" y="286" textAnchor="middle" fill={colors.axis} fontSize="13" fontWeight="800">{label}</text>
      </svg>
    );
  }

  if (type === 'gauge') {
    return (
      <svg data-dashboard-graph={graphName} viewBox="0 0 260 190" className="h-32 w-full">
        <path d={arcPath(130, 142, 82, -110, 110)} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="18" strokeLinecap="round" />
        <text x="130" y="130" textAnchor="middle" fill={colors.white} fontSize="30" fontWeight="800">0%</text>
        <text x="130" y="154" textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{label}</text>
      </svg>
    );
  }

  const width = 760;
  const height = 330;
  const pad = { left: 58, right: 30, top: 40, bottom: 58 };
  const graphW = width - pad.left - pad.right;
  const graphH = height - pad.top - pad.bottom;

  return (
    <svg data-dashboard-graph={graphName} viewBox={`0 0 ${width} ${height}`} className={`h-44 w-full ${className}`}>
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
      {gridLines({ x: pad.left, y: pad.top, width: graphW, height: graphH })}
      {[100, 75, 50, 25, 0].map((tick, index) => (
        <text key={tick} x={pad.left - 14} y={pad.top + (graphH / 4) * index + 4} textAnchor="end" fill={colors.muted} fontSize="11">{tick}</text>
      ))}
      <line x1={pad.left} x2={pad.left + graphW} y1={pad.top + graphH} y2={pad.top + graphH} stroke={colors.axis} strokeOpacity=".42" />
      <text x={width / 2} y="154" textAnchor="middle" fill={colors.white} fontSize="16" fontWeight="800">{label}</text>
      <text x={width / 2} y="178" textAnchor="middle" fill={colors.muted} fontSize="12">No live records yet</text>
    </svg>
  );
}

function RevenueGraph({ data }: { data: FinancePoint[] }) {
  const width = 840;
  const height = 360;
  const pad = { left: 68, right: 34, top: 42, bottom: 58 };
  const graphW = width - pad.left - pad.right;
  const graphH = height - pad.top - pad.bottom;
  const max = maxOf(...data.flatMap((item) => [item.billed, item.collected]));
  const gap = graphW / Math.max(1, data.length);
  const barW = Math.min(34, gap * 0.22);
  const collectedPoints = data.map((item, index) => {
    const center = pad.left + gap * index + gap / 2;
    const y = pad.top + graphH - (item.collected / max) * graphH;
    return { x: center, y };
  });

  if (!hasAny(data.flatMap((item) => [item.billed, item.collected]))) {
    return <EmptyPlot graphName="revenue" label="No finance data yet" className="lg:h-[19rem] xl:h-[22rem] 2xl:h-[24rem]" />;
  }

  return (
    <>
      <svg data-dashboard-graph="revenue" viewBox={`0 0 ${width} ${height}`} className="h-48 w-full lg:h-[19rem] xl:h-[22rem] 2xl:h-[24rem]">
        <defs>
          <linearGradient id="revenue-billed" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.violet} />
            <stop offset="100%" stopColor={colors.blue} />
          </linearGradient>
          <linearGradient id="revenue-collected" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.teal} />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
          <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.gold} stopOpacity=".24" />
            <stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
        {gridLines({ x: pad.left, y: pad.top, width: graphW, height: graphH })}
        {[0, 1, 2, 3, 4].map((step) => {
          const value = Math.round(max - (max / 4) * step);
          return (
            <text key={step} x={pad.left - 14} y={pad.top + (graphH / 4) * step + 4} textAnchor="end" fill={colors.muted} fontSize="11">
              {formatNumber(value)}
            </text>
          );
        })}
        <path d={areaPath(collectedPoints, pad.top + graphH)} fill="url(#revenue-area)" />
        {data.map((item, index) => {
          const center = pad.left + gap * index + gap / 2;
          const billedH = item.billed ? Math.max(8, (item.billed / max) * graphH) : 0;
          const collectedH = item.collected ? Math.max(8, (item.collected / max) * graphH) : 0;
          return (
            <g key={item.label}>
              <rect x={center - barW - 5} y={pad.top + graphH - billedH} width={barW} height={billedH} rx="10" fill="url(#revenue-billed)" />
              <rect x={center + 5} y={pad.top + graphH - collectedH} width={barW} height={collectedH} rx="10" fill="url(#revenue-collected)" />
              <text x={center} y={height - 25} textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{item.label}</text>
            </g>
          );
        })}
        <path d={smoothPath(collectedPoints)} fill="none" stroke={colors.gold} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {collectedPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="6" fill={colors.gold} stroke={colors.navy} strokeWidth="4" />
        ))}
      </svg>
      <Legend items={[
        { label: 'Billed', color: colors.violet },
        { label: 'Collected', color: colors.teal },
        { label: 'Collection trend', color: colors.gold },
      ]} />
    </>
  );
}

function CollectionGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const endAngle = -110 + (220 * pct) / 100;

  if (!pct) {
    return <EmptyPlot graphName="collection-gauge" label="collected" type="gauge" />;
  }

  return (
    <svg data-dashboard-graph="collection-gauge" viewBox="0 0 260 190" className="h-32 w-full">
      <defs>
        <linearGradient id="collection-gauge-fill" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={colors.cyan} />
          <stop offset="100%" stopColor={colors.teal} />
        </linearGradient>
      </defs>
      <path d={arcPath(130, 142, 82, -110, 110)} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="18" strokeLinecap="round" />
      <path d={arcPath(130, 142, 82, -110, endAngle)} fill="none" stroke="url(#collection-gauge-fill)" strokeWidth="18" strokeLinecap="round" />
      {[-110, -55, 0, 55, 110].map((angle) => {
        const a = polarPoint(130, 142, 68, angle);
        const b = polarPoint(130, 142, 78, angle);
        return <line key={angle} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.axis} strokeOpacity=".5" strokeWidth="2" />;
      })}
      <text x="130" y="130" textAnchor="middle" fill={colors.white} fontSize="34" fontWeight="800">{pct}%</text>
      <text x="130" y="154" textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">collected</text>
      <text x="52" y="180" textAnchor="middle" fill={colors.muted} fontSize="11">0</text>
      <text x="208" y="180" textAnchor="middle" fill={colors.muted} fontSize="11">100</text>
    </svg>
  );
}

function AttendancePulse({ data }: { data: AttendancePoint[] }) {
  const live = data.filter((item) => item.has);
  const width = 260;
  const height = 190;
  const pad = { left: 26, right: 24, top: 30, bottom: 40 };
  const graphW = width - pad.left - pad.right;
  const graphH = height - pad.top - pad.bottom;
  const points = data.map((item, index) => ({
    x: pad.left + (graphW / Math.max(1, data.length - 1)) * index,
    y: pad.top + graphH - (item.pct / 100) * graphH,
    has: item.has,
  }));

  if (!live.length) {
    return <EmptyPlot graphName="attendance-pulse-line" label="present" type="gauge" />;
  }

  return (
    <svg data-dashboard-graph="attendance-pulse-line" viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <defs>
        <linearGradient id="attendance-pulse-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={colors.teal} stopOpacity=".34" />
          <stop offset="100%" stopColor={colors.teal} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="244" height="174" rx="20" fill={colors.canvas} />
      {[0, 1, 2].map((line) => (
        <line key={line} x1={pad.left} x2={width - pad.right} y1={pad.top + (graphH / 2) * line} y2={pad.top + (graphH / 2) * line} stroke={colors.line} strokeDasharray="4 7" />
      ))}
      <path d={areaPath(points, pad.top + graphH)} fill="url(#attendance-pulse-area)" />
      <path d={smoothPath(points)} fill="none" stroke={colors.teal} strokeWidth="5" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={point.has ? 5 : 3} fill={point.has ? colors.teal : 'rgba(255,255,255,.18)'} stroke={colors.navy} strokeWidth={point.has ? 3 : 0} />
      ))}
      <text x="130" y="157" textAnchor="middle" fill={colors.white} fontSize="28" fontWeight="800">{live[live.length - 1]?.pct ?? 0}%</text>
      <text x="130" y="174" textAnchor="middle" fill={colors.axis} fontSize="11" fontWeight="700">latest present</text>
    </svg>
  );
}

function AttendanceGraph({ data }: { data: AttendancePoint[] }) {
  const width = 700;
  const height = 330;
  const pad = { left: 50, right: 28, top: 40, bottom: 54 };
  const graphW = width - pad.left - pad.right;
  const graphH = height - pad.top - pad.bottom;
  const max = maxOf(...data.map((item) => item.present + item.absent + item.late));
  const gap = graphW / Math.max(1, data.length);
  const barW = Math.min(50, gap * 0.48);

  if (!hasAny(data.flatMap((item) => [item.present, item.absent, item.late]))) {
    return <EmptyPlot graphName="attendance-stacked-bars" label="No attendance marked yet" />;
  }

  return (
    <>
      <svg data-dashboard-graph="attendance-stacked-bars" viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
        <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
        {gridLines({ x: pad.left, y: pad.top, width: graphW, height: graphH })}
        {[0, 1, 2, 3, 4].map((step) => (
          <text key={step} x={pad.left - 13} y={pad.top + (graphH / 4) * step + 4} textAnchor="end" fill={colors.muted} fontSize="11">
            {formatNumber(Math.round(max - (max / 4) * step))}
          </text>
        ))}
        {data.map((item, index) => {
          const x = pad.left + gap * index + (gap - barW) / 2;
          const presentH = item.present ? Math.max(6, (item.present / max) * graphH) : 0;
          const lateH = item.late ? Math.max(6, (item.late / max) * graphH) : 0;
          const absentH = item.absent ? Math.max(6, (item.absent / max) * graphH) : 0;
          let y = pad.top + graphH;
          y -= presentH;
          const presentY = y;
          y -= lateH;
          const lateY = y;
          y -= absentH;
          const absentY = y;
          return (
            <g key={item.date}>
              <rect x={x} y={pad.top} width={barW} height={graphH} rx="12" fill="rgba(255,255,255,.055)" />
              <rect x={x} y={presentY} width={barW} height={presentH} rx="12" fill={colors.teal} />
              <rect x={x} y={lateY} width={barW} height={lateH} rx="12" fill={colors.gold} />
              <rect x={x} y={absentY} width={barW} height={absentH} rx="12" fill={colors.orange} />
              <text x={x + barW / 2} y={height - 25} textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{item.date}</text>
            </g>
          );
        })}
      </svg>
      <Legend items={[
        { label: 'Present', color: colors.teal },
        { label: 'Late', color: colors.gold },
        { label: 'Absent', color: colors.orange },
      ]} />
    </>
  );
}

function AreaGraph({ data }: { data: GrowthPoint[] }) {
  const width = 470;
  const height = 330;
  const pad = { left: 48, right: 28, top: 40, bottom: 54 };
  const graphW = width - pad.left - pad.right;
  const graphH = height - pad.top - pad.bottom;
  const max = maxOf(...data.map((item) => item.count));
  const points = data.map((item, index) => ({
    x: pad.left + (graphW / Math.max(1, data.length - 1)) * index,
    y: pad.top + graphH - (item.count / max) * graphH,
  }));

  if (!hasAny(data.map((item) => item.count))) {
    return <EmptyPlot graphName="admissions-growth-area" label="No admissions growth yet" />;
  }

  return (
    <svg data-dashboard-graph="admissions-growth-area" viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
      <defs>
        <linearGradient id="admissions-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={colors.teal} stopOpacity=".42" />
          <stop offset="100%" stopColor={colors.teal} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
      {gridLines({ x: pad.left, y: pad.top, width: graphW, height: graphH })}
      {[0, 1, 2, 3].map((step) => (
        <text key={step} x={pad.left - 12} y={pad.top + (graphH / 3) * step + 4} textAnchor="end" fill={colors.muted} fontSize="11">
          {formatNumber(Math.round(max - (max / 3) * step))}
        </text>
      ))}
      <path d={areaPath(points, pad.top + graphH)} fill="url(#admissions-area)" />
      <path d={smoothPath(points)} fill="none" stroke={colors.teal} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <g key={data[index].label}>
          <circle cx={point.x} cy={point.y} r="6" fill={colors.teal} stroke={colors.navy} strokeWidth="4" />
          <text x={point.x} y={height - 25} textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{data[index].label}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutGraph({ data }: { data: StatusPoint[] }) {
  const visible = data.filter((item) => item.value > 0);
  const total = sum(visible.map((item) => item.value));
  const r = 58;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (!total) {
    return <EmptyPlot graphName="fee-status-donut" label="No invoices yet" type="donut" />;
  }

  return (
    <svg data-dashboard-graph="fee-status-donut" viewBox="0 0 240 270" className="h-40 w-full max-w-full">
      <rect x="10" y="10" width="220" height="250" rx="22" fill={colors.canvas} />
      <circle cx="120" cy="96" r={r} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="18" />
      {visible.map((item, index) => {
        const dash = (item.value / total) * c;
        const strokeDasharray = `${Math.max(1, dash - 4)} ${c - dash + 4}`;
        const strokeDashoffset = -offset;
        offset += dash;
        return (
          <circle
            key={item.name}
            cx="120"
            cy="96"
            r={r}
            fill="none"
            stroke={[colors.cyan, colors.teal, colors.gold, colors.violet][index % 4]}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 120 96)"
          />
        );
      })}
      <circle cx="120" cy="96" r="34" fill="rgba(15,23,42,.76)" />
      <text x="120" y="92" textAnchor="middle" fill={colors.white} fontSize="28" fontWeight="800">{total}</text>
      <text x="120" y="114" textAnchor="middle" fill={colors.axis} fontSize="11" fontWeight="700">invoices</text>
      {visible.map((item, index) => (
        <g key={item.name} transform={`translate(46 ${180 + index * 23})`}>
          <circle cx="0" cy="0" r="5" fill={[colors.cyan, colors.teal, colors.gold, colors.violet][index % 4]} />
          <text x="12" y="4" fill={colors.axis} fontSize="11" fontWeight="700">{item.name}</text>
          <text x="150" y="4" textAnchor="end" fill={colors.white} fontSize="11" fontWeight="800">{item.value}</text>
        </g>
      ))}
    </svg>
  );
}

function RadarGraph({ data }: { data: PerformancePoint[] }) {
  const width = 620;
  const height = 330;
  const center = { x: 310, y: 162 };
  const radius = 104;
  const max = maxOf(...data.map((item) => item.count));
  const angles = data.map((_, index) => (360 / Math.max(1, data.length)) * index);
  const points = data.map((item, index) => {
    const point = polarPoint(center.x, center.y, (item.count / max) * radius, angles[index]);
    return { ...point, label: item.range, value: item.count };
  });

  if (!hasAny(data.map((item) => item.count))) {
    return <EmptyPlot graphName="exam-performance-radar" label="No exam marks yet" type="radar" />;
  }

  return (
    <svg data-dashboard-graph="exam-performance-radar" viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
      <defs>
        <radialGradient id="exam-radar-fill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={colors.gold} stopOpacity=".46" />
          <stop offset="100%" stopColor={colors.orange} stopOpacity=".12" />
        </radialGradient>
      </defs>
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
      {[36, 70, 104].map((level) => {
        const poly = angles.map((angle) => polarPoint(center.x, center.y, level, angle));
        return <polygon key={level} points={poly.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={colors.line} />;
      })}
      {angles.map((angle, index) => {
        const end = polarPoint(center.x, center.y, radius, angle);
        const label = polarPoint(center.x, center.y, radius + 26, angle);
        return (
          <g key={data[index].range}>
            <line x1={center.x} y1={center.y} x2={end.x} y2={end.y} stroke={colors.line} />
            <text x={label.x} y={label.y + 4} textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{data[index].range}</text>
          </g>
        );
      })}
      <polygon points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="url(#exam-radar-fill)" stroke={colors.gold} strokeWidth="4" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="6" fill={colors.gold} stroke={colors.navy} strokeWidth="4" />
          <text x={point.x} y={point.y - 12} textAnchor="middle" fill={colors.white} fontSize="12" fontWeight="800">{point.value}</text>
        </g>
      ))}
    </svg>
  );
}

function PipelineGraph({ data }: { data: StatusPoint[] }) {
  const width = 620;
  const height = 330;
  const max = maxOf(...data.map((item) => item.value));
  const steps = data.map((item, index) => ({
    ...item,
    x: 90 + index * (440 / Math.max(1, data.length - 1)),
    y: 165,
    r: 18 + (item.value / max) * 30,
    color: [colors.cyan, colors.violet, colors.teal, colors.gold][index % 4],
  }));

  if (!hasAny(data.map((item) => item.value))) {
    return <EmptyPlot graphName="workspace-pipeline-bubbles" label="No workspace records yet" type="pipeline" />;
  }

  return (
    <svg data-dashboard-graph="workspace-pipeline-bubbles" viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="24" fill={colors.canvas} />
      <line x1="90" x2="530" y1="165" y2="165" stroke={colors.line} strokeWidth="8" strokeLinecap="round" />
      {steps.map((step, index) => (
        <g key={step.name}>
          {index < steps.length - 1 && (
            <line x1={step.x} y1={step.y} x2={steps[index + 1].x} y2={steps[index + 1].y} stroke={step.color} strokeOpacity=".35" strokeWidth="6" strokeLinecap="round" />
          )}
          <circle cx={step.x} cy={step.y} r={step.r} fill={step.color} fillOpacity=".22" stroke={step.color} strokeWidth="4" />
          <circle cx={step.x} cy={step.y} r="8" fill={step.color} />
          <text x={step.x} y={step.y + 5} textAnchor="middle" fill={colors.white} fontSize="13" fontWeight="900">{step.value}</text>
          <text x={step.x} y="238" textAnchor="middle" fill={colors.axis} fontSize="12" fontWeight="700">{step.name}</text>
        </g>
      ))}
    </svg>
  );
}

function MetricStrip({ billed, collected, rate }: { billed: number; collected: number; rate: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-700 bg-white/5 px-2.5 py-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Billed</p>
        <p className="mt-0.5 text-base font-extrabold text-cyan-300">{formatNumber(billed)}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-white/5 px-2.5 py-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Collected</p>
        <p className="mt-0.5 text-base font-extrabold text-teal-300">{formatNumber(collected)}</p>
      </div>
      <div className="rounded-lg border border-slate-700 bg-white/5 px-2.5 py-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Rate</p>
        <p className="mt-0.5 text-base font-extrabold text-yellow-300">{rate}%</p>
      </div>
    </div>
  );
}

export function DashboardVisuals({
  attendance,
  finance,
  growth,
  performance,
  feeStatus,
  workspaceStatus,
  collectedPct,
}: DashboardVisualsProps) {
  const totalBilled = sum(finance.map((item) => item.billed));
  const totalCollected = sum(finance.map((item) => item.collected));

  return (
    <section className="space-y-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ERP analytics</p>
        <h2 className="text-lg font-extrabold text-slate-950">Graphs and visual command center</h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
          Revenue, attendance, admissions, fee status, performance, and workspace activity are drawn as real dashboard graphs.
        </p>
      </div>

      <div className="grid gap-2 xl:grid-cols-4">
        <Card title="Revenue and Fee Collection" subtitle="Grouped bars plus trend line from invoice data." className="xl:col-span-3 xl:min-h-[32rem]">
          <MetricStrip billed={totalBilled} collected={totalCollected} rate={collectedPct} />
          <div className="mt-2 lg:flex lg:min-h-[21rem] lg:items-center xl:min-h-[24rem] 2xl:min-h-[26rem]">
            <RevenueGraph data={finance} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          <Card title="Fee Collection" subtitle="Semicircle collection gauge." className="xl:aspect-square">
            <CollectionGauge value={collectedPct} />
          </Card>
          <Card title="Attendance Health" subtitle="Latest live attendance pulse." className="xl:aspect-square">
            <AttendancePulse data={attendance} />
          </Card>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Attendance Trend" subtitle="Stacked present, late, and absent bars." className="sm:col-span-2 xl:col-span-2">
          <AttendanceGraph data={attendance} />
        </Card>
        <Card title="Admissions Growth" subtitle="Area chart from learner creation dates." className="xl:aspect-square">
          <AreaGraph data={growth} />
        </Card>
        <Card title="Fee Status" subtitle="Invoice status donut from real invoices." className="xl:aspect-square">
          <DonutGraph data={feeStatus} />
        </Card>
        <Card title="Exam Performance" subtitle="Radar chart from entered marks." className="sm:col-span-2 xl:col-span-2">
          <RadarGraph data={performance} />
        </Card>
        <Card title="Workspace Activity" subtitle="Pipeline bubble chart from module records." className="sm:col-span-2 xl:col-span-2">
          <PipelineGraph data={workspaceStatus} />
        </Card>
      </div>
    </section>
  );
}
