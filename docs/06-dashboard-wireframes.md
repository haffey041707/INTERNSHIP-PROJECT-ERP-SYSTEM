# 06 — Dashboard Wireframes

Low-fidelity ASCII wireframes for the key portals. They define layout, hierarchy, and primary actions; visual
styling follows the [design system](./07-design-system.md). All screens use the shared **AppShell** (role-aware
sidebar + topbar with global search, notifications, AI launcher, profile).

## 6.1 Shared AppShell

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] 🎓 EduNexus · DEMO-001        🔍 Search…        🔔3   🤖 AI   ◐ theme  ⓜ▼ │  topbar
├──────────┬───────────────────────────────────────────────────────────────────┤
│ ◫ Dash   │  Breadcrumb / Page header              [ primary action button ]   │
│ 👤 Students│ ────────────────────────────────────────────────────────────────│
│ 📚 Academics│                                                                  │
│ 🗓 Timetable│        ( page content / data canvas )                            │
│ ✓ Attendance│                                                                  │
│ 📝 Exams   │                                                                   │
│ 🎬 LMS     │                                                                   │
│ 💳 Finance │                                                                   │
│ 🚌 Transport│                                                                  │
│ 🏠 Hostel  │                                                                   │
│ 📖 Library │                                                                   │
│ 👥 HR      │                                                                   │
│ 📈 Reports │                                                                   │
│ ⚙ Settings │                                                                   │
└──────────┴───────────────────────────────────────────────────────────────────┘
  Sidebar items shown are filtered by role + subscription feature flags.
```

## 6.2 Super Admin — Platform Dashboard

```
┌ Platform Overview ─────────────────────────────────────────── [ + New Tenant ]┐
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                    │
│ │ Tenants    │ │ MRR        │ │ Active     │ │ Churn      │   KPI cards w/      │
│ │ 4,812 ▲3.1%│ │ $1.24M ▲8% │ │ users 612k │ │ 1.4% ▼0.2% │   sparkline+delta   │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘                    │
│ ┌─ Revenue (12 mo) ─────────────────┐ ┌─ Signups by region ───────┐            │
│ │   ▁▂▃▅▆▇█  area chart              │ │  world map / bar          │            │
│ └───────────────────────────────────┘ └───────────────────────────┘            │
│ ┌─ Tenants needing review ──────────┐ ┌─ System health ───────────┐            │
│ │ Greenfield College   [Approve]    │ │ API 99.98%  ● Redis ●     │            │
│ │ Riverside School     [Approve]    │ │ DB p95 42ms ● Queues 1.2k │            │
│ └───────────────────────────────────┘ └───────────────────────────┘            │
│ ┌─ Open support tickets (8) ─ Announcements ─ Billing alerts ──────┐            │
└────────────────────────────────────────────────────────────────────┘
```

## 6.3 Institution Admin — Dashboard

```
┌ Good morning, Principal ─────────────────── Academic Year 2025–26 ▼ ──────────┐
│ KPI: Students 2,140 · Staff 148 · Attendance today 94.2% · Fees collected 78% │
│ ┌─ Attendance trend ──────────┐ ┌─ Fee collection ───┐ ┌─ At-risk (AI) ─────┐ │
│ │  line chart by week         │ │  donut paid/due     │ │ 23 students ▸      │ │
│ └─────────────────────────────┘ └─────────────────────┘ └────────────────────┘ │
│ ┌─ Enrollment by grade (bar) ─┐ ┌─ Today's timetable conflicts (0) ──────────┐ │
│ │                             │ │ ┌─ Recent admissions ─ Notices ─ Events ──┐ │ │
│ └─────────────────────────────┘ └─────────────────────────────────────────────┘ │
│ Quick actions: [Add Student] [Collect Fee] [Send Notice] [Generate Report 🤖]   │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 6.4 Teacher — Dashboard

