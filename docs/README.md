# Flux - AI-First Payment Platform

A Next.js 14+ payment platform with charitable onboarding and AI-powered financial insights.

## Features

- **Wishing Well Onboarding**: 3-step charitable donation flow that introduces users to AI insights
- **Smart Payday Prompts**: Contextual donation prompts around typical payday windows
- **Transaction Management**: Send money, receive payments, and track all activity
- **AI Insights**: Mock AI-powered predictions and patterns (ready for real AI integration)
- **Accessibility-First**: WCAG 2.2 AAA compliant with 7:1 contrast ratios
- **Mock-First Architecture**: Complete mock data layer for rapid development

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React
- **State**: React Context + Hooks

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
flux/
├── app/                    # Next.js App Router pages
│   ├── onboarding/        # 3-step donation flow
│   ├── history/           # Transaction history
│   ├── send/              # Send money
│   └── settings/          # User settings
├── components/
│   ├── ui/                # Base UI components
│   ├── onboarding/        # Onboarding-specific components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Navigation components
├── utils/
│   ├── api.ts            # API abstraction layer
│   ├── types.ts          # TypeScript interfaces
│   ├── tokens.ts         # Design tokens
│   └── paydayDetector.ts # Wishing Well prompt logic
└── mocks/                # Mock data (isolated)
    ├── charities.ts
    ├── user.ts
    ├── transactions.ts
    └── donations.ts
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_USE_MOCK=true

# Future: Real API keys
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Mock Mode

By default, the app uses mock data. Set `NEXT_PUBLIC_USE_MOCK=true` to enable mock mode.

All mock data is isolated in `/mocks/` and accessed through `/utils/api.ts`. This makes it easy to swap in real APIs later without changing component code.

## Key Flows

### First-Time User (Onboarding)

1. Land on `/onboarding` - Select charity
2. Navigate to `/onboarding/amount` - Choose donation amount
3. Complete at `/onboarding/success` - See AI insights
4. Redirect to dashboard (`/`)

### Returning User

1. Land on dashboard (`/`)
2. See contextual Wishing Well prompt (if in payday window)
3. Access all app features via bottom nav (mobile) or sidebar (desktop)

## Design System

### Colors

- **Backgrounds**: Warm off-white (#fafaf9) for reduced eye strain
- **Text**: True black (#0a0a0a) for maximum contrast (7:1 ratio)
- **Brand**: Blue primary (#2563eb), success green (#10b981)

### Typography

- **Body**: 18px (comfortable reading size)
- **Line Height**: 1.6 (reduces eye strain)
- **Font**: System UI sans-serif

### Accessibility

- ✅ WCAG 2.2 AAA compliance
- ✅ 44x44px minimum touch targets
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Visible focus indicators
- ✅ Respects `prefers-reduced-motion`

## API Integration

The app is designed with a clean API abstraction layer (`/utils/api.ts`). To integrate real APIs:

1. Set up your backend endpoints
2. Update environment variables
3. Set `NEXT_PUBLIC_USE_MOCK=false`
4. Implement real API calls in `api.ts`

No component code needs to change - they all use the abstraction layer.

## Future Enhancements

- [ ] Real AI integration for insights
- [ ] Stripe payment processing
- [ ] User authentication (Supabase)
- [ ] Real-time notifications
- [ ] Social features (friend requests, split bills)
- [ ] Recurring donations
- [ ] Tax receipt generation

## License

Proprietary - All rights reserved
