'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Archive, BarChart3, Bell, BookOpen, Briefcase, Building2, Bus, CalendarCheck, CalendarDays,
  CheckSquare, ChevronDown, ClipboardList, CreditCard, FileBadge2, FileText, Files, GraduationCap,
  HelpCircle, Home, LayoutDashboard, Library, LogOut, Mail, Menu, MessageSquare, Moon, Package,
  PanelLeftClose, PanelLeftOpen, Plus, ReceiptText, Search, Settings, ShieldCheck, ShoppingCart,
  Sparkles, Sun, UserCog, UserPlus, Users, WalletCards, X,
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';
import { getInstitutionTerminology } from '@/lib/institution-terminology';

const SUITE_NAV = [
  { type: 'SCHOOL', href: '/school', icon: Home, label: 'School ERP' },
  { type: 'COLLEGE', href: '/colleges', icon: GraduationCap, label: 'College ERP' },
  { type: 'UNIVERSITY', href: '/university', icon: Building2, label: 'University ERP' },
  { type: 'INSTITUTE', href: '/institutes', icon: ClipboardList, label: 'Institute ERP' },
];

const ERP_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/students', icon: Users, label: 'Students' },
  { href: '/teachers', icon: GraduationCap, label: 'Staff' },
  { href: '/admissions', icon: UserPlus, label: 'Admissions' },
  { href: '/curriculum', icon: BookOpen, label: 'Courses' },
  { href: '/classes', icon: Home, label: 'Classes' },
  { href: '/attendance', icon: CheckSquare, label: 'Attendance' },
  { href: '/exams', icon: FileText, label: 'Examinations' },
  { href: '/modules/academics/assignments', icon: ClipboardList, label: 'Assignments' },
  { href: '/fees', icon: WalletCards, label: 'Finance' },
  { href: '/fees', icon: CreditCard, label: 'Payments' },
  { href: '/modules/finance/accounting', icon: ReceiptText, label: 'Accounting' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/hostel', icon: Building2, label: 'Hostel' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/hr', icon: Briefcase, label: 'HR' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/reports', icon: Files, label: 'Reports' },
  { href: '/insights', icon: BarChart3, label: 'Analytics' },
  { href: '/announcements', icon: Bell, label: 'Notifications' },
  { href: '/help-desk', icon: MessageSquare, label: 'Messages' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/documents', icon: Files, label: 'Documents' },
  { href: '/modules/documents/certificates', icon: FileBadge2, label: 'Certificates' },
  { href: '/help-desk', icon: HelpCircle, label: 'Support' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface Notif { id: string; title: string; audience: string; when: string }
interface User { name: string; email: string; role: string; institutionCode: string; institutionName: string; institutionType: string }

export function AppShell({ user, notifications, children }:
  { user: User; notifications: Notif[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<null | 'bell' | 'profile' | 'quick'>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [themeDark, setThemeDark] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const selectedSuite = SUITE_NAV.find((item) => item.type === user.institutionType.toUpperCase()) ?? SUITE_NAV[0];
  const terms = getInstitutionTerminology(user.institutionType);

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('erp-dark', themeDark);
  }, [themeDark]);

  const nav = useMemo(() => {
    const items = [ERP_NAV[0], selectedSuite, ...ERP_NAV.slice(1)].map((item) => ({
      ...item,
      label: terms.nav[item.href] ?? item.label,
    }));
    const q = navQuery.trim().toLowerCase();
    return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
  }, [navQuery, selectedSuite, terms.nav]);

  const quickActions = [
    { href: '/students/new', label: terms.addLearner, icon: UserPlus },
    { href: '/teachers/new', label: terms.addEducator, icon: GraduationCap },
    { href: '/admissions', label: 'New Admission', icon: ShieldCheck },
    { href: '/classes', label: `Create ${terms.group}`, icon: BookOpen },
    { href: '/fees', label: 'Add Payment', icon: CreditCard },
    { href: '/attendance', label: 'Mark Attendance', icon: CheckSquare },
    { href: '/exams/new', label: 'Upload Results', icon: FileText },
    { href: '/reports', label: 'Generate Report', icon: BarChart3 },
    { href: '/modules/documents/certificates', label: 'Issue Certificate', icon: FileBadge2 },
    { href: '/announcements', label: 'Send Notification', icon: Bell },
  ];

  return (
    <div className="erp-shell h-[100svh] overflow-hidden bg-[#F7F8FC] text-slate-950">
      <DesktopSidebar
        collapsed={collapsed}
        nav={nav}
        pathname={pathname}
        navQuery={navQuery}
        setNavQuery={setNavQuery}
        institutionName={user.institutionName}
        institutionCode={user.institutionCode}
      />

      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebar
            nav={nav}
            pathname={pathname}
            navQuery={navQuery}
            setNavQuery={setNavQuery}
            institutionName={user.institutionName}
            institutionCode={user.institutionCode}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className={`erp-main flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ${collapsed ? 'lg:pl-[88px]' : 'lg:pl-[292px]'}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/86 px-3 py-3 shadow-[0_8px_28px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden">
              <Menu size={18} />
            </button>
            <button type="button" aria-label="Collapse sidebar" onClick={() => setCollapsed((value) => !value)}
              className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-600 lg:grid">
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <form action="/search" className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(108,76,241,0.08)]">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input name="q" placeholder={`Search ${terms.learners.toLowerCase()}, ${terms.educators.toLowerCase()}, invoices, documents...`} autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </form>

            <div className="hidden items-center gap-2 xl:flex">
              <select aria-label="Academic year" className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none">
                <option>2026-2027</option>
                <option>2025-2026</option>
              </select>
              <select aria-label="Branch" className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none">
                <option>Main Branch</option>
                <option>North Campus</option>
                <option>Online</option>
              </select>
            </div>

            <IconLink href="/calendar" title="Calendar"><CalendarCheck size={17} /></IconLink>
            <IconLink href="/help-desk" title="Messages"><Mail size={17} /></IconLink>
            <button type="button" title="Theme" onClick={() => setThemeDark((value) => !value)}
              className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-600 sm:grid">
              {themeDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="relative">
              <button onClick={() => setMenu(menu === 'bell' ? null : 'bell')} className="relative grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-600">
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">{notifications.length}</span>
                )}
              </button>
              {menu === 'bell' && (
                <Dropdown onClose={() => setMenu(null)}>
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    <Link href="/announcements" onClick={() => setMenu(null)} className="text-xs font-medium text-violet-600">View all</Link>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p>
                  ) : notifications.map((n) => (
                    <Link key={n.id} href="/announcements" onClick={() => setMenu(null)}
                      className="block border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-violet-50/60">
                      <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{n.audience} - {n.when}</p>
                    </Link>
                  ))}
                </Dropdown>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setMenu(menu === 'quick' ? null : 'quick')}
                className="hidden h-10 items-center gap-2 rounded-2xl bg-violet-600 px-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(108,76,241,0.24)] transition hover:bg-violet-700 md:flex">
                <Plus size={16} /> Quick Add
              </button>
              {menu === 'quick' && (
                <Dropdown onClose={() => setMenu(null)} wide>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    {quickActions.map(({ href, label, icon: Icon }) => (
                      <Link key={label} href={href} onClick={() => setMenu(null)}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><Icon size={16} /></span>
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                </Dropdown>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setMenu(menu === 'profile' ? null : 'profile')} className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 pr-2 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">{initials}</span>
                <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
              </button>
              {menu === 'profile' && (
                <Dropdown onClose={() => setMenu(null)}>
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-400">{user.institutionName} - {user.role.replace('_', ' ').toLowerCase()}</p>
                  </div>
                  <Link href="/settings" onClick={() => setMenu(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><UserCog size={16} /> Settings</Link>
                  <Link href="/login" onClick={() => setMenu(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Users size={16} /> Switch account</Link>
                  <form action={logoutAction} className="border-t border-slate-100">
                    <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Log out</button>
                  </form>
                </Dropdown>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#F7F8FC] p-4 sm:p-6">
          <div key={pathname} className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DesktopSidebar({
  collapsed, nav, pathname, navQuery, setNavQuery, institutionName, institutionCode,
}: {
  collapsed: boolean;
  nav: Array<{ href: string; icon: React.ElementType; label: string }>;
  pathname: string;
  navQuery: string;
  setNavQuery: (value: string) => void;
  institutionName: string;
  institutionCode: string;
}) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white/94 shadow-[12px_0_40px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col ${collapsed ? 'w-[88px]' : 'w-[292px]'}`}>
      <div className="flex h-20 shrink-0 items-center gap-3 px-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-[0_14px_30px_rgba(108,76,241,0.26)]"><GraduationCap size={21} /></span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-950">EduNexus</p>
            <p className="truncate text-xs font-medium text-slate-400">Enterprise ERP</p>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
            <Search size={15} className="text-slate-400" />
            <input value={navQuery} onChange={(event) => setNavQuery(event.target.value)} placeholder="Search menu"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
        </div>
      )}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {nav.map((item, index) => <NavItem key={`${item.href}-${item.label}-${index}`} item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} collapsed={collapsed} />)}
      </nav>
      <div className="m-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><Sparkles size={17} /></span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{institutionName}</p>
              <p className="truncate text-xs text-slate-400">ID {institutionCode}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function MobileSidebar({
  nav, pathname, navQuery, setNavQuery, institutionName, institutionCode, onClose,
}: {
  nav: Array<{ href: string; icon: React.ElementType; label: string }>;
  pathname: string;
  navQuery: string;
  setNavQuery: (value: string) => void;
  institutionName: string;
  institutionCode: string;
  onClose: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,22rem)] flex-col border-r border-slate-200 bg-white shadow-2xl">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-100 px-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-600 text-white"><GraduationCap size={19} /></span>
          <span className="truncate font-extrabold text-slate-950">EduNexus</span>
        </span>
        <button type="button" aria-label="Close navigation" onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-500">
          <X size={18} />
        </button>
      </div>
      <div className="px-4 py-3">
        <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
          <Search size={15} className="text-slate-400" />
          <input value={navQuery} onChange={(event) => setNavQuery(event.target.value)} placeholder="Search menu"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {nav.map((item, index) => <NavItem key={`${item.href}-${item.label}-${index}`} item={item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />)}
      </nav>
      <div className="border-t border-slate-100 p-4 text-xs text-slate-400">
        <span className="block truncate font-medium text-slate-700">{institutionName}</span>
        <span>ID {institutionCode}</span>
      </div>
    </aside>
  );
}

function NavItem({ item, active, collapsed }: { item: { href: string; icon: React.ElementType; label: string }; active: boolean; collapsed?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition
        ${active ? 'bg-violet-600 text-white shadow-[0_12px_28px_rgba(108,76,241,0.24)]' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}
        ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function IconLink({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <Link href={href} title={title} className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:text-violet-600 sm:grid">
      {children}
    </Link>
  );
}

function Dropdown({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
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
      <div ref={ref} className={`absolute right-0 z-50 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] ${wide ? 'w-[min(92vw,34rem)]' : 'w-80 max-w-[88vw]'}`}>
        {children}
      </div>
    </>
  );
}
