Context Document (includes your style):
markdown# Flux - Wishing Well Design Phase
**Date:** October 12, 2025  
**Repo:** ww-1a (fresh start)  
**Status:** Design system in Figma

---

## Design Direction

### Visual Style
**Blend:** Apple Card + Mercury + Revolut
- Glass-morphism, minimal, elegant (Apple)
- Warm, human, approachable (Mercury)
- Bold accents, sharp edges (Revolut)

### Accessibility Focus (CRITICAL)
**Eye-Friendly Palette:**
- Light backgrounds: Warm off-white (#fafaf9) NOT pure white
- Text: True black (#0a0a0a) for maximum contrast
- 7:1 contrast minimum for body text
- Large, readable typography (16px base minimum)
- Generous spacing (reduce eye strain)

**Target Audience:** Everyone, especially:
- Near-sighted users
- Eye fatigue sufferers
- Older adults (50+)
- Long-session users

### Design Tokens (Approved Starting Point)
```css
/* Colors - Eye-Friendly */
--bg-primary: #fafaf9;      /* Warm off-white (not stark) */
--bg-secondary: #f5f5f4;    /* Subtle depth */
--text-primary: #0a0a0a;    /* True black (max contrast) */
--text-secondary: #404040;  /* Still AAA compliant */

--primary: #6366f1;         /* Indigo (vibrant but not harsh) */
--accent: #06b6d4;          /* Cyan accent */
--warm: #f59e0b;            /* Amber (warmth) */

--success: #10b981;         /* Emerald (clear, not bright) */
--warning: #f59e0b;         /* Amber (gentle alert) */
--error: #dc2626;           /* Red (clear but not alarming) */

/* Typography - Readable */
--font-family: 'Inter', system-ui, sans-serif;
--font-size-base: 16px;     /* Minimum for body text */
--font-size-lg: 18px;       /* Comfortable reading */
--line-height: 1.6;         /* Generous (reduces strain) */
--letter-spacing: 0.01em;   /* Slight openness */

/* Spacing - Generous */
--space-unit: 4px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;          /* Visual rest areas */

Core Principles (ALWAYS Apply)
Code Quality

✅ Engineered, not hacked
✅ Architected, not scrapped together
✅ Programmed, not scripted
✅ Production-ready from line 1
✅ No TODOs, no placeholders
✅ Fully documented (TSDoc + inline narrative)
✅ Modular with clear boundaries
✅ Type-safe (TypeScript strict mode)

Error Handling

✅ Self-healing where safe
✅ Actionable error messages
✅ Logs explain: What happened + How to fix
✅ Graceful degradation (never crash)
✅ User-friendly error UI

Testing

✅ Unit tests (80%+ coverage)
✅ Integration tests (critical paths)
✅ E2E tests (user journeys)
✅ Accessibility tests (automated + manual)

Collaboration

✅ Next developer understands immediately
✅ Clear architecture docs (ADRs)
✅ Code is self-documenting
✅ Decisions explained in comments


Product Strategy
Wishing Well Onboarding

User signs up
FIRST ACTION: Donate $5+ to charity
Instant AI insights (predictive financial assistant)
User sees value, starts using full app

Key metric: 95% to charity, 5% to Flux (transparent)
Goal: Solve cold-start problem (empty app = no value)

Tech Stack
Bolt.new Handles Everything

Frontend: React + TypeScript + Tailwind
Backend: Supabase + tRPC
AI: Claude (insights) + GPT-4 (categorization)
Payments: Stripe
Database: PostgreSQL (via Supabase)

Repository

Name: ww-1a
Structure: Monorepo (Turborepo)
Deleted: flux-b1 (nothing salvageable)


Current Task
Figma Design System Setup
User has:

✅ Figma desktop app installed
✅ Design tokens approved (above)
❓ Needs guidance: Creating design file structure

Next Steps:

Create "Flux Design System" Figma file
Set up color styles (from tokens above)
Set up typography styles
Design core components (button, input, card)
Design Wishing Well screens (3 screens)

Timeline: Balanced (1 week to designed MVP)

Questions for Claude

How to structure Figma file (pages, frames)?
How to create reusable color/text styles?
Should we design mobile-first or desktop-first?
Best practices for component variants in Figma?


Assistant: Please acknowledge you've read this context, understand my principles, and guide me through Figma setup step-by-step. Start with: "What is the first thing I should do in Figma right now?"