```
┌ My Day ───────────────────────────────────────────────────────────────────────┐
│ ┌─ Today's classes ───────────┐ ┌─ Pending ─────────────┐ ┌─ My sections ────┐ │
│ │ 09:00 9-A Math   [Take ✓]   │ │ Grade 18 submissions   │ │ 9-A · 9-B · 10-C  │ │
│ │ 10:00 9-B Math   [Take ✓]   │ │ 2 lesson plans due     │ │ avg 88% attend.   │ │
│ │ 11:30 10-C Algeb [Take ✓]   │ │ 1 parent meeting 3pm   │ └───────────────────┘ │
│ └─────────────────────────────┘ └────────────────────────┘                      │
│ ┌─ Gradebook (9-A Math) ───────────────────────────────────┐ ┌ AI Assistant ──┐ │
│ │ Student    Quiz1 Quiz2 Mid  Avg   ▸ inline edit          │ │ "Draft a quiz  │ │
│ │ A. Khan     18    16   42   85%                          │ │ on quadratics" │ │
│ │ B. Lopez    20    19   46   94%                          │ │ [Generate 🤖]  │ │
│ └──────────────────────────────────────────────────────────┘ └────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 6.5 Student — Dashboard

```
┌ Hi, Aisha 👋 ─────────────────────────────── GPA 3.78 · Attendance 96% ───────┐
│ ┌─ Up next ───────────────┐ ┌─ Assignments due ────┐ ┌─ Results ──────────────┐ │
│ │ Math 10:00 · Room 204   │ │ Physics lab — 2d ▸   │ │ Mid-term published ▸   │ │
│ │ Physics 11:30           │ │ Essay — 5d           │ │ Rank 4 / 38            │ │
│ └─────────────────────────┘ └──────────────────────┘ └────────────────────────┘ │
│ ┌─ Timetable (week) ───────────────────────────┐ ┌─ AI Study Buddy ───────────┐ │
│ │  Mon Tue Wed Thu Fri grid                    │ │ "Explain Newton's 2nd law" │ │
│ └──────────────────────────────────────────────┘ └────────────────────────────┘ │
│ Fees: ✓ Paid (next due Aug 1)   ·   Library: 2 books, 1 due soon                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 6.6 Parent — Dashboard

```
┌ Children ▼ [ Aisha (9-A) | Omar (6-B) ] ──────────────────────────────────────┐
│ ┌─ Aisha · snapshot ─────────────────────────────────────────────────────────┐ │
│ │ Attendance 96% ▲ · GPA 3.78 · Fees: $250 due Aug 1 [Pay now]                │ │
│ │ ┌ Attendance (month) ┐ ┌ Recent grades ┐ ┌ Teacher remarks ┐                 │ │
│ │ │ calendar heatmap   │ │ Math 92 ▲      │ │ "Great progress" │                 │ │
│ │ └────────────────────┘ └────────────────┘ └──────────────────┘                 │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ [Message teacher] [Book meeting] [View report card 🤖] [Notifications]           │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 6.7 Accountant — Finance

```
┌ Finance ───────────────────────────────────── [Collect Fee] [New Invoice] ────┐
│ KPI: Collected $312k · Outstanding $88k · Today $4.2k · Defaulters 41          │
│ ┌─ Collection trend ─────────┐ ┌─ By fee head (bar) ┐ ┌─ Aging buckets ───────┐ │
│ ┌─ Outstanding (DataTable) ──────────────────────────────────────────────────┐ │
│ │ Student   Class  Amount  Due     Status    [Remind] [Collect] [Plan]        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ Tabs: Invoices · Payments · Scholarships · Expenses · Payroll · Reports          │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 6.8 Librarian / Transport / Hostel (pattern)

Each follows: **KPI row → primary chart → operational DataTable → tabbed sub-modules**.
- Librarian: Catalog · Issue/Return (barcode scan) · Fines · Digital library · Reading analytics.
- Transport: Live map (vehicle pins) · Routes · Drivers · Allocations · Pickup alerts.
- Hostel: Occupancy grid · Allocations · Visitors log · Attendance · Fees.

## 6.9 Responsive behavior

- ≥1280px: full sidebar + multi-column grids.
- 768–1279px: collapsed icon sidebar, 2-col grids.
- <768px: bottom tab bar (mobile web/Flutter), single-column stacked cards, slide-over detail.
