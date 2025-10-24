/*  app/api/donate/route.ts 
- validates input, 
-resolves the charity row to read impact_rate and name, 
-calls the atomic_apply_donation RPC,
- builds a contextual insight based on amount and impact_rate when the RPC returns,
- returns { ok, rpc, recent } where rpc contains the RPC result and insight is added if missing,
- logs minimal warnings through structured console statements (adapt to prettyLogs if you prefer).
- calls the Postgres RPC public.atomic_apply_donation, returns the RPC JSON, and returns recent transactions for the user. It expects your Supabase client at src/lib/supabaseClient.ts and the service role key set in Bolt environment.
- uses the shared Supabase client at src/lib/supabaseClient.ts.
- uses server-side service role key via src/lib/supabaseClient.ts.
*/
// 'use server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/boltDatabaseClient';
import { charities as mockCharities } from '@/src/mocks/charities';
export const dynamic = 'force-dynamic';

type Body = {
  userId?: string;
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
    const units = Math.floor(amount * Number(impactRate));
    if (units > 0) {
      return `${name} will receive an impact of approximately ${units} ${impactRate === 1 ? 'unit' : 'units'} from your gift.`;
    }
  }
  return `You donated $${amount.toFixed(2)} to ${name}. Thank you for your support.`;
}

/**
 * Robust token extraction:
 * - Accepts explicit body.userId
 * - Authorization: Bearer <access_token>
 * - Common Supabase cookie names (handles plain token or JSON cookie payload)
 * - Dev fallback via x-user-id header (LOCAL DEV ONLY)
 */
async function extractUserIdFromRequest(req: Request, body: any, devFallbackUser?: string | null): Promise<string | null> {
  if (body?.userId) return body.userId;

  // Dev fallback header (only when provided, remove in prod)
  if (devFallbackUser) return devFallbackUser;

  // Authorization header bearer token
  const authHeader = (req.headers.get('authorization') || req.headers.get('Authorization') || '').trim();
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (!userErr && userData?.user?.id) return userData.user.id;
      } catch (e) {
        console.warn('donate: getUser by bearer token failed', String(e));
      }
    }
  }

  // Cookie-based tokens. Supabase sometimes stores several cookie formats.
  const cookieHeader = req.headers.get('cookie') || '';
  const parseCookieValue = (name: string) => {
    const kv = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
    if (!kv) return null;
    return decodeURIComponent(kv.split('=').slice(1).join('='));
  };

  const possibleNames = ['sb-access-token', 'supabase-auth-token', 'supabase_session', 'sb:token', 'sb-raw-token'];
  for (const name of possibleNames) {
    const raw = parseCookieValue(name);
    if (!raw) continue;

    // cookie might be JSON with access_token property or raw token
    try {
      // Try parse JSON first
      const parsed = JSON.parse(raw);
      const maybeToken = parsed?.access_token ?? parsed?.token ?? null;
      if (maybeToken) {
        try {
          const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(maybeToken);
          if (!userErr && userData?.user?.id) return userData.user.id;
        } catch (e) {
          console.warn(`donate: getUser from cookie ${name} json token failed`, String(e));
        }
      }
    } catch {
      // not JSON, treat raw as token
      try {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(raw);
        if (!userErr && userData?.user?.id) return userData.user.id;
      } catch (e) {
        console.warn(`donate: getUser from cookie ${name} raw token failed`, String(e));
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    // Debug incoming headers (masked) for local troubleshooting
    try {
      const headersPreview = Object.fromEntries([...req.headers.entries()].map(([k, v]) => {
        if (k.toLowerCase() === 'authorization') return [k, `${String(v).slice(0,8)}...${String(v).slice(-8)}`];
        if (k.toLowerCase() === 'cookie') return [k, String(v).slice(0,120)];
        return [k, v];
      }));
      console.debug('donate: request headers preview:', headersPreview);
    } catch {
      console.debug('donate: unable to preview headers');
    }

    // Parse JSON body
    let body: Body | null = null;
    try {
      body = await req.json();
    } catch (e) {
      console.warn('donate: failed to parse JSON body', String(e));
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'malformed_json' }, { status: 400 });
    }

    // Dev fallback user id (local convenience). Remove or guard in production.
    const devFallbackUser = req.headers.get('x-user-id') || null;
    if (!devFallbackUser) {
      // Also support numeric/test header name used by some scripts
      // no-op
    } else {
      console.debug('donate: using dev fallback x-user-id (DEV ONLY):', devFallbackUser);
    }

    // Derive user id from body/auth surfaces
    const derivedUserId = await extractUserIdFromRequest(req, body, devFallbackUser);

    // Debug auth surfaces
    try {
      const authPresent = !!(req.headers.get('authorization') || req.headers.get('cookie'));
      console.debug('donate: debug auth present:', authPresent, 'derivedUserId:', derivedUserId);
    } catch {
      // ignore
    }

    if (!body) {
      console.warn('donate: invalid_request - empty body');
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'empty_body' }, { status: 400 });
    }

    if (!derivedUserId) {
      console.warn('donate: invalid_request - missing userId and no valid auth token found');
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'missing_userId_or_auth' }, { status: 401 });
    }

    body.userId = body.userId ?? derivedUserId;

    if (body.amount === undefined || body.amount === null) {
      console.warn('donate: invalid_request - missing amount', body);
      return NextResponse.json({ ok: false, error: 'invalid_request', details: 'missing_amount' }, { status: 400 });
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
        } else if (c) {
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

    // Synthesize insight if none returned
    try {
      const hasInsight = rpcResult?.tx?.insights && Array.isArray(rpcResult.tx.insights) && rpcResult.tx.insights.length > 0;
      if (!hasInsight) {
        const charityName = charity?.name ?? rpcResult?.tx?.entity_name ?? 'the charity';
        const impactRate = charity?.impact_rate ?? (rpcResult?.tx?.meta?.impactRate ?? null);
        const generatedMsg = buildInsight(amount, charityName, impactRate ?? null);
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
// --- 218 lines 
