// src/components/dashboard/RecentActivity.tsx
/* RecentActivity component so each transaction shows a clear title:

For donations: show the charity name (lookup by charityId).

For sends: show the counterpartyName or "Sent".

For other types: show a readable type label or fallback to "Activity".

This single-file replacement reads the current transactions, looks up charities from the canonical runtimeStore, formats amounts and dates safely, and preserves your styling and component imports.
*/
'use client';
import React from 'react';
import Card from '@/src/components/ui/Card';
import { runtimeStore } from '@/src/mocks/runtimeStore';

type RecentActivityProps = {
  transactions?: any[];
};

function safeDate(ts: any) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function formatAmount(t: any) {
  const amt = Number(t.amount || 0);
  const isSend = t.type === 'send';
  const sign = isSend ? '-' : '';
  return `${sign}$${Math.abs(amt).toFixed(2)}`;
}

export default function RecentActivity({ transactions }: RecentActivityProps) {
  // prefer passed-in transactions; fall back to runtimeStore (dev)
  const txs = Array.isArray(transactions)
    ? transactions
    : (runtimeStore && Array.isArray(runtimeStore.transactions) ? runtimeStore.transactions : []);

  // build a charity lookup map from runtimeStore
  const charitiesById = (runtimeStore && Array.isArray(runtimeStore.charities))
    ? Object.fromEntries(runtimeStore.charities.map((c: any) => [c.id, c]))
    : {};

  if (!txs || txs.length === 0) {
    return (
      <Card>
        <h3 className="font-medium">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-3">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-medium">Recent Activity</h3>
      <ul className="mt-3 space-y-2">
        {txs.slice(0, 8).map((t: any) => {
          // determine title
          let title = 'Activity';
          if (t.type === 'donation' || t.charityId) {
            const charity = charitiesById[t.charityId] || null;
            title = charity ? charity.name : (t.charityId ?? 'Donation');
          } else if (t.type === 'send') {
            title = t.counterpartyName || 'Sent';
          } else if (t.description) {
            title = t.description;
          } else if (t.type) {
            title = t.type.charAt(0).toUpperCase() + t.type.slice(1);
          }

          return (
            <li key={t.id} className="flex justify-between">
              <div>
                <div className="font-medium">{title}</div>
                {t.note && <div className="text-sm text-muted-foreground">{t.note}</div>}
              </div>

              <div className="text-right">
                <div className={`${Number(t.amount) < 0 ? 'text-red-600' : ''}`}>{formatAmount(t)}</div>
                <div className="text-xs text-muted-foreground">{safeDate(t.timestamp)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
// --- 80 lines oct 20