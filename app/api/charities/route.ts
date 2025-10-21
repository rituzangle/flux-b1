/**
 * Path: app/api/charities/route.ts
 * Endpoint: GET /api/charities
 * Returns charities from Supabase database
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/boltDatabaseClient';
import { logger } from '@/src/utils/prettyLogs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('charities: GET requested', 'charities');

    const { data: items, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error('charities: DB query failed ' + String(error), 'charities');
      return NextResponse.json({ ok: false, error: 'db_error', details: error.message }, { status: 500 });
    }

    const charities = (items || []).map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      logo: c.logo_url,
      impactRate: Number(c.impact_rate || 0),
      impactMetric: c.impact_metric,
      metadata: c.metadata,
      verified: true,
      donorCount: 0,
      category: c.metadata?.category || 'general',
      website: c.metadata?.website,
      emoji: c.metadata?.emoji,
    }));

    return NextResponse.json({ ok: true, charities });
  } catch (err) {
    logger.error('charities: GET failed ' + String(err), 'charities');
    return NextResponse.json({ ok: false, error: 'server_error', details: String(err) }, { status: 500 });
  }
}
// --- Oct 21

/** remember: For production, We'll move to managing charities data in supabase.

import { charities } from '@/src/mocks/charities';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(charities);
}
*/


/**
Supabase Schema: charities
```
create table charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text,
  impact_metric text,         -- e.g. "meals", "children helped"
  impact_rate numeric,        -- e.g. 0.5 means $1 = 0.5 meals
  is_featured boolean default false,
  seasonal_tag text,          -- e.g. "thanksgiving", "winter"
  created_at timestamp default now()
);
```
Why This Schema Works
UUID primary key: avoids collisions and supports distributed systems

Rich metadata: supports onboarding, impact previews, and AI insights

Seasonal tagging: enables dynamic campaigns (e.g. “Give Warmth This Winter”)

Featured flag: lets you highlight charities on the dashboard or homepage

To support user contributions or charity suggestions:
```
add column submitted_by uuid references users(id);
add column approved boolean default false;
```
Supabase Setup Steps:
Go to Supabase Studio → SQL Editor

Paste and run the schema above

Add sample data manually or via CSV import

Update your API route (app/api/charities/route.ts) to query this table
*/
// --- 24 lines --- Oct 16, 2025
// --- 78 lines --- with supabase schema addition for later
