/** Shared Tailwind preset built from Nexus DS tokens. Brand colors read CSS vars so
 *  tenant white-label theming works at runtime (see docs/07). */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50,#F8FAFC)', 100: 'var(--brand-100,#E2E8F0)', 200: 'var(--brand-200,#CBD5E1)',
          300: 'var(--brand-300,#94A3B8)', 400: 'var(--brand-400,#475569)', 500: 'var(--brand-500,#1E293B)',
          600: 'var(--brand-600,#0F172A)', 700: 'var(--brand-700,#020617)', 800: 'var(--brand-800,#020617)',
          900: 'var(--brand-900,#020617)',
        },
        surface: 'var(--surface,#ffffff)',
        'surface-2': 'var(--surface-2,#F8FAFC)',
        success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cal Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl: '20px', '2xl': '28px' },
      boxShadow: {
        glass: '0 22px 70px rgba(15,23,42,.16)',
        card: '0 10px 30px rgba(15,23,42,.10)',
      },
      backgroundImage: {
        aurora: 'linear-gradient(135deg, var(--brand-600,#0F172A) 0%, #1E293B 68%, #475569 130%)',
        sunrise: 'linear-gradient(135deg, #F59E0B 0%, #F43F5E 100%)',
      },
    },
  },
};
