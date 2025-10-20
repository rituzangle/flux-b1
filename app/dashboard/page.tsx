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
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { useRouter } from 'next/navigation';
import { logger } from '@/src/utils/prettyLogs';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(() => (runtimeStore && runtimeStore.user) ?? null);
  const [recent, setRecent] = useState(() => (runtimeStore && runtimeStore.transactions) ?? []);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      if (!mounted) return;
      setUser((runtimeStore && runtimeStore.user) ?? null);
      setRecent((runtimeStore && runtimeStore.transactions) ?? []);
    };
    const id = setInterval(refresh, 700);
    refresh();
    logger.debug('dashboard: started polling runtimeStore', 'dashboard');
    return () => {
      mounted = false;
      clearInterval(id);
      logger.debug('dashboard: stopped polling runtimeStore', 'dashboard');
    };
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome{user?.name ? `, ${user.name}` : ''}.
        </p>
        <p className="text-lg font-semibold">Balance: ${user ? Number(user.balance).toFixed(2) : '0.00'}</p>
      </header>

      <section className="grid gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-3 flex gap-2">
            <button onClick={() => router.push('/send')} className="px-3 py-2 border rounded">Send</button>
            <button onClick={() => router.push('/onboarding')} className="px-3 py-2 border rounded">Discover causes</button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium">Recent Activity</h3>
          {recent && recent.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {recent.slice(0, 8).map((t: any) => (
                <li key={t.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{t.charityId}</div>
                    {t.note && <div className="text-sm text-muted-foreground">{t.note}</div>}
                  </div>
                  <div className="text-right">
                    <div>${Number(t.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.timestamp).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mt-3">No recent activity.</p>
          )}
        </div>
      </section>
    </main>
  );
}
// - cp app/dashboard/page.tsx app/dashboard/page.tsx.bak