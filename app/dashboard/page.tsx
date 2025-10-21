/**
 * Path: app/dashboard/page.tsx
 * Main Dashboard page — post‑onboarding home
 * Features:
 * - Displays user balance
 * - Shows quick actions (Send, Donate, Request)
 * - Lists recent activity
 * - Loads data via utils/api with mock/real toggle
 * - Structured logging for observability
 */
// app/dashboard/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/src/components/dashboard/BalanceCard';
import QuickActions from '@/src/components/dashboard/QuickActions';
import RecentActivity from '@/src/components/dashboard/RecentActivity';
import { fetchUser, fetchTransactions } from '@/src/utils/api';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import Card from '@/src/components/ui/Card';
import { logger } from '@/src/utils/prettyLogs';

function safeDate(ts: any) {
  try {
    if (!ts) return '—';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  } catch {
    return '—';
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(() => (runtimeStore && runtimeStore.user) ?? null);
  const [transactions, setTransactions] = useState<any[]>(() => (runtimeStore && runtimeStore.transactions) ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadFromApi() {
      setLoading(true);
      try {
        const u = typeof fetchUser === 'function' ? await fetchUser().catch(() => null) : null;
        const tx = typeof fetchTransactions === 'function' ? await fetchTransactions().catch(() => []) : null;

        if (mounted) {
          if (u && u.user) setUser(u.user);
          if (Array.isArray(tx)) setTransactions(tx);
        }
      } catch (e) {
        logger.debug('dashboard: API fetch failed, fallback to runtimeStore', 'dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFromApi();

    const interval = setInterval(() => {
      if (!mounted) return;
      try {
        const rsUser = (runtimeStore && runtimeStore.user) ?? null;
        const rsTx = (runtimeStore && runtimeStore.transactions) ?? [];
        if (rsUser) setUser(rsUser);
        if (Array.isArray(rsTx)) setTransactions(rsTx);
      } catch {
        // ignore
      }
    }, 700);

    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Ensure displayed balance is numeric and non-negative
  const displayBalance = user ? (Number.isFinite(Number(user.balance)) ? Math.max(0, Number(user.balance)) : 0) : 0;

  const onSend = () => router.push('/send');
  const onDiscover = () => router.push('/onboarding');

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome{user?.name ? `, ${user.name}` : ''}.</p>
      </header>

      <section className="grid gap-4">
        <Card>
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1">
              {BalanceCard ? <BalanceCard user={{ ...user, balance: displayBalance }} /> : (
                <div>
                  <div className="text-sm text-muted-foreground">Available Balance</div>
                  <div className="text-2xl font-semibold">${displayBalance.toFixed(2)}</div>
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-0 md:ml-4">
              {QuickActions ? <QuickActions onSend={onSend} onDiscover={onDiscover} /> : (
                <div className="flex gap-2">
                  <button onClick={onSend} className="px-3 py-2 border rounded">Send</button>
                  <button onClick={onDiscover} className="px-3 py-2 border rounded">Donate</button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium">Recent Activity</h3>
          <div className="mt-3">
            {transactions && transactions.length > 0 ? (
              <ul className="space-y-2">
                {transactions.slice(0, 8).map((t: any) => (
                  <li key={t.id} className="flex justify-between">
                    <div>
                      <div className="font-medium">{t.charityId ?? (t.counterpartyName ?? 'Activity')}</div>
                      {t.note && <div className="text-sm text-muted-foreground">{t.note}</div>}
                    </div>
                    <div className="text-right">
                      <div className={`${t.amount < 0 ? 'text-red-600' : ''}`}>${Number(t.amount).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{safeDate(t.timestamp)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-3">No recent activity.</p>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

// - cp app/dashboard/page.tsx app/dashboard/page.tsx.bak