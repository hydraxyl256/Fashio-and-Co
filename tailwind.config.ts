import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ── Existing brand palette (used by all non-homepage pages) ──────────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        bone: {
          50: '#FBF8F3',
          100: '#F6F1E7',
          200: '#EFE6D2',
          300: '#E4D6B6',
        },
        cocoa: {
          DEFAULT: '#2A1E18',
          50: '#F5F1EC',
          900: '#1B130E',
        },
        brass: {
          DEFAULT: '#B68A4E',
          400: '#C9A370',
          600: '#9A7340',
        },

        // ── Stitch design tokens (homepage only) ────────────────────────────
        // Material Design 3 colour scheme from the Stitch HTML
        's-primary':              '#430562', // deep purple
        's-on-primary':           '#ffffff',
        's-primary-container':    '#5b247a',
        's-primary-fixed':        '#f5d9ff',
        's-primary-fixed-dim':    '#e6b4ff',
        's-on-primary-fixed':     '#30004a',
        's-on-primary-fixed-var': '#642d83',
        's-on-primary-container': '#cf92ef',
        's-inverse-primary':      '#e6b4ff',

        's-secondary':            '#775a1a', // warm gold
        's-on-secondary':         '#ffffff',
        's-secondary-container':  '#fdd589',
        's-secondary-fixed':      '#ffdea3',
        's-secondary-fixed-dim':  '#e8c177',
        's-on-secondary-fixed':   '#261900',
        's-on-secondary-fixed-var':'#5c4202',
        's-on-secondary-container':'#775b1b',

        's-tertiary':             '#3d174f',
        's-on-tertiary':          '#ffffff',
        's-tertiary-container':   '#552e67',
        's-tertiary-fixed':       '#f7d8ff',
        's-tertiary-fixed-dim':   '#e6b5f8',
        's-on-tertiary-fixed':    '#2f0741',
        's-on-tertiary-fixed-var':'#5e3770',
        's-on-tertiary-container':'#c799da',

        's-surface':              '#fef8fc',
        's-surface-dim':          '#ded8dc',
        's-surface-bright':       '#fef8fc',
        's-surface-container-low':'#f8f2f6',
        's-surface-container':    '#f2ecf0',
        's-surface-container-high':'#ece6eb',
        's-surface-container-highest':'#e7e1e5',
        's-surface-variant':      '#e7e1e5',
        's-surface-tint':         '#7e469d',
        's-on-surface':           '#1d1b1e',
        's-on-surface-variant':   '#4d444f',
        's-inverse-surface':      '#323033',
        's-inverse-on-surface':   '#f5eff3',

        's-background':           '#fef8fc',
        's-on-background':        '#1d1b1e',

        's-outline':              '#7e7480',
        's-outline-variant':      '#cfc2d1',

        's-error':                '#ba1a1a',
        's-on-error':             '#ffffff',
        's-error-container':      '#ffdad6',
        's-on-error-container':   '#93000a',
      },

      fontFamily: {
        // Core Typography
        instrument: ['var(--font-instrument)', 'serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
        
        // Aliases to avoid breaking existing classes during transition
        serif: ['var(--font-instrument)', 'serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
        playfair: ['var(--font-instrument)', 'serif'],
        montserrat: ['var(--font-manrope)', 'sans-serif'],
      },

      fontSize: {
        // ── Fluid Typography Scale ──────────────────────────────────────────
        // Scale values using clamp(MIN, FLUID, MAX)
        'display-xl': ['clamp(3.5rem, 6vw + 1rem, 6.5rem)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-lg': ['clamp(3rem, 5vw + 1rem, 5.5rem)',   { lineHeight: '1.05', letterSpacing: '-0.015em', fontWeight: '400' }],
        'display-md': ['clamp(2.5rem, 4vw + 1rem, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '400' }],
        
        'h1': ['clamp(2rem, 3.5vw + 1rem, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '400' }],
        'h2': ['clamp(1.75rem, 3vw + 1rem, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.005em', fontWeight: '400' }],
        'h3': ['clamp(1.5rem, 2vw + 1rem, 2.25rem)', { lineHeight: '1.2', fontWeight: '400' }],
        'h4': ['clamp(1.25rem, 1.5vw + 1rem, 1.75rem)', { lineHeight: '1.3', fontWeight: '400' }],
        'h5': ['clamp(1.125rem, 1.25vw + 1rem, 1.5rem)', { lineHeight: '1.4', fontWeight: '400' }],
        'h6': ['clamp(1rem, 1vw + 1rem, 1.25rem)', { lineHeight: '1.5', fontWeight: '400' }],

        // Body / UI
        'body-lg': ['clamp(1.125rem, 1vw + 0.8rem, 1.25rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'button': ['0.875rem', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '500' }],
        'nav': ['0.875rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600', textTransform: 'uppercase' }],
        'price': ['1rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '500' }],
        'product-title': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'badge': ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600', textTransform: 'uppercase' }],
        'label': ['0.875rem', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '600' }],
        'input': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],

        // Aliases to avoid breaking Stitch tokens
        's-display-lg': ['clamp(3rem, 5vw + 1rem, 5.5rem)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '400' }],
        's-headline-lg': ['clamp(2rem, 3.5vw + 1rem, 3.5rem)', { lineHeight: '1.1', fontWeight: '400' }],
        's-headline-lg-mobile': ['clamp(1.75rem, 3vw + 1rem, 2.75rem)', { lineHeight: '1.15', fontWeight: '400' }],
        's-headline-md': ['clamp(1.5rem, 2vw + 1rem, 2.25rem)', { lineHeight: '1.2', fontWeight: '400' }],
        's-headline-sm': ['clamp(1.25rem, 1.5vw + 1rem, 1.75rem)', { lineHeight: '1.3', fontWeight: '400' }],
        's-body-lg': ['clamp(1.125rem, 1vw + 0.8rem, 1.25rem)', { lineHeight: '1.6', fontWeight: '400' }],
        's-body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        's-label-md': ['0.875rem', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '600' }],
        's-label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'eyebrow': ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em', fontWeight: '600' }],
      },

      spacing: {
        // Existing
        'gutter':      '1.5rem',
        'section':     '6rem',
        'section-sm':  '3.5rem',
        // Stitch
        's-unit':         '4px',
        's-stack-sm':     '16px',
        's-stack-md':     '32px',
        's-stack-lg':     '64px',
        's-gutter':       '24px',
        's-margin-mobile':'20px',
        's-margin-desktop':'80px',
        's-container-max':'1440px',
      },

      borderRadius: {
        none: '0',
        sm:   '2px',
        DEFAULT: '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        '2xl':'20px',
        '3xl':'28px',
        // Stitch border radius tokens
        's-default': '0.125rem',
        's-lg':      '0.25rem',
        's-xl':      '0.5rem',
        's-full':    '0.75rem',
      },

      boxShadow: {
        'soft':         '0 1px 2px rgba(20, 12, 6, 0.04), 0 8px 24px rgba(20, 12, 6, 0.04)',
        'lift':         '0 4px 12px rgba(20, 12, 6, 0.06), 0 24px 48px rgba(20, 12, 6, 0.08)',
        'inset-line':   'inset 0 -1px 0 hsl(var(--border))',
        // Stitch luxury shadow
        'luxury':       '0 4px 20px -2px rgba(61, 23, 79, 0.08)',
      },

      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },

      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },

      animation: {
        'fade-up':        'fade-up 600ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'fade-in':        'fade-in 400ms ease both',
        'shimmer':        'shimmer 1.6s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },

      maxWidth: {
        'stitch': '1440px',
      },

      height: {
        'hero': '921px',
        'collection-grid': '600px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
