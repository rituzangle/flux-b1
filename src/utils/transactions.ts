// src/utils/transactions.ts
// Helper to build canonical transaction objects and apply them to runtimeStore.
// Centralizes numeric coercion, timestamping, direction, balance update and meta.

import { runtimeStore } from '@/src/mocks/runtimeStore';
import type { RuntimeStoreShape } from '@/src/mocks/runtimeStore';

type BuildTxOpts = {
  type: 'donation' | 'send' | 'bill' | 'subscription' | 'refund' | 'reward' | 'adjustment' | string;
  entityId?: string | null;           // charityId, recipientId, billerId, etc.
  entityName?: string | null;         // resolved display name
  amount: number | string;
  note?: string | null;
  meta?: Record<string, any>;
  userId?: string | null;
};

function toNumber(val: number | string) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function directionForType(type: string) {
  // outgoing reduces balance; incoming increases balance
  const outgoingTypes = new Set(['donation', 'send', 'bill', 'subscription', 'adjustment']);
  return outgoingTypes.has(type) ? 'outgoing' : 'incoming';
}

function categoryForType(type: string) {
  if (type === 'donation') return 'charity';
  if (type === 'send') return 'transfer';
  if (type === 'bill') return 'bills';
  if (type === 'subscription') return 'subscriptions';
  if (type === 'refund') return 'refunds';
  return 'other';
}

export function buildTransaction(opts: BuildTxOpts) {
  const amount = Math.abs(toNumber(opts.amount));
  const type = opts.type || 'other';
  const direction = directionForType(type);
  const category = categoryForType(type);
  const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const tx: any = {
    id,
    userId: opts.userId ?? (runtimeStore && runtimeStore.user?.id) ?? 'unknown',
    type,
    category,
    entityId: opts.entityId ?? null,
    entityName: opts.entityName ?? null,
    amount,
    direction,
    note: opts.note ?? null,
    timestamp: new Date().toISOString(),
    meta: opts.meta ?? {},
    insightsGenerated: [] as string[],
  };

  // compute a simple donation insight if appropriate
  try {
    if (type === 'donation' && tx.meta?.impactRate) {
      const rate = Number(tx.meta.impactRate) || 1;
      const impact = Math.max(1, Math.floor(amount / rate));
      const metric = tx.meta?.impactMetric ?? 'people';
      tx.insightsGenerated.push(`You helped ${impact} ${metric} with your donation to ${tx.entityName ?? 'the charity'}.`);
    }
  } catch {
    // ignore insight computation failures
  }

  return tx;
}

export function applyTransactionToStore(tx: any, store?: RuntimeStoreShape) {
  const rs = store ?? runtimeStore;
  if (!rs) throw new Error('runtimeStore missing');

  // Ensure transactions array exists
  rs.transactions = rs.transactions || [];

  // Normalize amount storage: keep positive amount; direction indicates sign
  // Update balance consistently: outgoing subtracts, incoming adds
  const balBefore = Number(rs.user?.balance ?? 0);
  const amt = Number(tx.amount || 0);
  if (tx.direction === 'outgoing') {
    rs.user = { ...(rs.user ?? {}), balance: Math.max(0, +(balBefore - amt).toFixed(2)) };
  } else {
    rs.user = { ...(rs.user ?? {}), balance: +(balBefore + amt).toFixed(2) };
  }

  // Unshift so newest first
  rs.transactions.unshift(tx);
  if (rs.transactions.length > 1000) rs.transactions.length = 1000;

  return { user: { ...rs.user }, tx, recent: rs.transactions.slice(0, 8) };
}
// --- 98 lines --- Oct 20
