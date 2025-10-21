// src/components/dashboard/RecentActivity.tsx
/* RecentActivity component so each transaction shows a clear title:

For donations: show the charity name (lookup by charityId).

For sends: show the counterpartyName or "Sent".

For other types: show a readable type label or fallback to "Activity".

This single-file replacement reads the current transactions, looks up charities from the canonical runtimeStore, formats amounts and dates safely, and preserves your styling and component imports.
*/
// src/components/dashboard/RecentActivity.tsx
'use client';
import React from 'react';
import Card from '@/src/components/ui/Card';
import { runtimeStore } from '@/mocks/runtimeStore';

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
  const txs = Array.isArray(transactions)
    ? transactions
    : (runtimeStore && Array.isArray(runtimeStore.transactions) ? runtimeStore.transactions : []);

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
          // Title and subtitle
          let title = 'Activity';
          let subtitle: string | null = null;

          if (t.type === 'donation' || t.charityId) {
            const charity = charitiesById[t.charityId] || null;
            title = `Donation`;
            subtitle = charity ? charity.name : (t.charityId ?? 'Donation');
          } else if (t.type === 'send') {
            title = 'Send';
            subtitle = t.counterpartyName || t.counterpartyId || 'Recipient';
          } else if (t.description) {
            title = t.description;
          } else if (t.type) {
            title = t.type.charAt(0).toUpperCase() + t.type.slice(1);
          }

          return (
            <li key={t.id} className="flex justify-between">
              <div>
                <div className="font-medium">{title}{subtitle ? ` — ${subtitle}` : ''}</div>
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
// --- 93 lines oct 20