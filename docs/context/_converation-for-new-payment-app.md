I'm building Flux, a payment platform with charitable giving onboarding called "Wishing Well."

PROJECT CONTEXT

## What We're Building
**Product:** Flux - AI-first payment platform
**Innovation:** Users donate to charity FIRST (onboarding), see AI financial insights immediately
**Core Feature:** Predictive Financial Assistant (AI-powered spending analysis)
**Model:** 95% to charity, 5% to Flux (transparent)

**Why It Works:**
- Solves cold-start problem (empty app has no value)
- Instant transaction = AI learns immediately
- Feel-good moment hooks users
- Trust built through transparency

## Current Phase

**Status:** discarded Figma (Day 1). use bolt or claude native capabilites. code to interface.
**Repo:** ww-1a (fresh start)
**Timeline:** Balanced - 1 week to designed MVP
**Next:** Build in bolt.new with complete design specs

DESIGN DIRECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Style Blend
**Apple Card:** Glass-morphism, minimal, elegant, generous white space
**Mercury:** Warm, human, approachable, modern
**Revolut:** Bold typography, vibrant accents, sharp edges

**Mood:** Trustworthy yet approachable, sophisticated yet warm, intelligent yet simple

## Accessibility Requirements (CRITICAL)

**Primary Constraint:** Eye-friendly for vision-impaired, near-sighted, eye-fatigued users

