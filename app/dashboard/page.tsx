// app/dashboard/page.tsx
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import QuickActions from '@/src/components/dashboard/QuickActions';
import RecentActivity from '@/src/components/dashboard/RecentActivity';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const mockBalance = 1234.56; // Replace with real data when available

  return (
    <div className="space-y-6 p-6">
      <BalanceCard balance={mockBalance} />
      <QuickActions />
      <RecentActivity transactions={[]} />
    </div>
  );
}
