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

/**
 * Try several heuristics to resolve a charity name from a transaction:
 * 1) match charity.id === charityId
 * 2) match charity.id === `charity-${charityId}` or stripped digits
 * 3) slug match: charityId contains charity.name slug
 * 4) alias map: check common name variations
 */
function resolveCharityName(charityId: any, charities: any[]) {
  if (!charityId || !Array.isArray(charities)) return null;
  const cid = String(charityId);

  // build maps
  const byId = Object.fromEntries(charities.map((c: any) => [String(c.id), c]));
  const byLowerName = Object.fromEntries(charities.map((c: any) => [String(c.name || '').toLowerCase(), c]));

  // 1) direct id
  if (byId[cid] && byId[cid].name) return byId[cid].name;

  // 2) try prefixed or numeric variants: "charity-1" vs "1"
  if (cid.match(/^\d+$/)) {
    const alt = `charity-${cid}`;
    if (byId[alt] && byId[alt].name) return byId[alt].name;
  }
  const stripped = cid.replace(/^charity-/, '');
  if (byId[stripped] && byId[stripped].name) return byId[stripped].name;

  // 3) slug match: see if any charity name slug appears inside the id
  const slug = cid.toLowerCase();
  for (const c of charities) {
    const nameSlug = String(c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (nameSlug && slug.includes(nameSlug)) return c.name;
  }

  // 4) alias heuristics: check if id looks like a known short code (e.g., 'red-cross' or 'unicef')
  for (const c of charities) {
    const low = String(c.name || '').toLowerCase();
    if (cid.toLowerCase().includes(low.split(' ')[0])) return c.name;
  }

  // 5) fallback: try matching by name exact (if charityId is actually a name)
  const lower = cid.toLowerCase();
  if (byLowerName[lower] && byLowerName[lower].name) return byLowerName[lower].name;

  return null;
}

export default function RecentActivity({ transactions }: RecentActivityProps) {
  const txs = Array.isArray(transactions)
    ? transactions
    : (runtimeStore && Array.isArray(runtimeStore.transactions) ? runtimeStore.transactions : []);

  const charities = (runtimeStore && Array.isArray(runtimeStore.charities)) ? runtimeStore.charities : [];

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
          // determine label and secondary text
          let typeLabel = 'Activity';
          let entity = null;

          if (t.type === 'donation' || t.charityId) {
            typeLabel = 'Donation';
            entity = resolveCharityName(t.charityId, charities) || t.charityId || null;
          } else if (t.type === 'send') {
            typeLabel = 'Send';
            entity = t.counterpartyName || t.counterpartyId || null;
          } else if (t.type) {
            typeLabel = t.type.charAt(0).toUpperCase() + t.type.slice(1);
          }

          const title = entity ? `${typeLabel} — ${entity}` : typeLabel;

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
// --- 137 lines oct 20