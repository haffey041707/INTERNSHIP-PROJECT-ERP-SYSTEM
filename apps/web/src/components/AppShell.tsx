'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap, FileText, Settings, Bell, Search, ChevronDown, LogOut, UserCog,
  ClipboardList, Briefcase, Library, Bus, Building2, LifeBuoy, Menu, X, Users,
  LayoutDashboard, ChevronLeft, CalendarDays, ClipboardCheck, CreditCard, BarChart3,
  BookOpen, UserPlus, School, Presentation,
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';
import { switchAccountAction } from '@/app/(app)/account/actions';
import { CloseInteractivePanels } from '@/components/CloseInteractivePanels';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { MAIN_WORKSPACES } from '@/lib/main-workspaces';

const NAV_ICONS = {
  colleges: Building2,
  university: GraduationCap,
  internship: Briefcase,
  training: GraduationCap,
  programmes: ClipboardList,
  submissions: FileText,
  certificates: FileText,
  transport: Bus,
  hostel: Building2,
  library: Library,
  support: LifeBuoy,
  community: Users,
  'help-centre': LifeBuoy,
  settings: Settings,
};

interface Notif { id: string; title: string; audience: string; when: string }
interface User { name: string; email: string; role: string; institutionCode: string; institutionName: string; institutionType: string }
interface AvailableAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  institutionCode: string;
  institutionName: string;
  institutionType: string;
  current: boolean;
}
type NavItem = { id: string; href: string; icon: LucideIcon; label: string };
type NavGroup = { title: string; items: NavItem[] };

const DESK_ITEM_IDS = new Set(['school', 'colleges', 'university', 'institutes']);

const ACTIVE_ROUTE_PREFIXES: Record<string, string[]> = {
  admissions: ['/modules/school/admissions-and-sis', '/modules/colleges/admissions-and-enrollment'],
  students: ['/modules/school/student-records', '/modules/colleges/students-and-semester-records', '/modules/university/student-registry'],
  teachers: ['/modules/colleges/lecturers-and-departments', '/modules/university/lecturers-and-academic-affairs'],
  classes: ['/modules/school/academics-and-classes'],
  attendance: ['/modules/school/attendance-and-behaviour'],
  exams: ['/modules/school/exams-and-report-cards'],
  fees: ['/modules/school/fees-and-campus-services', '/modules/colleges/fees-and-student-services', '/modules/university/fees-and-receivables'],
  parents: ['/modules/school/parent-and-guardian-portal'],
  'institute-leads': ['/modules/institutes/lead-and-enrollment-crm'],
  'institute-courses': ['/modules/institutes/course-and-batch-delivery'],
  'institute-trainers': ['/modules/institutes/trainer-operations'],
  'institute-assessments': ['/modules/institutes/assessment-and-submissions'],
  'institute-revenue': ['/modules/institutes/revenue-and-certification'],
  'institute-branches': ['/modules/institutes/branch-and-support'],
};

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + '/');
}

function navMatchScore(pathname: string, item: NavItem) {
  if (item.id === 'dashboard') return pathname === '/dashboard' ? 100_000 : -1;
  if (pathname === item.href) return 90_000 + item.href.length;
  if (pathname.startsWith(item.href + '/')) return 80_000 + item.href.length;

  const explicitPrefix = (ACTIVE_ROUTE_PREFIXES[item.id] ?? [])
    .filter((route) => matchesRoute(pathname, route))
    .sort((a, b) => b.length - a.length)[0];
  if (explicitPrefix) return 70_000 + explicitPrefix.length;

  const modulePrefix = `/modules/${item.id}`;
  if (!DESK_ITEM_IDS.has(item.id) && matchesRoute(pathname, modulePrefix)) {
    return 60_000 + modulePrefix.length;
  }

  return -1;
}

