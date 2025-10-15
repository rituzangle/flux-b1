# Flux - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd flux
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 First Time Setup

The app will automatically redirect you to the onboarding flow at `/onboarding`.

### Test the Complete Flow:

1. **Select a Charity** (Step 1 of 3)
   - Choose any of the 6 verified charities
   - Click "Continue"

2. **Choose Donation Amount** (Step 2 of 3)
   - Pick a quick amount ($5, $10, $25, $50)
   - OR enter a custom amount
   - Watch the impact preview animate
   - Click "Donate & See AI Insights"

3. **View Success + AI Insights** (Step 3 of 3)
   - See your donation impact
   - Review 4 AI-powered insights
   - Click "Explore Flux" to enter main app

4. **Explore the Main App**
   - View your balance
   - Check recent activity
   - Try quick actions (Send, Donate, Request)
   - Navigate using bottom nav (mobile) or sidebar (desktop)

## 📱 Navigation

### Mobile (Bottom Bar)
- 🏠 Home - Dashboard with balance and activity
- 📊 History - All transactions
- 💸 Send - Send money to others
- ⚙️ Settings - Account settings

### Desktop (Sidebar)
Same 4 sections, displayed vertically on the left

## 🎨 Key Features to Test

### Wishing Well Prompt
The prompt shows on the dashboard when:
- You've completed onboarding
- It's payday window (1-3rd or 15-17th of month)
- You haven't dismissed it

**To test manually:**
1. Complete onboarding
2. Return to dashboard
3. Check if prompt appears (depends on date)
4. Click dismiss to hide it

### Transaction History
1. Navigate to History tab
2. Use filters: All / Donation / Send / Receive
3. View transaction details

### Send Money
1. Navigate to Send tab
2. Enter recipient name
3. Enter amount
4. Add optional note
5. Click "Send"

## 🔧 Configuration

### Mock Data Mode (Default)
Currently using mock data. Check `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK=true
```

### Customize Mock Data
Edit files in `/mocks/` directory:
- `charities.ts` - Add/edit charities
- `user.ts` - Modify user profile
- `transactions.ts` - Add sample transactions

## 🎯 Testing Different States

### Test as First-Time User
In `/mocks/user.ts`, set:
```typescript
hasCompletedOnboarding: false
```
→ Will redirect to onboarding

### Test as Returning User
In `/mocks/user.ts`, set:
```typescript
hasCompletedOnboarding: true
firstDonationDate: new Date('2025-10-01')
```
→ Will show dashboard

### Test Wishing Well Prompt
In `/mocks/user.ts`, set:
```typescript
hasCompletedOnboarding: true
lastWWPromptShown: null  // or old date
wwPromptDismissedForPayday: false
```
→ Will show prompt if in payday window

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run typecheck  # Check TypeScript types
npm run lint       # Run ESLint
```

## 🎨 Design Tokens

Access design tokens in any component:
```typescript
import { tokens } from '@/utils/tokens';

// Use colors
tokens.colors.brand.primary  // #2563eb
tokens.colors.text.primary   // #0a0a0a

// Use spacing
tokens.spacing.md           // 16px
tokens.spacing.lg           // 24px

// Use typography
tokens.typography.fontSize.base  // 18px
```

## 🧩 Component Library

All components are in `/components/`:

### Base UI
- `Button` - 5 variants
- `Input` - Text, amount, with validation
- `Card` - 4 variants
- `ProgressIndicator` - Step tracking

### Import Example
```typescript
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Card variant="glass">
  Content here
</Card>
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Dependencies Issue
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check TypeScript
npm run typecheck

# Clear Next.js cache
rm -rf .next
npm run build
```

## 📚 Learn More

- Check `README.md` for full documentation
- See `IMPLEMENTATION_NOTES.md` for technical details
- Explore `/components/` for component examples
- Review `/utils/api.ts` for API patterns

## 🎉 You're Ready!

The app is now running and fully functional. Start exploring and customizing!

Questions? Check the implementation notes or dive into the code - it's well-documented and modular.
