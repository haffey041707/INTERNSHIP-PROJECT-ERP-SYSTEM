'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, School, CalendarDays, CheckSquare, FileText, CreditCard,
  HeartHandshake, Megaphone, BarChart3, Settings, Bell, Search, ChevronDown, LogOut, UserCog,
  UserPlus, ClipboardList, Briefcase, Library, Bus, Building2, Package, ShoppingCart, Archive,
  Files, CalendarCheck, LifeBuoy, Menu, X,
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';

const SUITE_NAV = [
  { type: 'SCHOOL', href: '/school', icon: School, label: 'School ERP' },
  { type: 'COLLEGE', href: '/colleges', icon: GraduationCap, label: 'College ERP' },
  { type: 'UNIVERSITY', href: '/university', icon: Building2, label: 'University ERP' },
  { type: 'INSTITUTE', href: '/institutes', icon: ClipboardList, label: 'Institute ERP' },
];

const BASE_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/students', icon: Users, label: 'Students' },
  { href: '/admissions', icon: UserPlus, label: 'Admissions' },
  { href: '/teachers', icon: GraduationCap, label: 'Teachers' },
  { href: '/classes', icon: School, label: 'Classes' },
  { href: '/curriculum', icon: ClipboardList, label: 'Curriculum' },
  { href: '/timetable', icon: CalendarDays, label: 'Timetable' },
  { href: '/attendance', icon: CheckSquare, label: 'Attendance' },
  { href: '/exams', icon: FileText, label: 'Exams' },
  { href: '/fees', icon: CreditCard, label: 'Fees' },
  { href: '/parents', icon: HeartHandshake, label: 'Parents' },
  { href: '/hr', icon: Briefcase, label: 'HR & Payroll' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/hostel', icon: Building2, label: 'Hostel' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/procurement', icon: ShoppingCart, label: 'Procurement' },
  { href: '/assets', icon: Archive, label: 'Assets' },
  { href: '/documents', icon: Files, label: 'Documents' },
  { href: '/calendar', icon: CalendarCheck, label: 'Calendar' },
  { href: '/help-desk', icon: LifeBuoy, label: 'Help Desk' },
  { href: '/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/reports', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface Notif { id: string; title: string; audience: string; when: string }
interface User { name: string; email: string; role: string; institutionCode: string; institutionName: string; institutionType: string }

export function AppShell({ user, notifications, children }:
  { user: User; notifications: Notif[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<null | 'bell' | 'profile'>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const selectedSuite = SUITE_NAV.find((item) => item.type === user.institutionType.toUpperCase()) ?? SUITE_NAV[0];
  const nav = [BASE_NAV[0], selectedSuite, ...BASE_NAV.slice(1)];

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
  }, [pathname]);

  return (
    <div className="h-[100svh] flex overflow-hidden">
      {/* Sidebar — fixed; its nav scrolls internally if long */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 hidden lg:flex lg:flex-col h-[100svh]">
        <div className="h-14 flex items-center gap-2 px-4 font-extrabold text-brand-700 shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-aurora text-white"><GraduationCap size={18} /></span> EduNexus
        </div>
        <nav className="px-2 py-2 space-y-1 overflow-y-auto flex-1">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                  ${active ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-100 text-xs text-slate-400 shrink-0">
          {user.institutionName}<br />ID {user.institutionCode}
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col bg-white border-r border-slate-200 shadow-2xl">
            <div className="h-14 flex items-center justify-between gap-3 px-4 font-extrabold text-brand-700 shrink-0 border-b border-slate-200">
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-aurora text-white shrink-0"><GraduationCap size={18} /></span>
                <span className="truncate">EduNexus</span>
              </span>
              <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <nav className="px-2 py-2 space-y-1 overflow-y-auto flex-1">
              {nav.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                      ${active ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <Icon size={18} className="shrink-0" /> <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-100 text-xs text-slate-400 shrink-0">
              <span className="block truncate">{user.institutionName}</span>
              <span>ID {user.institutionCode}</span>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 bg-white border-b border-slate-200 relative z-30">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 lg:hidden shrink-0">
            <Menu size={18} />
          </button>

          {/* Global search */}
          <form action="/search" className="h-9 min-w-0 flex-[1_1_100%] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 focus-within:ring-2 focus-within:ring-brand-500">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input name="q" placeholder="Search students, staff, modules..." autoComplete="off"
              className="min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full" />
          </form>

          <Link href="/insights" title="Insights" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aurora text-white hover:opacity-90">
            <BarChart3 size={16} />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setMenu(menu === 'bell' ? null : 'bell')} className="relative text-slate-500 hover:text-brand-600 p-1">
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] grid place-items-center rounded-full bg-danger text-white">{notifications.length}</span>
              )}
            </button>
            {menu === 'bell' && (
              <Dropdown onClose={() => setMenu(null)}>
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                  <Link href="/announcements" onClick={() => setMenu(null)} className="text-xs text-brand-600">View all</Link>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
                ) : notifications.map((n) => (
                  <Link key={n.id} href="/announcements" onClick={() => setMenu(null)}
                    className="block px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <p className="text-sm text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400">{n.audience} · {n.when}</p>
                  </Link>
                ))}
              </Dropdown>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setMenu(menu === 'profile' ? null : 'profile')} className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-full bg-brand-200 grid place-items-center text-brand-800 text-sm font-semibold">{initials}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {menu === 'profile' && (
              <Dropdown onClose={() => setMenu(null)}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.institutionName} · {user.role.replace('_', ' ').toLowerCase()}</p>
                </div>
                <Link href="/settings" onClick={() => setMenu(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><UserCog size={16} /> Settings</Link>
                <Link href="/login" onClick={() => setMenu(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Users size={16} /> Switch account</Link>
                <form action={logoutAction} className="border-t border-slate-100">
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 w-full"><LogOut size={16} /> Log out</button>
                </form>
              </Dropdown>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-slate-100">
          <div key={pathname} className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Small dropdown with a click-away backdrop. */
function Dropdown({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div ref={ref} className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
        {children}
      </div>
    </>
  );
}