function getActiveNavItem(pathname: string, navGroups: NavGroup[]) {
  return navGroups
    .flatMap((group) => group.items)
    .map((item) => ({ item, score: navMatchScore(pathname, item) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.item;
}

function groupedNav(nav: NavItem[]): NavGroup[] {
  const pick = (ids: string[]) => nav.filter((item) => ids.includes(item.id));
  return [
    { title: 'Command', items: pick(['dashboard', 'school', 'colleges', 'university', 'institutes', 'institute-leads', 'institute-courses', 'institute-trainers', 'internship', 'training', 'programmes']) },
    { title: 'Academic', items: pick(['students', 'teachers', 'admissions', 'classes', 'attendance', 'timetable', 'curriculum', 'exams', 'institute-assessments']) },
    { title: 'Records', items: pick(['submissions', 'certificates', 'fees', 'institute-revenue', 'transport', 'hostel', 'library', 'parents']) },
    { title: 'Support', items: pick(['reports', 'institute-branches', 'support', 'community', 'help-centre', 'settings']) },
  ].filter((group) => group.items.length);
}

function workspaceNav(): NavItem[] {
  return [
    { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ...MAIN_WORKSPACES
      .filter((workspace) => !['school', 'institutes'].includes(workspace.slug))
      .map((workspace) => ({
        id: workspace.slug,
        href: workspace.href,
        icon: NAV_ICONS[workspace.slug as keyof typeof NAV_ICONS] ?? ClipboardList,
        label: workspace.title,
      })),
  ];
}

function schoolNav(): NavItem[] {
  return [
    { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'school', href: '/school', icon: School, label: 'School Desk' },
    { id: 'students', href: '/students', icon: Users, label: 'Students' },
    { id: 'teachers', href: '/teachers', icon: UserCog, label: 'Teachers' },
    { id: 'admissions', href: '/admissions', icon: UserPlus, label: 'Admissions' },
    { id: 'classes', href: '/classes', icon: Building2, label: 'Classes' },
    { id: 'attendance', href: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { id: 'timetable', href: '/timetable', icon: CalendarDays, label: 'Timetable' },
    { id: 'curriculum', href: '/curriculum', icon: BookOpen, label: 'Curriculum' },
    { id: 'exams', href: '/exams', icon: FileText, label: 'Exams' },
    { id: 'fees', href: '/fees', icon: CreditCard, label: 'Fees' },
    { id: 'parents', href: '/parents', icon: Users, label: 'Parents' },
    { id: 'transport', href: '/transport', icon: Bus, label: 'Transport' },
    { id: 'hostel', href: '/hostel', icon: Building2, label: 'Hostel' },
    { id: 'library', href: '/library', icon: Library, label: 'Library' },
    { id: 'reports', href: '/reports', icon: BarChart3, label: 'Reports' },
    { id: 'help-centre', href: '/help-centre', icon: LifeBuoy, label: 'Help Centre' },
    { id: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
  ];
}

function instituteNav(): NavItem[] {
  return [
    { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'institutes', href: '/institutes', icon: Presentation, label: 'Institute Desk' },
    { id: 'institute-leads', href: '/modules/institutes/lead-and-enrollment-crm', icon: UserPlus, label: 'Lead & Enrollment CRM' },
    { id: 'institute-courses', href: '/modules/institutes/course-and-batch-delivery', icon: ClipboardList, label: 'Courses & Batches' },
    { id: 'institute-trainers', href: '/modules/institutes/trainer-operations', icon: UserCog, label: 'Trainer Operations' },
    { id: 'students', href: '/students', icon: Users, label: 'Learners' },
    { id: 'teachers', href: '/teachers', icon: UserCog, label: 'Trainers' },
    { id: 'training', href: '/training', icon: GraduationCap, label: 'Training' },
    { id: 'programmes', href: '/programmes', icon: ClipboardList, label: 'Programmes' },
    { id: 'institute-assessments', href: '/modules/institutes/assessment-and-submissions', icon: FileText, label: 'Assessments' },
    { id: 'submissions', href: '/submissions', icon: FileText, label: 'Submissions' },
    { id: 'certificates', href: '/certificates', icon: FileText, label: 'Certificates' },
    { id: 'institute-revenue', href: '/modules/institutes/revenue-and-certification', icon: CreditCard, label: 'Revenue & Certification' },
    { id: 'fees', href: '/fees', icon: CreditCard, label: 'Payments' },
    { id: 'institute-branches', href: '/modules/institutes/branch-and-support', icon: Building2, label: 'Branch & Support' },
    { id: 'support', href: '/support', icon: LifeBuoy, label: 'Support' },
    { id: 'community', href: '/community', icon: Users, label: 'Community' },
    { id: 'help-centre', href: '/help-centre', icon: LifeBuoy, label: 'Help Centre' },
    { id: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
  ];
}

function higherEducationNav(type: string): NavItem[] {
  const isUniversity = type.toUpperCase() === 'UNIVERSITY';
  const desk: NavItem = isUniversity
    ? { id: 'university', href: '/university', icon: GraduationCap, label: 'University Desk' }
    : { id: 'colleges', href: '/colleges', icon: Building2, label: 'College Desk' };

  return [
    { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    desk,
    { id: 'students', href: '/students', icon: Users, label: 'Students' },
    { id: 'teachers', href: '/teachers', icon: UserCog, label: 'Lecturers' },
    { id: 'fees', href: '/fees', icon: CreditCard, label: isUniversity ? 'Fees & Receivables' : 'Fees' },
    ...MAIN_WORKSPACES
      .filter((workspace) => !['school', 'colleges', 'university', 'institutes'].includes(workspace.slug))
      .map((workspace) => ({
        id: workspace.slug,
        href: workspace.href,
        icon: NAV_ICONS[workspace.slug as keyof typeof NAV_ICONS] ?? ClipboardList,
        label: workspace.title,
      })),
  ];
}

function navForInstitution(type: string): NavItem[] {
  const normalized = type.toUpperCase();
  if (normalized === 'SCHOOL') return schoolNav();
  if (normalized === 'COLLEGE' || normalized === 'UNIVERSITY') return higherEducationNav(normalized);
  if (normalized === 'INSTITUTE') return instituteNav();
  return workspaceNav();
}

export function AppShell({ user, availableAccounts, notifications, children }:
  { user: User; availableAccounts: AvailableAccount[]; notifications: Notif[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<null | 'bell' | 'profile'>(null);
  const [profileView, setProfileView] = useState<'menu' | 'accounts'>('menu');
  const [mobileOpen, setMobileOpen] = useState(false);
  const bellMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const terms = getInstitutionTerminology(user.institutionType);
  const nav = navForInstitution(terms.type);
  const navGroups = groupedNav(nav);

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
    setProfileView('menu');
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!menu && !mobileOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (mobileOpen && mobilePanelRef.current && !mobilePanelRef.current.contains(target)) {
        setMobileOpen(false);
      }

      if (menu === 'bell' && bellMenuRef.current && !bellMenuRef.current.contains(target)) {
        setMenu(null);
        setProfileView('menu');
      }

      if (menu === 'profile' && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setMenu(null);
        setProfileView('menu');
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [menu, mobileOpen]);

  return (
    <div className="h-[100svh] flex overflow-hidden">
      <CloseInteractivePanels />
      {/* Sidebar — fixed; its nav scrolls internally if long */}
      <aside className="premium-sidebar hidden h-[100svh] min-h-0 w-[17rem] shrink-0 lg:flex lg:flex-col">
        <SidebarContent user={user} navGroups={navGroups} pathname={pathname} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 bg-white border-b border-slate-200 relative z-30">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 sm:h-9 sm:w-9 lg:hidden shrink-0">
            <Menu size={18} />
          </button>

          {/* Global search */}
          <form action="/search" className="h-8 min-w-0 flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 focus-within:ring-2 focus-within:ring-brand-500 sm:h-9 sm:gap-2 sm:px-3">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input name="q" placeholder={`Search ${terms.learners.toLowerCase()}, ${terms.educators.toLowerCase()}, modules...`} autoComplete="off"
              className="min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full" />
          </form>

          <Link href="/submissions" title="Submissions" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aurora text-white hover:opacity-90 sm:h-9 sm:w-9">
            <FileText size={16} />
          </Link>

          {/* Notifications */}
          <div ref={bellMenuRef} className="relative">
            <button onClick={() => setMenu(menu === 'bell' ? null : 'bell')} className="relative text-slate-500 hover:text-brand-600 p-1">
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] grid place-items-center rounded-full bg-danger text-white">{notifications.length}</span>
              )}
            </button>
            {menu === 'bell' && (
              <Dropdown
                onClose={() => {
                  setMenu(null);
                  setProfileView('menu');
                }}
              >
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
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              aria-expanded={menu === 'profile'}
              aria-label="Open account menu"
              onClick={() => {
                const willOpen = menu !== 'profile';
                setMenu(willOpen ? 'profile' : null);
                if (willOpen) setProfileView('menu');
              }}
              className="premium-profile-trigger"
            >
              <span className="premium-profile-avatar">{initials}</span>
              <ChevronDown
                size={14}
                className={`premium-profile-chevron ${menu === 'profile' ? 'is-open' : ''}`}
              />
            </button>
            {menu === 'profile' && (
              <Dropdown
                onClose={() => {
                  setMenu(null);
                  setProfileView('menu');
                }}
              >
                {profileView === 'accounts' ? (
                  <AccountSwitcherPanel
                    accounts={availableAccounts}
                    onBack={() => setProfileView('menu')}
                  />
                ) : (
                  <div className="account-menu-panel">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">{user.institutionName} · {user.role.replace('_', ' ').toLowerCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileView('accounts')}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Users size={16} /> Switch account
                    </button>
                    <form action={logoutAction} className="border-t border-slate-100">
                      <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 w-full"><LogOut size={16} /> Log out</button>
                    </form>
                  </div>
                )}
              </Dropdown>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 p-4 sm:p-6">
          <div key={pathname} className="page-enter">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <div className="mobile-drawer-layer fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="mobile-drawer-backdrop absolute inset-0 bg-slate-950/80"
            onPointerDown={(event) => {
              event.preventDefault();
              setMobileOpen(false);
            }}
          />
          <aside ref={mobilePanelRef} className="premium-sidebar mobile-drawer-panel absolute inset-y-0 left-0 flex min-h-0 w-[min(78vw,18rem)] flex-col shadow-2xl">
            <div className="premium-mobile-close">
              <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20">
                <X size={18} />
              </button>
            </div>
            <SidebarContent
              user={user}
              navGroups={navGroups}
              pathname={pathname}
              onNavigate={() => window.setTimeout(() => setMobileOpen(false), 120)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function AccountSwitcherPanel({
  accounts,
  onBack,
}: {
  accounts: AvailableAccount[];
  onBack: () => void;
}) {
  return (
    <div className="account-switch-panel max-h-[26rem] overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
        <button
          type="button"
          aria-label="Back to account menu"
          onClick={onBack}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft size={17} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Available accounts</p>
          <p className="text-xs text-slate-500">Choose an account in this workspace.</p>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {accounts.map((account) => (
          <form key={account.id} action={switchAccountAction}>
            <input type="hidden" name="targetUserId" value={account.id} />
            <button
              type="submit"
              disabled={account.current}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                account.current
                  ? 'border-brand-200 bg-brand-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-slate-50'
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                {account.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{account.name}</span>
                <span className="block truncate text-xs text-slate-500">{account.email}</span>
                <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-normal text-slate-400">
                  {account.institutionName} · {account.provider}
                </span>
              </span>
              {account.current && (
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-1 text-[10px] font-bold uppercase text-brand-700">
                  Current
                </span>
              )}
            </button>
          </form>
        ))}
      </div>

    </div>
  );
}

function SidebarContent({
  user,
  navGroups,
  pathname,
  onNavigate,
}: {
  user: User;
  navGroups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const activeItem = getActiveNavItem(pathname, navGroups);

  return (
    <>
      <div className="premium-sidebar-brand">
        <span className="premium-sidebar-logo">
          <GraduationCap size={20} />
        </span>
        <div className="min-w-0">
          <p className="premium-sidebar-name">EduNexus</p>
          <p className="premium-sidebar-subtitle">{activeItem?.label ?? 'ERP'} workspace</p>
        </div>
      </div>

      <div className="premium-sidebar-chip">
        <span className="premium-sidebar-chip-dot" />
        <span className="truncate">{activeItem?.label ?? 'Dashboard'}</span>
      </div>

      <nav className="premium-sidebar-nav" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.title} className="premium-sidebar-group">
            <p className="premium-sidebar-group-title">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                    className={`premium-nav-link ${active ? 'is-active' : ''}`}
                  >
                    <span className="premium-nav-icon">
                      <Icon size={18} />
                    </span>
                    <span className="premium-nav-label">{item.label}</span>
                    <span className="premium-nav-signal" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="premium-sidebar-bottom">
        <div className="premium-sidebar-footer">
          <span className="premium-sidebar-footer-mark">{user.institutionName.charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <p className="premium-sidebar-footer-name">{user.institutionName}</p>
            <p className="premium-sidebar-footer-code">ID {user.institutionCode}</p>
          </div>
        </div>
      </div>
    </>
  );
}

/** Small dropdown with a click-away backdrop. */
function Dropdown({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="premium-dropdown absolute right-0 z-50 mt-2 w-72 max-w-[85vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      {children}
    </div>
  );
}
