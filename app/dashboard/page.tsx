// app/dashboard/page.tsx
import BalanceCard from '@/components/dashboard/BalanceCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <BalanceCard />
      <QuickActions />
      <RecentActivity />
    </div>
  );
}
