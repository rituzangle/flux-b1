-- 001_create_schema.sql
-- added to supabase 
-- Enable extensions commonly used for JSON and UUID generation
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Users (auth users live in auth.users, this table stores app profile + balance)
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid null, -- optional FK to supabase auth.users.id
  email text null,
  full_name text null,
  display_name text null,
  balance numeric(14,2) not null default 0.00,
  total_donated numeric(14,2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_auth_user_id on app_users (auth_user_id);

-- Charities
create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text null,
  logo_url text null,
  impact_rate numeric(14,2) null, -- amount -> impact metric conversion
  impact_metric text null, -- e.g., 'meals', 'people'
  metadata jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_charities_slug on charities using gin (lower(slug) gin_trgm_ops);

-- Transactions (canonical ledger)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  type text not null,                      -- donation | send | bill | subscription | refund | reward | adjustment | other
  category text not null,                  -- charity | transfer | bills | subscriptions | refunds | rewards | adjustments | other
  entity_id text null,                     -- flexible id (charity id, recipient id, biller id)
  entity_name text null,                   -- resolved display name (charity name, recipient name)
  amount numeric(14,2) not null,           -- absolute amount (positive)
  direction text not null,                 -- outgoing | incoming
  note text null,
  timestamp timestamptz not null default now(),
  meta jsonb null,                         -- freeform metadata (impactRate, subscriptionId, recurrence, source, channel)
  insights jsonb null,                     -- array or object of insights generated at creation
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id_timestamp on transactions (user_id, timestamp desc);
create index if not exists idx_transactions_type on transactions (type);
create index if not exists idx_transactions_entity_name on transactions using gin (lower(entity_name) gin_trgm_ops);
create index if not exists idx_transactions_meta_gin on transactions using gin (meta);

-- Subscriptions (recurring payments tracking)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  name text not null,
  entity_id text null,
  entity_name text null,
  amount numeric(14,2) not null,
  cadence text not null,          -- daily | weekly | monthly | yearly | custom
  next_due timestamptz null,
  active boolean not null default true,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on subscriptions (user_id);
create index if not exists idx_subscriptions_next_due on subscriptions (next_due);

-- Bills table (for one-off or scheduled bill payments)
create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  biller_id text null,
  biller_name text null,
  amount numeric(14,2) not null,
  due_date timestamptz null,
  paid boolean not null default false,
  paid_at timestamptz null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_bills_user_id on bills (user_id);
create index if not exists idx_bills_due_date on bills (due_date);

-- Simple insights table for aggregated or AI-generated insights
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  key text not null,         -- e.g., total_donated_30d, recurring_recommendation
  value jsonb not null,      -- structured payload for the insight
  source text null,          -- generator id (cron, transaction_hook, ai-service)
  created_at timestamptz not null default now(),
  expires_at timestamptz null
);

create index if not exists idx_insights_user_id_key on insights (user_id, key);

-- Convenience view: latest transactions per user (server-side pagination friendly)
create or replace view user_latest_transactions as
select t.*
from transactions t
order by t.timestamp desc;

