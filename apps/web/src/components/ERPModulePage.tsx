import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ERPModulePageProps {
  title: string;
  eyebrow: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; items: string[] }>;
  moduleSlug?: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ERPModulePage({ title, eyebrow, description, stats, sections, moduleSlug }: ERPModulePageProps) {
  return (
    <div className="space-y-6">
      <div className="premium-home-hero rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/75">{description}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`rounded-xl p-4 shadow-sm ${index === 0 ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
            <p className="text-sm text-white/70">{stat.label}</p>
            <p className="text-2xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">{section.title}</h2>
              {moduleSlug && (
                <Link
                  href={`/modules/${moduleSlug}/${slugify(section.title)}`}
                  className="text-xs font-medium text-brand-600"
                >
                  Open
                </Link>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {section.items.map((item) => (
                moduleSlug ? (
                  <Link
                    key={item}
                    href={`/modules/${moduleSlug}/${slugify(item)}`}
                    className="group flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm transition hover:border-brand-400"
                  >
                    <span className="h-2 w-2 rounded-full bg-aurora shrink-0" />
                    <span className="text-slate-700">{item}</span>
                    <ArrowRight size={14} className="ml-auto text-slate-400 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                ) : (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-aurora shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
