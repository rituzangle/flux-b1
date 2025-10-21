/**
 * app/api/user/route.ts
 * Returns the current user's profile from Supabase
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/boltDatabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'missing_userId' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: 'db_error', details: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      id: user.id,
      name: user.display_name || user.full_name || 'User',
      email: user.email,
      balance: Number(user.balance),
      totalDonated: Number(user.total_donated),
      onboardingComplete: true,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
