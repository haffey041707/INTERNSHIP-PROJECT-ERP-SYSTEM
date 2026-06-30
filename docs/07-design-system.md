# 07 — UI/UX Design System ("Nexus DS")

A token-driven, accessible, enterprise design system shared by web (Tailwind/React) and mobile (Flutter).
Goal: **Apple-level polish + Material clarity**, with glassmorphism accents, elegant gradients, and flawless
dark mode. Tokens are the single source of truth ([`packages/design-tokens`](../packages/design-tokens)).

## 7.1 Design principles

1. **Clarity over decoration** — data-dense screens stay scannable; chrome recedes, content leads.
2. **Consistency** — one token set drives web + mobile; components are composable and predictable.
3. **Depth, not noise** — subtle elevation, soft shadows, and restrained glassmorphism for hierarchy.
4. **Accessible by default** — WCAG 2.1 AA: contrast, focus rings, keyboard nav, reduced-motion, semantics.
5. **Calm motion** — purposeful 150–250 ms transitions; spring physics for delight, never gratuitous.

## 7.2 Color tokens

Semantic tokens map to primitives so white-label theming overrides primitives only.

```
Brand primary    indigo/violet ramp   #6D28D9 (600) base, 50→950
Brand secondary  sky/cyan            #0EA5E9
Accent           emerald / amber for status
Neutral          slate ramp (surfaces, text)
Semantic:        success #10B981 · warning #F59E0B · danger #EF4444 · info #3B82F6
Gradients:       "aurora" (violet→sky), "sunrise" (amber→rose) for hero/KPI cards
Glass:           bg rgba(255,255,255,0.6) + backdrop-blur(16px) + 1px border rgba(255,255,255,0.18)
```

Light & dark are both first-class. Tenant branding injects `--brand-500/600/700` as CSS variables at runtime;
all components read the semantic token, so a tenant's color flows everywhere instantly.

## 7.3 Typography

- **Sans**: Inter (UI), `font-feature-settings: "cv11","ss01"`. **Display**: Inter Display / Cal Sans for headings.
- **Mono**: JetBrains Mono (codes, IDs).
- Scale (rem): 12 / 14 / 16(base) / 18 / 20 / 24 / 30 / 36 / 48. Line-heights 1.2 (headings) → 1.6 (body).
- Numeric data uses tabular figures for aligned tables.

## 7.4 Spacing, radius, elevation

- Spacing scale (4px base): 0,1,2,3,4,6,8,12,16,24,32,48,64.
- Radius: `sm 6 · md 10 · lg 14 · xl 20 · 2xl 28 · full`. Cards default `xl`.
- Elevation: 5 shadow levels; dark mode uses lighter surfaces + glow instead of heavy shadows.

## 7.5 Component library (in `packages/ui`)

Built on **Radix UI** primitives (accessible, unstyled) + Tailwind + CVA (class-variance-authority) for variants.

```
Primitives:  Button · IconButton · Input · Select · Combobox · Checkbox · Radio · Switch · Slider
             · Textarea · DatePicker · FileUpload · Tooltip · Popover · Dropdown · Dialog/Modal
             · Drawer/Sheet · Tabs · Accordion · Toast · Badge · Avatar · Skeleton · Spinner
Layout:      AppShell · Sidebar (collapsible) · Topbar · PageHeader · Card · GlassCard · Grid · Stack
Data:        DataTable (sort/filter/paginate/column-pin/export) · StatCard/KPICard · Chart wrappers
             (Recharts/Visx) · Timeline · Calendar · Kanban · EmptyState · Pagination
Domain:      AttendanceGrid · GradeBook · FeeReceipt · TimetableGrid · StudentCard · ChatThread
Feedback:    Banner · Alert · ConfirmDialog · ProgressSteps
AI:          AIChatPanel · InsightCard · AISuggestionChip
```

Every component: typed props, light/dark, RTL-ready, keyboard-accessible, Storybook story + a11y test.

## 7.6 Patterns

- **AppShell**: collapsible icon+label sidebar (role-aware nav), sticky topbar (tenant logo, global search,
  notifications, AI assistant launcher, profile), breadcrumb + page header, content canvas.
- **Dashboards**: 12-col responsive grid of KPI cards (with sparkline + delta), charts, and alert lists.
- **Lists/CRUD**: DataTable + filter bar + bulk actions + slide-over detail/edit drawer.
- **Forms**: multi-step wizards (admission, enrollment) with progress, inline validation, autosave.
- **Empty/loading/error**: every screen has skeletons + meaningful empty states + retry errors.

## 7.7 Theming & white-label

```css
:root {
  --brand-50: …; --brand-500:#6D28D9; --brand-600:#5B21B6; /* overridden per tenant */
  --surface: #ffffff; --surface-glass: rgba(255,255,255,.6);
  --text-1:#0F172A; --text-2:#475569;
}
.dark { --surface:#0B1020; --surface-glass: rgba(17,24,39,.6); --text-1:#F8FAFC; --text-2:#94A3B8; }
```
Tenant theme is fetched at login and applied by setting these variables on `:root`; a contrast checker ensures
chosen brand colors keep AA contrast (auto-adjusts text-on-brand).

## 7.8 Accessibility & i18n

- Focus-visible rings, ARIA roles, skip-links, `prefers-reduced-motion`, min 44px touch targets.
- Full keyboard operability incl. DataTable and menus.
- **i18n**: `next-intl` / ICU messages; RTL (Arabic/Urdu/Hebrew) layouts mirrored; locale-aware dates, numbers,
  currency. Multi-language + multi-currency are core.

## 7.9 Motion

Framer Motion on web; standard durations (`fast 120 · base 200 · slow 320`) and easings (`standard`,
`emphasized`). Page transitions, list stagger, drawer slide, toast — all respect reduced-motion.

## 7.10 Tooling

Storybook (catalog + a11y addon), Chromatic (visual regression), design tokens exported to JSON → consumed by
Tailwind config and Flutter theme generator, keeping all platforms pixel-consistent.
