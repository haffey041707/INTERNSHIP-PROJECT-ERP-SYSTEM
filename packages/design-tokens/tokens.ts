/**
 * Nexus DS — design tokens (single source of truth, see docs/07).
 * Consumed by the Tailwind preset (web) and exported to JSON for the Flutter theme.
 * Tenant branding overrides --brand-* at runtime; components only read semantic tokens.
 */
export const tokens = {
  color: {
    brand: {
      50: '#F8FAFC', 100: '#E2E8F0', 200: '#CBD5E1', 300: '#94A3B8', 400: '#475569',
      500: '#1E293B', 600: '#0F172A', 700: '#020617', 800: '#020617', 900: '#020617', 950: '#020617',
    },
    secondary: { 500: '#38BDF8', 600: '#0284C7' },
    success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6',
  },
  gradient: {
    aurora: 'linear-gradient(135deg, #0F172A 0%, #1E293B 72%, #475569 130%)',
    sunrise: 'linear-gradient(135deg, #F59E0B 0%, #F43F5E 100%)',
  },
  radius: { sm: '6px', md: '10px', lg: '14px', xl: '20px', '2xl': '28px', full: '9999px' },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64].map((n) => `${n}px`),
  font: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    display: '"Cal Sans", Inter, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  shadow: {
    sm: '0 1px 2px rgba(15,23,42,.06)',
    md: '0 4px 12px rgba(15,23,42,.08)',
    lg: '0 12px 32px rgba(15,23,42,.12)',
    glass: '0 8px 32px rgba(31,38,135,.18)',
  },
  motion: { fast: '120ms', base: '200ms', slow: '320ms' },
} as const;

export type Tokens = typeof tokens;
