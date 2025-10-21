/**
 * Path: app/api/transactions/route.ts
 Ensure API transactions route returns runtimeStore.transactions
 */
import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabaseClient';

export const dynamic = 'force-dynamic';

type Query = {
  userId?: string | null;
  page?: string | null;
  pageSize?: string | null;
  type?: string | null;
  since?: string | null;
};

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams;
    const params: Query = {
      userId: q.get('userId'),
      page: q.get('page'),
      pageSize: q.get('pageSize'),
      type: q.get('type'),
      since: q.get('since'),
    };

    if (!params.userId) {
      return NextResponse.json({ ok: false, error: 'missing_userId' }, { status: 400 });
    }

    const page = toInt(params.page, 1);
    const pageSize = Math.min(100, toInt(params.pageSize, 20));
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('transactions')
      .select('id,user_id,type,category,entity_id,entity_name,amount,direction,note,timestamp,meta,insights', { count: 'exact' })
      .eq('user_id', params.userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.since) {
      const sinceDate = new Date(params.since);
      if (!isNaN(sinceDate.getTime())) {
        query = query.gte('timestamp', sinceDate.toISOString());
      }
    }

    const { data, count, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: 'db_query_failed', details: error.message }, { status: 500 });
    }

    const transactions = Array.isArray(data) ? data : [];

    return NextResponse.json({
      ok: true,
      transactions,
      total: typeof count === 'number' ? count : transactions.length,
      page,
      pageSize,
      hasMore: typeof count === 'number' ? offset + transactions.length < count : transactions.length === pageSize,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
// --- 82 lines -- Oct 16, 2025
