import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    
  ],
  theme: {
    extend: {
      colors: { 
      background: {
        primary: '#fafaf9',
        secondary: '#f5f5f4',
        glass: 'rgba(255, 255, 255, 0.7)',
        card: '#e2e8f0', //soft gray-blue (Tailwind's slate-200)
        // tweak #e2e8f0 to something darker like #cbd5e1 (slate-300) if needed.
      },
        text: {
          primary: '#0a0a0a',
          secondary: '#525252',
          inverse: '#fafaf9',
        },
        brand: {
          primary: '#2563eb',
          secondary: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        border: {
          DEFAULT: '#e5e5e5',
          focus: '#2563eb',
          selected: '#2563eb',
        },
      },
      fontSize: {
        xs: '14px',
        sm: '16px',
        base: '18px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      lineHeight: {
        tight: '1.4',
        normal: '1.6',
        relaxed: '1.8',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
