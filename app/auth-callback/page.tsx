// app/auth-callback/page.tsx
// auth callback page that reads the URL fragment and sets the Supabase session
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowserClient from '@/src/lib/supabaseBrowserClient';
import Card from '@/src/components/ui/Card';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Parse fragment like: #access_token=...&refresh_token=...&...
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    async function finish() {
      if (access_token) {
        try {
          // Establish session in the browser client
          await supabaseBrowserClient.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token ?? undefined,
          });
        } catch (e) {
          console.warn('auth-callback: setSession failed', e);
        }
      }
      // Redirect back to saved target or home
      const redirect = sessionStorage.getItem('signin_redirect') || '/';
      try { sessionStorage.removeItem('signin_redirect'); } catch {}
      router.replace(redirect);
    }

    finish();
  }, [router]);

  return (
    <main className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-lg font-semibold">Signing you in…</h1>
        <p className="text-sm text-muted-foreground mt-2">If you don’t get redirected automatically, close this tab and return to the app.</p>
      </Card>
    </main>
  );
}
// --- 49 lines --- Oct 23
