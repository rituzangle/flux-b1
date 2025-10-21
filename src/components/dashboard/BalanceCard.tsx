// src/components/dashboard/BalanceCard.tsx
// src/components/dashboard/BalanceCard.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Card from '@/src/components/ui/Card';
import { runtimeStore } from '@/src/mocks/runtimeStore';
import { logger } from '@/src/utils/prettyLogs';

export default function BalanceCard({ user: initialUser }: { user?: any }) {
  const [user, setUser] = useState<any>(() => initialUser ?? ((runtimeStore && runtimeStore.user) ?? null));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      try {
        if (!mounted) return;
        const rsUser = (runtimeStore && runtimeStore.user) ?? null;
        if (rsUser) setUser(rsUser);
      } catch (e) {
        logger.debug('BalanceCard: runtimeStore read failed', 'BalanceCard');
      }
    };
    // quick initial sync
    refresh();
    const id = setInterval(refresh, 700);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Ensure balance is numeric and non-negative
  const raw = user && user.balance !== undefined ? Number(user.balance) : 0;
  const balance = Number.isFinite(raw) ? Math.max(0, raw) : 0;

  return (
    <Card>
      <div>
        <div className="text-sm text-muted-foreground">Available Balance</div>
        <div className="text-2xl font-semibold">${balance.toFixed(2)}</div>
      </div>
    </Card>
  );
}
