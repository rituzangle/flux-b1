/**
 * Path: app/api/charities/route.ts
 * Endpoint: GET /api/charities
 * Keeper logic preserved:
 * - Uses mocks/charities as single source of truth
 * - Returns the full Charity type including impact metadata
 */

import { NextResponse } from 'next/server';
import { MOCK_MODULES } from '@/src/config/apiPaths';
import { logger } from '@/src/utils/prettyLogs';

export async function GET() {
  try {
    const { mockCharities } = await MOCK_MODULES.charities();
    logger.info(`CharitiesAPI: returning ${mockCharities.length} charities`, 'CharitiesAPI');
    return NextResponse.json(mockCharities);
  } catch (e: any) {
    const msg = e?.message || 'Failed to load charities';
    logger.error(`CharitiesAPI: ${msg}`, 'CharitiesAPI');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
// --- 24 lines --- Oct 16, 2025

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
