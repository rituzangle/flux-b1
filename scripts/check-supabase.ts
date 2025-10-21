// scripts/check-supabase.ts (quick run with ts-node or compile)
import clients from '../src/lib/boltDatabaseClient';
async function main() {
  const { server, client } = clients;
  const { data: rowServer, error: errServer } = await server.from('charities').select('id').limit(1);
  console.log('server query', !!rowServer, errServer?.message ?? 'ok');
  const { data: rowClient, error: errClient } = await client.from('charities').select('id').limit(1);
  console.log('client query', !!rowClient, errClient?.message ?? 'ok');
}
main().catch(e=>{ console.error(e); process.exit(1); });
