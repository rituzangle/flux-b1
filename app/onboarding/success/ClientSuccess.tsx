'use client';

// app/onboarding/success/page.tsx
// Server wrapper: safely accepts searchParams and passes serialized props to a client subcomponent.
import React from 'react';
import ClientSuccess from './ClientSuccess';

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const txn = Array.isArray(searchParams?.txn) ? searchParams?.txn[0] : (searchParams?.txn as string | undefined);
  const redirectTo = Array.isArray(searchParams?.redirectTo) ? searchParams?.redirectTo[0] : (searchParams?.redirectTo as string | undefined) ?? '/onboarding';
  const amount = Array.isArray(searchParams?.amount) ? searchParams?.amount[0] : (searchParams?.amount as string | undefined) ?? '';
  const charityId = Array.isArray(searchParams?.charityId) ? searchParams?.charityId[0] : (searchParams?.charityId as string | undefined) ?? null;

  return <ClientSuccess txnId={txn ?? null} redirectTo={redirectTo} amount={String(amount)} charityId={charityId} />;
}
