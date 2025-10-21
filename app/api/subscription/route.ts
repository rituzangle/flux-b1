// app/api/subscription/route.ts
//create subscription payment or subscription record

import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type Body = { userId: string; name: string; entityId?: string; entityName?: string; amount: number | string; cadence?: string; nextDue?: string; note?: string };

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body || !body.userId || !body.name) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });

    // Insert subscription record
    const subRow = {
      user_id: body.userId,
      name: body.name,
      entity_id: body.entityId ?? null,
      entity_name: body.entityName ?? null,
      amount,
      cadence: body.cadence ?? 'monthly',
      next_due: body.nextDue ?? null,
      active: true,
      metadata: { note: body.note ?? null },
    };

    const { data: subIns, error: subErr } = await supabase.from('subscriptions').insert(subRow).select().limit(1).single();
    if (subErr) {
      logger.error('subscription: insert failed ' + String(subErr), 'subscription');
      return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 });
    }

    // Optionally create initial transaction (if you collect first payment now)
    const createTx = true;
    let txIns = null;
    if (createTx) {
      const txRow = {
        user_id: body.userId,
        type: 'subscription',
        category: 'subscriptions',
        entity_id: body.entityId ?? null,
        entity_name: body.entityName ?? null,
        amount,
        direction: 'outgoing',
        note: `Subscription: ${body.name}`,
        meta: { cadence: subRow.cadence },
        insights: null,
      };
      const { data: t, error: tErr } = await supabase.from('transactions').insert(txRow).select().limit(1).single();
      if (tErr) {
        logger.error('subscription: tx insert failed ' + String(tErr), 'subscription');
      } else {
        txIns = t;
        const { data: u } = await supabase.from('app_users').select('*').eq('id', body.userId).limit(1).single();
        if (u) {
          const newBalance = Math.max(0, Number(u.balance) - amount);
          await supabase.from('app_users').update({ balance: newBalance }).eq('id', body.userId);
        }
      }
    }

    const { data: recent } = await supabase.from('transactions').select('*').eq('user_id', body.userId).order('timestamp', { ascending: false }).limit(8);

    return NextResponse.json({ ok: true, subscription: subIns, tx: txIns, recent });
  } catch (err) {
    logger.error('subscription: unexpected ' + String(err), 'subscription');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