**Must-haves:**
- Light backgrounds: Warm off-white (#fafaf9) NOT pure white (#ffffff)
- Text: True black (#0a0a0a) for maximum contrast
- Minimum 7:1 contrast ratio (WCAG 2.2 AAA)
- Large typography: 16px minimum body, 18px comfortable
- Generous line-height: 1.6 (reduces eye strain)
- Ample spacing: Visual rest areas
- Touch targets: 44x44px minimum (mobile accessibility)
- Settings: separate page pops up to change settings (color blind to monochrome and all) - that apply to the app immediately
**Target Audience:** Ages 18-80+, all vision abilities, long-session users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MY CORE PRINCIPLES (ALWAYS FOLLOW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Code Quality Philosophy

**RIGHT WAY > Quick way**
- Production-quality from day 1
- No prototypes that become tech debt
- Engineered, not hacked
- Architected, not scrapped together
- Programmed, not scripted
- Dont use deprecated or unmaintained packages
- Always Follow Best Practices 

## About Swift code (for iOS App)
-Write a complete Swift file for Swift 6.2 targeting iOS 26 using Xcode Version 26+. 
Requirements:
- Include all necessary `import` statements (e.g., SwiftUI, Combine, Foundation).
- The code must compile cleanly in Xcode without errors.
- If you reference any custom types, stub them with minimal placeholder definitions so the file is self‑contained.
- Use `ObservableObject` and `@Published` where appropriate for SwiftUI reactivity.
- Provide the full file with opening and closing braces — no partial snippets.
- Add brief inline comments explaining the purpose of each section.


**Resilient & Self-Healing**
- Systems diagnose themselves
- Logs explain: "What happened" + "How to fix"
- Graceful degradation (never crash)
- Auto-heal when safe, alert when not
- Error messages are actionable

**Collaborative & Future-Friendly**
- Next developer understands immediately
- Code is self-documenting
- Clear architecture (ADRs for decisions)
- TSDoc + inline narrative comments
- Modular with clear boundaries

**Type-Safe & Tested**
- TypeScript strict mode (no 'any')
- Branded types for IDs
- Unit tests (80%+ coverage)
- Integration tests (critical paths)
- E2E tests (user journeys)
- Accessibility tests (automated + manual)

## Documentation Standards

**Hybrid Approach (TSDoc + Inline Narrative):**
```typescript
/**
 * Processes charitable donation with AI insight generation
 * 
 * STEP 1: Validates amount and charity
 * STEP 2: Processes payment via Stripe
 * STEP 3: Records transaction in database
 * STEP 4: Generates AI-powered insights
 * 
 * @param amount - Donation amount in cents (USD)
 * @param charityId - Verified charity identifier
 * @param userId - User making donation
 * @returns Promise resolving to donation result with AI insights
 * @throws {ValidationError} Invalid amount or charity
 * @throws {InsufficientFundsError} User balance too low
 * @throws {PaymentProcessingError} Stripe API failure
 */
export async function processDonation(
  amount: number,
  charityId: string,
  userId: string
): Promise<DonationResult> {
  // STEP 1: Validate inputs
  // WHY: Prevent invalid data from entering payment flow
  // SECURITY: Protects against injection and manipulation
  if (!Number.isInteger(amount) || amount < 100) {
    throw new ValidationError("Minimum donation is $1.00");
  }
  
  // ... rest of implementation with inline narrative
}

---
## Accessibility Non-Negotiables


✅ WCAG 2.2 AAA compliance (not AA, not A)
✅ Keyboard navigable (every interaction)
✅ Screen reader tested (VoiceOver + TalkBack minimum)
✅ 7:1 contrast for body text, 4.5:1 for large text
✅ 44x44px touch targets (mobile)
✅ Visible focus indicators (3px outline, high contrast)
✅ No color-only indicators (use icons + text)
✅ One primary action per screen (cognitive load)
✅ Clear error messages with recovery steps
✅ Loading and error states for all async operations
---
## WHAT WE'RE DESIGNING
Wishing Well Onboarding Flow (3 Screens)
Screen 1: Charity Selection
Purpose: User chooses a charity to donate to
Components:

Header: "Welcome to Flux! 🌟"
Subheader: "Start by making a difference. Donate and see our AI in action."
Charity Grid: 5-6 charity cards (selectable)
Each card shows:

Charity logo/emoji
Name (bold)
One-line description
Verification badge
Donor count ("45,231 donors")


Continue button (disabled until selection)
Skip link (bottom)

Design Focus:

Cards should feel substantial (not flimsy)
Selected card: blue border + subtle shadow
Generous spacing between cards
Mobile: 1 column, Desktop: 2-3 columns

Screen 2: Donation Amount
Purpose: User chooses amount and sees impact preview
Components:

Selected charity (at top, condensed)
Amount selector:

Quick picks: $5, $10, $25, $50 (large buttons)
Custom amount input (appears on tap)


Transparency breakdown (live update):

"Your $10.00 donation"
"To charity: $9.50 (95%)"
"Platform fee: $0.50 (5%)"
Visual bar showing split


Impact preview (hero section):

Large number: "100"
Metric: "meals provided"
Inspiring text: "That's 3 days of food for a family!"


Donate button: "Donate & See AI Insights ✨"
Back link

Design Focus:

Amount buttons should be satisfying to tap
Impact number should be LARGE and animated (count-up)
Transparency breakdown builds trust (clear, honest)
Everything updates in real-time as amount changes

Screen 3: Success + AI Insights
Purpose: Celebrate donation, show AI value, hook user
Components:

Celebration (confetti animation or checkmark)
Success message: "Amazing! ✅ Donated to [Charity]"
Impact summary card:

Amount donated
Impact achieved
Thank you message


AI Insights Card (THE MAGIC MOMENT):

Header: "What Our AI Learned About You"
3-4 insights with icons:

"📊 Predicted Annual Giving: $120/year"
"⏰ Your Pattern: Saturday mornings"
"💚 Cause Match: 3 similar charities"
"🏆 Impact: Top 15% of donors"


Each with optional action button
Create and notify about Tax Documents /report - weeks before filing deadlines - that can be downloaded - plugged into tax apps/ emailed.

Explore App button (primary CTA)

Design Focus:

Celebration should feel rewarding
Insights should feel intelligent (not random)
Each insight should be scannable (icon + title + value)
Action buttons should be clear but not aggressive

Core Components to Design

Button (5 variants)

Primary (blue, high contrast)
Secondary (outline)
Destructive (red)
Ghost (minimal)
Disabled state


Input

Text input
Amount input (with $ prefix)
Error state
Hint text
Label (always visible)


Card

Default (subtle border + shadow)
Elevated (larger shadow)
Selectable (border changes)
Glass (glass-morphism variant)


Charity Card (custom component)
Amount Selector (button group)
Transparency Breakdown (info card)
Impact Preview (hero section)
AI Insight Item (list item with icon)

MY SETUP

Hardware: Mac M3
 # xcrun swift -version
swift-driver version: 1.127.14.1 Apple Swift version 6.2 (swiftlang-6.2.0.19.9 clang-1700.3.19.1)
Target: arm64-apple-macosx15.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 IMMEDIATE TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deliverables (in order):

Color styles (from approved tokens)
Typography styles (from approved tokens)
Spacing/layout grid
Core components (button, input, card)
Wishing Well screens (3 screens)

Timeline: Today for design system, this week for all screens


❓ MY QUESTION


Always starting with the Onboarding interface will get monotonous if i have to do more clicking / touching to quickly transact. how shall we manage that
Maybe - a ww + flux. there's a Let's make someone's day! as a button/ at the bottom to get into. And the transactions portal at the top.

The Wishing Well Flow (3 Screens)
Screen 1: Charity Selection
          ↓ (Continue button)
Screen 2: Amount + Impact
          ↓ (Donate button)
Screen 3: Success + Insights
This should be a LINEAR PROGRESSION, not tabs or scroll, because:
✅ Psychological commitment - Each step increases commitment (like checkout)
✅ Focus - One decision at a time (reduces cognitive load)
✅ Celebration moment - Screen 3 needs to feel like an "arrival"
✅ Progress indication - User sees "Step 1 of 3" (feels achievable)
✅ No going back - After donation, can't undo (so no tabs)
Pattern: Like Stripe Checkout, TurboTax, or Airbnb booking flow
---
📱 BUT for the MAIN APP (After Onboarding)
Now tabs/navigation matter! Here's the right approach:
Mobile: Bottom Tab Bar (Recommended)
┌─────────────────────────────────┐
│                                 │
│        Main Content             │
│        (scrollable)             │
│                                 │
│                                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  🏠      📊      💸      ⚙️     │
│ Home  History  Send  Settings  │
└─────────────────────────────────┘
Tabs:

Home/Dashboard - Balance, AI insights, quick actions
Transactions - History with filters
Send - Quick send money (main action)
Settings - Profile, preferences, help

Desktop: Sidebar Navigation
┌──────┬──────────────────────────┐
│ 🏠   │                          │
│ Home │   Main Content           │
│      │   (scrollable)           │
│ 📊   │                          │
│ Txns │                          │
│      │                          │
│ 💸   │                          │
│ Send │                          │
│      │                          │
│ ⚙️    │                          │
│ Settings │                      │
└─────────────────────────────────┘

