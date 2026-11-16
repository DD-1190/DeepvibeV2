import type { Config } from 'tailwindcss';

/**
 * DeepVibe design tokens.
 * Black/charcoal dominate; Acid Lime is reserved for interaction, emphasis and motion highlights.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px', // tablet
      lg: '1024px', // laptop
      xl: '1440px', // desktop
    },
    extend: {
      colors: {
        void: '#0B0D0F',
        graphite: '#171B1E',
        surface: '#20252A',
        lime: { DEFAULT: '#B9F56B', 600: '#9FDC4F' },
        warm: '#E9EDE5',
        muted: '#A5AAAD',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // fluid editorial scale
        'display-xl': ['clamp(2.6rem, 1.2rem + 4.6vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.045em' }],
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-6%, 4%, 0) scale(1.12)' },
        },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
        scrollLine: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '45%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '55%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
        wave: { '0%, 100%': { transform: 'scaleY(0.25)' }, '50%': { transform: 'scaleY(1)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        nudge: { '0%, 100%': { transform: 'translateY(-15%)' }, '50%': { transform: 'translateY(15%)' } },
        float: { '0%, 100%': { transform: 'translate3d(0,0,0) rotate(0deg)' }, '50%': { transform: 'translate3d(0,-3%,0) rotate(2deg)' } },
        marquee: { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
        breathe: { '0%, 100%': { transform: 'scale(1) translate3d(0,0,0)' }, '50%': { transform: 'scale(1.045) translate3d(0,-1%,0)' } },
        sweep: { '0%, 70%': { transform: 'translateX(0) skewX(-12deg)' }, '100%': { transform: 'translateX(400%) skewX(-12deg)' } },
      },
      animation: {
        drift: 'drift 22s ease-in-out infinite',
        'drift-slow': 'drift 34s ease-in-out infinite reverse',
        blink: 'blink 1.6s ease-in-out infinite',
        'scroll-line': 'scrollLine 2.4s cubic-bezier(0.65,0,0.35,1) infinite',
        wave: 'wave 1.1s ease-in-out infinite',
        'spin-slow': 'spin 40s linear infinite',
        nudge: 'nudge 1.8s ease-in-out infinite',
        float: 'float 12s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        breathe: 'breathe 14s ease-in-out infinite',
        sweep: 'sweep 9s cubic-bezier(0.65,0,0.35,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
