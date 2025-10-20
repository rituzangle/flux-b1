// logFlow.js
// Run with: node logFlow.js
// Non-invasive inspector: imports your services, mocks and APIs and logs what changes.

function safeRequire(path) {
  try { return require(path); } catch (e) { return null; }
}

const prettyLogs = safeRequire('./src/utils/prettyLogs') || { logger: console };
const logger = (prettyLogs && prettyLogs.logger) ? prettyLogs.logger : console;

logger.info('=== logFlow starting ===', 'logFlow');

// 1) Load runtimeStore
const runtimeMod = safeRequire('./src/mocks/runtimeStore') || safeRequire('./src/mocks/runtime-store') || {};
const runtimeStore = runtimeMod.runtimeStore || runtimeMod.default || runtimeMod;

logger.debug('runtimeStore loaded', 'logFlow');
logger.info(`User before flow: ${JSON.stringify(runtimeStore.user ?? '<<no user>>')}`, 'logFlow');

// 2) Load charities service and list charities
const charitiesSvc = safeRequire('./src/services/charities') || safeRequire('./src/services/charities.js') || {};
const listCharities = charitiesSvc.listCharities || (() => {
  const mock = safeRequire('./src/mocks/charities') || {};
  return mock.mockCharities || mock.charities || [];
});

const charities = listCharities();
logger.info(`charities.count = ${Array.isArray(charities) ? charities.length : 0}`, 'logFlow');
if (Array.isArray(charities)) {
  logger.info(`sample charities: ${JSON.stringify(charities.slice(0,3).map(c=>({id:c.id,name:c.name})) )}`, 'logFlow');
} else {
  logger.warn('charities is not an array', 'logFlow');
}

// 3) Inspect app/api/donate/route if present and also the donate util if present
const donateRoute = safeRequire('./app/api/donate/route') || safeRequire('./src/app/api/donate/route') || null;
const donateUtil = safeRequire('./src/utils/donate') || safeRequire('./src/lib/donate') || null;

logger.debug('donate route loaded?', 'logFlow');
logger.info(`donateRoute present: ${!!donateRoute}`, 'logFlow');
logger.info(`donateUtil present: ${!!donateUtil}`, 'logFlow');

// 4) Prepare a simulated donation: pick first charity and a sample amount
const charity = (Array.isArray(charities) && charities[0]) ? charities[0] : null;
if (!charity) {
  logger.error('No charity available to simulate donation', 'logFlow');
  process.exit(1);
}
const sampleDonation = {
  charityId: charity.id,
  amount: 5.0,
  note: 'logFlow test donation',
  userId: runtimeStore?.user?.id ?? 'user_1',
};

logger.info(`Simulating donation to charityId=${sampleDonation.charityId} amount=${sampleDonation.amount}`, 'logFlow');

// 5) Try to call a donate helper (non-invasive): prefer donateUtil, then donateRoute.POST if it exports, else mutate runtimeStore directly
async function runDonateSimulation() {
  try {
    if (donateUtil && typeof donateUtil.createDonation === 'function') {
      logger.debug('Using donateUtil.createDonation', 'logFlow');
      const res = await donateUtil.createDonation(sampleDonation);
      logger.info(`donateUtil result: ${JSON.stringify(res)}`, 'logFlow');
    } else if (donateRoute && typeof donateRoute.POST === 'function') {
      logger.debug('Calling donateRoute.POST', 'logFlow');
      // Build a minimal mock request object if route expects Request
      const mockReq = {
        json: async () => sampleDonation,
      };
      const result = await donateRoute.POST(mockReq);
      logger.info(`donateRoute.POST returned: ${JSON.stringify(result?.body ?? result)}`, 'logFlow');
    } else {
      logger.warn('No donate helper found; applying direct runtimeStore mutation for test', 'logFlow');
      // Heuristic: decrement user balance and push transaction; do not persist anything
      if (runtimeStore && runtimeStore.user && typeof runtimeStore.user.balance === 'number') {
        const before = runtimeStore.user.balance;
        runtimeStore.user.balance = +(before - sampleDonation.amount).toFixed(2);
        runtimeStore.transactions = runtimeStore.transactions || [];
        runtimeStore.transactions.push({
          id: `tx-${Date.now()}`,
          charityId: sampleDonation.charityId,
          amount: sampleDonation.amount,
          note: sampleDonation.note,
          timestamp: new Date().toISOString(),
        });
        logger.info(`Applied fake mutation: balance ${before} -> ${runtimeStore.user.balance}`, 'logFlow');
      } else {
        logger.error('Cannot mutate runtimeStore: shape unexpected', 'logFlow');
      }
    }
  } catch (err) {
    logger.error(`Error during donation simulation: ${err?.message || String(err)}`, 'logFlow');
  }
}

(async () => {
  await runDonateSimulation();

  logger.info('--- Post-donation runtimeStore snapshot ---', 'logFlow');
  logger.info(`User after flow: ${JSON.stringify(runtimeStore.user ?? '<<no user>>')}`, 'logFlow');
  logger.info(`Recent transactions: ${JSON.stringify((runtimeStore.transactions||[]).slice(-3))}`, 'logFlow');

  // 6) If there is an insights generator, call it for the donation and log
  const insightGen = safeRequire('./src/utils/insightGenerator') || safeRequire('./src/lib/insightGenerator') || null;
  if (insightGen && typeof insightGen.generate === 'function') {
    try {
      const insights = await insightGen.generate({ donation: sampleDonation, charity, user: runtimeStore.user });
      logger.info(`insights.generate output: ${JSON.stringify(insights)}`, 'logFlow');
    } catch (e) {
      logger.error(`insightGen.generate error: ${String(e)}`, 'logFlow');
    }
  } else if (insightGen && typeof insightGen === 'function') {
    try {
      const insights = await insightGen(sampleDonation, charity, runtimeStore.user);
      logger.info(`insightGen output (fn): ${JSON.stringify(insights)}`, 'logFlow');
    } catch (e) {
      logger.error(`insightGen fn error: ${String(e)}`, 'logFlow');
    }
  } else {
    logger.debug('No insightGenerator found', 'logFlow');
  }

  logger.info('=== logFlow finished ===', 'logFlow');
})();
