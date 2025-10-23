// utils/donate.ts
import { supabaseClient } from '@/lib/boltDatabaseClient';

export async function submitDonation({ charityId, amount, note }: { charityId: string; amount: number; note?: string }) {
  // Get current logged-in user from Supabase client
  const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
  if (userErr || !userData?.user) {
    throw new Error('no_auth_user'); // handle in UI (prompt sign-in)
  }
  const userId = userData.user.id;

  const res = await fetch('/api/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,        // required by server
      charityId,
      amount,
      note: note ?? ''
    })
  });

  const json = await res.json();
  return { status: res.status, json };
}
