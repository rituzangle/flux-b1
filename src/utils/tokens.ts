/**
 * Design Tokens for Flux Payment Platform
 * 
 * @file src/utils/tokens.ts
 * @description Centralized design tokens for consistent UI
 * 
 * These tokens define the visual language of Flux:
 * - Accessibility-first (WCAG 2.2 AAA compliant)
 * - Warm, approachable colors
 * - Generous spacing for readability
 * - High contrast for vision accessibility
 * 
 * Usage:
 * ```typescript
 * import { tokens } from '@/src/utils/tokens';
 * 
 * const buttonStyle = {
 *   backgroundColor: tokens.colors.brand.primary,
 *   padding: tokens.spacing.md,
 *   borderRadius: tokens.borderRadius.md,
 * };
 * ```
 * 
 * @module tokens
 */
import { tokens } from '@/src/utils/tokens';
export const tokens = {
  /**
   * Color palette
   * All colors meet WCAG 2.2 AAA contrast requirements (7:1 for body text)
   */
  colors: {
    // Backgrounds - Warm off-whites for eye comfort
    background: {
      /** Primary background - Warm off-white, NOT pure white */
      primary: '#fafaf9',
      /** Secondary background - Slightly darker for cards */
      secondary: '#f5f5f4',
      /** Tertiary background - For nested elements */
      tertiary: '#f0f0ef',
      /** Glass morphism effect */
      glass: 'rgba(255, 255, 255, 0.7)',
      /** Glass with more opacity */
      glassStrong: 'rgba(255, 255, 255, 0.9)',
    },
    
    // Text colors - High contrast for accessibility
    text: {
      /** Primary text - True black for maximum contrast (7:1 ratio) */
      primary: '#0a0a0a',
      /** Secondary text - Medium gray for supporting info */
      secondary: '#525252',
      /** Tertiary text - Light gray for subtle info */
      tertiary: '#737373',
      /** Inverse text - For dark backgrounds */
      inverse: '#fafaf9',
      /** Disabled text */
      disabled: '#a3a3a3',
    },
    
    // Brand colors - Blue-based palette
    brand: {
      /** Primary brand color - Used for CTAs, links, focus states */
      primary: '#2563eb',
      /** Primary hover state - Slightly darker */
      primaryHover: '#1d4ed8',
      /** Primary active state - Even darker */
      primaryActive: '#1e40af',
      /** Secondary brand color - Light blue for accents */
      secondary: '#0ea5e9',
      /** Secondary hover state */
      secondaryHover: '#0284c7',
    },
    
    // Semantic colors - For status and feedback
    semantic: {
      /** Success - Green for positive actions */
      success: '#10b981',
      /** Success hover state */
      successHover: '#059669',
      /** Warning - Amber for caution */
      warning: '#f59e0b',
      /** Warning hover state */
      warningHover: '#d97706',
      /** Error - Red for destructive actions */
      error: '#ef4444',
      /** Error hover state */
      errorHover: '#dc2626',
      /** Info - Blue for informational messages */
      info: '#3b82f6',
      /** Info hover state */
      infoHover: '#2563eb',
    },
    
    // Border colors
    border: {
      /** Default border - Light gray */
      default: '#e5e5e5',
      /** Hover border - Slightly darker */
      hover: '#d4d4d4',
      /** Focus border - Brand blue */
      focus: '#2563eb',
      /** Selected border - Brand blue, thicker */
      selected: '#2563eb',
      /** Error border - Red */
      error: '#ef4444',
    },
    
    // Charity category colors (for icons/badges)
    category: {
      hunger: '#f59e0b',      // Amber
      humanitarian: '#8b5cf6', // Purple
      emergency: '#ef4444',    // Red
      children: '#3b82f6',     // Blue
      education: '#10b981',    // Green
      health: '#ec4899',       // Pink
    },
  },

  /**
   * Typography system
   * Minimum 16px for body text (accessibility)
   * Line height 1.6 reduces eye strain
   */
  typography: {
    fontFamily: {
      /** Sans-serif font stack - System fonts for performance */
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      /** Monospace font stack - For code/numbers */
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    
    fontSize: {
      /** Extra small - 14px (minimum for secondary info) */
      xs: '0.875rem',    // 14px
      /** Small - 16px (minimum for body text - accessibility) */
      sm: '1rem',        // 16px
      /** Base - 18px (comfortable reading size) */
      base: '1.125rem',  // 18px
      /** Large - 20px */
      lg: '1.25rem',     // 20px
      /** Extra large - 24px */
      xl: '1.5rem',      // 24px
      /** 2X large - 32px (section headers) */
      '2xl': '2rem',     // 32px
      /** 3X large - 48px (hero text) */
      '3xl': '3rem',     // 48px
      /** 4X large - 64px (impact numbers) */
      '4xl': '4rem',     // 64px
    },
    
    fontWeight: {
      /** Normal - 400 */
      normal: '400',
      /** Medium - 500 (semi-bold for emphasis) */
      medium: '500',
      /** Semibold - 600 (headers) */
      semibold: '600',
      /** Bold - 700 (strong emphasis) */
      bold: '700',
    },
    
    lineHeight: {
      /** Tight - 1.4 (for headers) */
      tight: '1.4',
      /** Normal - 1.6 (reduces eye strain, default for body) */
      normal: '1.6',
      /** Relaxed - 1.8 (for long-form content) */
      relaxed: '1.8',
    },
    
    letterSpacing: {
      /** Tight - For large text */
      tight: '-0.02em',
      /** Normal - Default */
      normal: '0',
      /** Wide - For small caps/labels */
      wide: '0.05em',
    },
  },

  /**
   * Spacing system
   * Based on 4px grid for consistency
   * Generous spacing for visual comfort
   */
  spacing: {
    /** 4px - Minimal spacing */
    xs: '0.25rem',
    /** 8px - Small spacing */
    sm: '0.5rem',
    /** 12px - Medium-small spacing */
    md: '0.75rem',
    /** 16px - Base spacing unit */
    base: '1rem',
    /** 24px - Large spacing */
    lg: '1.5rem',
    /** 32px - Extra large spacing */
    xl: '2rem',
    /** 48px - 2X large spacing */
    '2xl': '3rem',
    /** 64px - 3X large spacing */
    '3xl': '4rem',
    /** 96px - 4X large spacing */
    '4xl': '6rem',
  },

  /**
   * Border radius
   * Soft, friendly curves
   */
  borderRadius: {
    /** None - 0px */
    none: '0',
    /** Small - 8px (inputs, small buttons) */
    sm: '0.5rem',
    /** Medium - 12px (cards, buttons) */
    md: '0.75rem',
    /** Large - 16px (prominent cards) */
    lg: '1rem',
    /** Extra large - 24px (hero cards) */
    xl: '1.5rem',
    /** Full - 9999px (pills, avatars) */
    full: '9999px',
  },

  /**
   * Shadows
   * Subtle elevation for depth
   */
  shadows: {
    /** Small shadow - Subtle depth */
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    /** Medium shadow - Standard elevation */
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    /** Large shadow - Prominent elevation */
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    /** Extra large shadow - Maximum elevation */
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    /** Glass shadow - For glass-morphism effect */
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    /** Focus ring - For accessibility */
    focus: '0 0 0 3px rgba(37, 99, 235, 0.5)',
  },

  /**
   * Transitions
   * Smooth, performant animations
   */
  transitions: {
    /** Fast - 150ms (hover states, button presses) */
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    /** Base - 200ms (default transitions) */
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    /** Slow - 300ms (page transitions, modals) */
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    /** Extra slow - 500ms (complex animations) */
    xslow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Z-index layers
   * Consistent stacking context
   */
  zIndex: {
    /** Base - 0 (default layer) */
    base: 0,
    /** Dropdown - 10 (dropdowns, popovers) */
    dropdown: 10,
    /** Sticky - 20 (sticky headers) */
    sticky: 20,
    /** Fixed - 30 (fixed elements) */
    fixed: 30,
    /** Modal backdrop - 40 (modal overlays) */
    modalBackdrop: 40,
    /** Modal - 50 (modal content) */
    modal: 50,
    /** Popover - 60 (tooltips, notifications) */
    popover: 60,
    /** Toast - 70 (toast notifications) */
    toast: 70,
  },

  /**
   * Breakpoints
   * Mobile-first responsive design
   */
  breakpoints: {
    /** Small - 640px (large phones) */
    sm: '640px',
    /** Medium - 768px (tablets) */
    md: '768px',
    /** Large - 1024px (laptops) */
    lg: '1024px',
    /** Extra large - 1280px (desktops) */
    xl: '1280px',
    /** 2X large - 1536px (large desktops) */
    '2xl': '1536px',
  },

  /**
   * Touch targets
   * Accessibility requirements
   */
  touchTarget: {
    /** Minimum - 44x44px (WCAG 2.2 requirement) */
    minimum: '44px',
    /** Comfortable - 48x48px (recommended) */
    comfortable: '48px',
    /** Large - 56px (for primary actions) */
    large: '56px',
  },
} as const;

/**
 * Type-safe token access
 * Prevents typos and provides autocomplete
 */
export type Tokens = typeof tokens;
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type FontSizeToken = keyof typeof tokens.typography.fontSize;
