// app/api/donate/route.ts
/* 
validates input,

resolves the charity row to read impact_rate and name,

calls the atomic_apply_donation RPC,

builds a contextual insight based on amount and impact_rate when the RPC returns,

returns { ok, rpc, recent } where rpc contains the RPC result and insight is added if missing,

logs minimal warnings through structured console statements (adapt to prettyLogs if you prefer).

calls the Postgres RPC public.atomic_apply_donation, returns the RPC JSON, and returns recent transactions for the user. It expects your Supabase client at src/lib/supabaseClient.ts and the service role key set in Bolt environment.
uses the shared Supabase client at src/lib/supabaseClient.ts.
uses server-side service role key via src/lib/supabaseClient.ts.
*/
// app/api/donate/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/boltDatabaseClient';

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

function buildInsight(amount: number, charityName: string | null, impactRate?: number | null) {
  const name = charityName ?? 'the charity';
  if (impactRate && impactRate > 0) {
    // impactRate = units per dollar (e.g., meals per $)
    const units = Math.floor(amount * Number(impactRate));
    if (units > 0) {
      return `${name} will receive an impact of approximately ${units} ${impactRate === 1 ? 'unit' : 'units'} from your gift.`;
    }
  }
  // fallback message that still reflects amount and charity
  return `You donated $${amount.toFixed(2)} to ${name}. Thank you for your support.`;
}
export async function POST(req: Request) {
  try {
    // Log headers for debugging
    try {
      console.debug('donate: request headers:', Object.fromEntries(req.headers.entries()));
    } catch (e) {
      console.debug('donate: unable to stringify headers', String(e));
    }

    // Parse JSON body safely and log a preview
    let body: Body | null = null;
    try {
      body = await req.json();
      console.debug('donate: parsed body (preview):', JSON.stringify(body, (k, v) => {
        if (k === 'meta' && v && typeof v === 'object') return '[object]';
        return v;
      }));
    } catch (e) {
      console.warn('donate: failed to parse JSON body', String(e));
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'malformed_json' }, { status: 400 });
    }

    // Validate required fields
    if (!body || !body.userId || (body.amount === undefined || body.amount === null)) {
      console.warn('donate: invalid_request - missing userId or amount', body);
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'missing_userId_or_amount' }, { status: 400 });
    }

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) {
      console.warn('donate: invalid_amount', { amount: body.amount });
      return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });
    }

    // Resolve charity metadata (non-blocking on failure)
    let charity: any = null;
    if (body.charityId) {
      try {
        const { data: c, error: cErr } = await supabaseAdmin
          .from('charities')
          .select('id,name,impact_rate,impact_metric')
          .eq('id', body.charityId)
          .maybeSingle();
        if (cErr) {
          console.warn('donate: failed to load charity metadata', cErr);
        } else {
          charity = c;
        }
      } catch (e) {
        console.warn('donate: error fetching charity metadata', String(e));
      }
    }

    // Prepare RPC params
    const rpcParams = {
      p_user_id: body.userId,
      p_charity_id: body.charityId ?? null,
      p_amount: amount,
      p_note: body.note ?? null,
      p_meta: body.meta ?? (charity ? { impactRate: charity.impact_rate, impactMetric: charity.impact_metric } : null),
    };

    // Call RPC
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('atomic_apply_donation', rpcParams as any);

    if (rpcError) {
      console.error('donate: rpc failed', rpcError);
      return NextResponse.json({ ok: false, error: 'rpc_failed', details: rpcError.message }, { status: 500 });
    }

    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    // Ensure there is at least one insight; synthesize if missing
    try {
      const hasInsight = rpcResult?.tx?.insights && Array.isArray(rpcResult.tx.insights) && rpcResult.tx.insights.length > 0;
      if (!hasInsight) {
        const charityName = charity?.name ?? rpcResult?.tx?.entity_name ?? 'the charity';
        const impactRate = charity?.impact_rate ?? (rpcResult?.tx?.meta?.impactRate ?? null);
        const units = impactRate ? Math.floor(amount * Number(impactRate)) : null;
        const generatedMsg = units && units > 0
          ? `${charityName} will receive approximately ${units} ${impactRate === 1 ? 'unit' : 'units'} from your gift.`
          : `You donated $${amount.toFixed(2)} to ${charityName}. Thank you for your support.`;
        rpcResult.tx = rpcResult.tx ?? {};
        rpcResult.tx.insights = [{ message: generatedMsg, meta: { generated: true, impactRate: impactRate ?? null } }];
      }
    } catch (e) {
      console.warn('donate: insight generation failed', String(e));
    }

    // Fetch recent transactions for the user to power UI
    try {
      const { data: recent, error: recentErr } = await supabaseAdmin
        .from('transactions')
        .select('id,user_id,type,category,entity_id,entity_name,amount,direction,note,timestamp,meta,insights')
        .eq('user_id', body.userId)
        .order('timestamp', { ascending: false })
        .limit(8);

      if (recentErr) {
        console.warn('donate: recent fetch failed', recentErr);
        return NextResponse.json({ ok: true, rpc: rpcResult, recent: null, warning: 'recent_fetch_failed' }, { status: 200 });
      }

      return NextResponse.json({ ok: true, rpc: rpcResult, recent }, { status: 200 });
    } catch (e) {
      console.warn('donate: recent fetch exception', String(e));
      return NextResponse.json({ ok: true, rpc: rpcResult, recent: null }, { status: 200 });
    }
  } catch (err) {
    console.error('donate: unexpected error', String(err));
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
/* export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Body | null;
    if (!body || !body.userId) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });

    const amount = Math.max(0, toNum(body.amount));
    if (amount <= 0) return NextResponse.json({ ok: false, error: 'invalid_amount' }, { status: 400 });

    // Resolve charity metadata to build insight and pass meta where helpful
    let charity: any = null;
    if (body.charityId) {
      const { data: c, error: cErr } = await supabaseAdmin.from('charities').select('id,name,impact_rate,impact_metric').eq('id', body.charityId).maybeSingle();
      if (cErr) {
        // log and continue with null charity but do not fail the donation
        console.warn('donate: failed to load charity metadata', cErr);
      } else {
        charity = c;
      }
    }

    // Prepare RPC params (keep meta passed through)
    const rpcParams = {
      p_user_id: body.userId,
      p_charity_id: body.charityId ?? null,
      p_amount: amount,
      p_note: body.note ?? null,
      p_meta: body.meta ? body.meta : charity ? { impactRate: charity.impact_rate, impactMetric: charity.impact_metric } : null,
    };

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('atomic_apply_donation', rpcParams as any);

    if (rpcError) {
      console.error('donate: rpc failed', rpcError);
      return NextResponse.json({ ok: false, error: 'rpc_failed', details: rpcError.message }, { status: 500 });
    }

    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    // If the RPC returned no insights, synthesize one using charity metadata and amount
    try {
      const hasInsight = rpcResult?.tx?.insights && Array.isArray(rpcResult.tx.insights) && rpcResult.tx.insights.length > 0;
      if (!hasInsight) {
        const charityName = charity?.name ?? rpcResult?.tx?.entity_name ?? null;
        const impactRate = charity?.impact_rate ?? (rpcResult?.tx?.meta?.impactRate ?? null);
        const generated = buildInsight(Number(amount), charityName, impactRate ? Number(impactRate) : null);
        // attach into rpcResult.tx.insights for client convenience
        rpcResult.tx = rpcResult.tx ?? {};
        rpcResult.tx.insights = [{ message: generated, meta: { generated: true, impactRate: impactRate ?? null } }];
      }
    } catch (e) {
      console.warn('donate: insight generation failed', e);
    }

    // fetch recent transactions for the user to power UI immediately
    const { data: recent, error: recentErr } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', body.userId)
      .order('timestamp', { ascending: false })
      .limit(8);

    if (recentErr) {
      console.warn('donate: recent fetch failed', recentErr);
      return NextResponse.json({ ok: true, rpc: rpcResult, recent: null, warning: 'recent_fetch_failed' }, { status: 200 });
    }

    return NextResponse.json({ ok: true, rpc: rpcResult, recent }, { status: 200 });
  } catch (err) {
    console.error('donate: unexpected error', err);
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
 */// --- 123 lines 
