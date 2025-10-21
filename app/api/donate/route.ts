// app/api/donate/route.ts
/* 

uses the shared Supabase client at src/lib/supabaseClient.ts.
uses server-side service role key via src/lib/supabaseClient.ts.
*/

import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type Body = { userId: string; charityId: string; amount: number | string; note?: string };

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body || !body.userId || !body.charityId) {
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });

    // Resolve charity for entity_name and impact meta
    const { data: charity } = await supabase.from('charities').select('*').eq('id', body.charityId).limit(1).single();
    const entityName = charity?.name ?? null;
    const meta = { impactRate: charity?.impact_rate ?? null, impactMetric: charity?.impact_metric ?? null };

    // Build tx row
    const txRow = {
      user_id: body.userId,
      type: 'donation',
      category: 'charity',
      entity_id: body.charityId,
      entity_name: entityName,
      amount: amount,
      direction: 'outgoing',
      note: body.note ?? null,
      meta,
      insights: null,
    };

    // Insert transaction
    const { data: txIns, error: txErr } = await supabase.from('transactions').insert(txRow).select().limit(1).single();
    if (txErr) {
      logger.error('donate: tx insert failed ' + String(txErr), 'donate');
      return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 });
    }

    // Update user balance and total_donated
    const update = await supabase.rpc('atomic_apply_donation', { p_user_id: body.userId, p_amount: amount }).catch(() => null);

    // Fallback if RPC not available: update user balance and total_donated conservatively
    let user: any = null;
    if (update && update.data) {
      user = update.data;
    } else {
      // read user, compute and update
      const { data: u } = await supabase.from('app_users').select('*').eq('id', body.userId).limit(1).single();
      if (!u) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 404 });
      const newBalance = Math.max(0, Number(u.balance) - amount);
      const newTotalDonated = Number(u.total_donated ?? 0) + amount;
      const { data: uu } = await supabase.from('app_users').update({ balance: newBalance, total_donated: newTotalDonated }).eq('id', body.userId).select().limit(1).single();
      user = uu;
    }

    // Fetch recent transactions for this user
    const { data: recent } = await supabase.from('transactions').select('*').eq('user_id', body.userId).order('timestamp', { ascending: false }).limit(8);

    return NextResponse.json({ ok: true, user, tx: txIns, recent });
  } catch (err) {
    logger.error('donate: unexpected ' + String(err), 'donate');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
// --- 76 lines 
