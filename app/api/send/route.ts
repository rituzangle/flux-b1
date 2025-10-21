/**
 * Path: app/api/send/route.ts
 * POST /api/send
 * Uses atomic_apply_send RPC for consistent money transfers
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/boltDatabaseClient';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

type Body = {
  userId: string;
  recipientEmail?: string;
  recipientName?: string;
  amount: number | string;
  note?: string;
  meta?: Record<string, any> | null;
};

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body || !body.userId) {
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    if (!body.recipientEmail) {
      return NextResponse.json({ ok: false, error: 'missing_recipient' }, { status: 400 });
    }

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('atomic_apply_send', {
      p_sender_id: body.userId,
      p_recipient_email: body.recipientEmail,
      p_recipient_name: body.recipientName || 'Recipient',
      p_amount: amount,
      p_note: body.note ?? null,
      p_meta: body.meta ?? null,
    });

    if (rpcError) {
      logger.error('send: rpc failed ' + String(rpcError), 'send');
      return NextResponse.json({ ok: false, error: 'rpc_failed', details: rpcError.message }, { status: 500 });
    }

    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!rpcResult.ok) {
      return NextResponse.json(rpcResult, { status: 400 });
    }

    const { data: recent } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', body.userId)
      .order('timestamp', { ascending: false })
      .limit(8);

    return NextResponse.json({ ok: true, rpc: rpcResult, recent }, { status: 200 });
  } catch (err) {
    logger.error('send: unexpected ' + String(err), 'send');
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}

// --- Oct 21
