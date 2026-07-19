'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const COLORS = ['#6C4CF1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444'];

interface Point {
  name: string;
  value?: number;
  revenue?: number;
  collected?: number;
  pending?: number;
  students?: number;
  attendance?: number;
  present?: number;
  absent?: number;
  score?: number;
}

export function DashboardCharts({
  revenue,
  studentGrowth,
  attendance,
  coursePopularity,
  genderDistribution,
  feesCollection,
  examPerformance,
  studentStatus,
}: {
  revenue: Point[];
  studentGrowth: Point[];
  attendance: Point[];
  coursePopularity: Point[];
  genderDistribution: Point[];
  feesCollection: Point[];
  examPerformance: Point[];
  studentStatus: Point[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <ChartCard title="Revenue" sub="Monthly revenue" className="xl:col-span-8">
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={42} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="revenue" stroke="#6C4CF1" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="collected" stroke="#06B6D4" strokeWidth={3} dot={false} />
            <Legend iconType="circle" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Course Popularity" sub="Enrollment share" className="xl:col-span-4">
        <ResponsiveContainer width="100%" height={270}>
          <PieChart>
            <Pie data={coursePopularity} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
              {coursePopularity.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Student Growth" sub="Admissions by month" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={studentGrowth}>
            <defs>
              <linearGradient id="studentGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C4CF1" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#6C4CF1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={34} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="students" stroke="#6C4CF1" strokeWidth={3} fill="url(#studentGrowth)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Attendance" sub="Daily attendance" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attendance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={34} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="attendance" fill="#6C4CF1" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Fees Collection" sub="Collected vs pending" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={feesCollection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={40} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
            <Bar dataKey="collected" stackId="fees" fill="#6C4CF1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" stackId="fees" fill="#D8D1FF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Exam Performance" sub="Average by skill" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={examPerformance}>
            <PolarGrid stroke="#EDE9FE" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
            <Radar dataKey="score" stroke="#6C4CF1" fill="#6C4CF1" fillOpacity={0.24} strokeWidth={2} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Gender Distribution" sub="Profile balance" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={245}>
          <PieChart>
            <Pie data={genderDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
              {genderDistribution.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Student Status" sub="Active, inactive, graduated, suspended" className="xl:col-span-6">
        <ResponsiveContainer width="100%" height={245}>
          <PieChart>
            <Pie data={studentStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
              {studentStatus.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, sub, className = '', children }: { title: string; sub: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{sub}</p>
        </div>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">Live</span>
      </div>
      {children}
    </section>
  );
}

const tooltipStyle = {
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
};
