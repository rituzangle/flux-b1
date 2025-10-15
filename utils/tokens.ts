// utils/tokens.ts 
// Design tokens for a web application

export const tokens = {
  colors: {
    background: {
      primary: '#fafaf9',
      secondary: '#f5f5f4',
      glass: 'rgba(255, 255, 255, 0.7)',
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
      default: '#e5e5e5',
      focus: '#2563eb',
      selected: '#2563eb',
    },
  },
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, sans-serif',
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
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    popover: 1200,
    tooltip: 1300,
  },

  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    slow: 'all 0.5s ease',
  },

  opacity: {
    disabled: 0.5,
    hover: 0.8,
    active: 0.6,
  },
  
  gradients: {
    primary: 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)',
    secondary: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
  },
  
  zIndices: {
    dropdown: 1000,
    modal: 1100,
    popover: 1200,
    tooltip: 1300,
  },
  
  animation: {
    duration: {
      short: '200ms',
      medium: '400ms',
      long: '600ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
  
  layout: {
    maxWidth: '1200px',
    headerHeight: '60px',
    footerHeight: '80px',
  },
  
  iconSizes: {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
  
  form: {
    inputHeight: '40px',
    inputPadding: '12px',
    labelFontSize: '16px',
  },

  grid: {
    gap: '16px',
    columns: 12,
  },
  
  list: {
    itemSpacing: '12px',
    itemPadding: '8px',
  },

  card: {
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },

  modal: {
    overlayBg: 'rgba(0, 0, 0, 0.5)',
    contentPadding: '24px',
    contentBorderRadius: '16px',
  },
  
  tooltip: {
    bg: '#0a0a0a',
    text: '#fafaf9',
    padding: '8px',
    borderRadius: '8px',
  },
  
  toast: {
    successBg: '#10b981',
    errorBg: '#ef4444',
    infoBg: '#2563eb',
    text: '#fafaf9',
    padding: '16px',
    borderRadius: '12px',
  },
  
  avatar: { 
    sizeSm: '32px',
    sizeMd: '48px',
    sizeLg: '64px',
    borderRadius: '50%',
  },
  
  badge: {
    bg: '#2563eb',
    text: '#fafaf9',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  
  breadcrumb: {
    separator: '/',
    itemSpacing: '8px',
    fontSize: '14px',
  },
  
  pagination: {
    buttonPadding: '8px 12px',
    buttonBorderRadius: '8px',
    activeBg: '#2563eb',
    activeText: '#fafaf9',
    inactiveBg: '#f5f5f4',
    inactiveText: '#0a0a0a',
  },
  
  sidebar: {
    width: '250px',
    bg: '#fafaf9',
    text: '#0a0a0a',
    borderRight: '1px solid #e5e5e5',
  },
  
  navbar: {
    height: '60px',
    bg: '#fafaf9',
    text: '#0a0a0a',
    borderBottom: '1px solid #e5e5e5',
  },
  
  footer: {
    height: '80px',
    bg: '#f5f5f4',
    text: '#525252',
    borderTop: '1px solid #e5e5e5',
  },

  };
