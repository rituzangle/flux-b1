// app/api/donate/route.ts
/* 
calls the Postgres RPC public.atomic_apply_donation, returns the RPC JSON, and returns recent transactions for the user. It expects your Supabase client at src/lib/supabaseClient.ts and the service role key set in Bolt environment.
uses the shared Supabase client at src/lib/supabaseClient.ts.
uses server-side service role key via src/lib/supabaseClient.ts.
*/
// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';

export const dynamic = 'force-dynamic';

type Body = {
  userId: string;
  charityId?: string | null;
  amount: number | string;
  note?: string | null;
  meta?: Record<string, any> | null;
};

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

    const rpcParams = {
      p_user_id: body.userId,
      p_charity_id: body.charityId ?? null,
      p_amount: amount,
      p_note: body.note ?? null,
      p_meta: body.meta ? body.meta : null,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('atomic_apply_donation', rpcParams as any);

    if (rpcError) {
      return NextResponse.json({ ok: false, error: 'rpc_failed', details: rpcError.message }, { status: 500 });
    }

    // rpcData is the jsonb result returned by the function; it may be wrapped or stringified by supabase
    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    // fetch recent transactions for the user to power UI immediately
    const { data: recent, error: recentErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', body.userId)
      .order('timestamp', { ascending: false })
      .limit(8);

    if (recentErr) {
      return NextResponse.json({ ok: true, rpc: rpcResult, recent: null, warning: 'recent_fetch_failed' }, { status: 200 });
    }

    return NextResponse.json({ ok: true, rpc: rpcResult, recent }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
// --- 68 lines 
