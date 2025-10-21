// app/api/bill/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type Body = { userId: string; billerId?: string; billerName?: string; amount: number | string; note?: string };

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body || !body.userId) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });

    const txRow = {
      user_id: body.userId,
      type: 'bill',
      category: 'bills',
      entity_id: body.billerId ?? null,
      entity_name: body.billerName ?? null,
      amount,
      direction: 'outgoing',
      note: body.note ?? null,
      meta: null,
      insights: null,
    };

    const { data: txIns, error: txErr } = await supabase.from('transactions').insert(txRow).select().limit(1).single();
    if (txErr) {
      logger.error('bill: tx insert failed ' + String(txErr), 'bill');
      return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 });
    }

    const { data: u } = await supabase.from('app_users').select('*').eq('id', body.userId).limit(1).single();
    if (!u) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 404 });
    const newBalance = Math.max(0, Number(u.balance) - amount);
    const { data: uu } = await supabase.from('app_users').update({ balance: newBalance }).eq('id', body.userId).select().limit(1).single();

    const { data: recent } = await supabase.from('transactions').select('*').eq('user_id', body.userId).order('timestamp', { ascending: false }).limit(8);

    return NextResponse.json({ ok: true, user: uu, tx: txIns, recent });
  } catch (err) {
    logger.error('bill: unexpected ' + String(err), 'bill');
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
