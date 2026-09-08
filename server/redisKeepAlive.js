/**
 * Redis Keepalive
 *
 * Two jobs:
 *   1. touchRedis / startKeepAlive -- used by the running server to exercise
 *      the session store, so an idle-but-awake instance still counts as active.
 *   2. pingRedis -- a one-shot check, usable as a script, for an externally
 *      reachable Redis. Free hosted Redis tiers delete databases after a
 *      stretch of inactivity, and holding an open connection does not count:
 *      the database has to actually serve commands, and a write is the
 *      strongest signal. So a keepalive here is PING + a real SET, not a bare
 *      PING.
 *
 * Usable two ways:
 *   - as a module:  const { pingRedis } = require('./redisKeepAlive.js');
 *   - as a script:  node server/redisKeepAlive.js   (exit 0 on success, 1 on failure)
 *
 * Environment variable required for script mode:
 * - REDISCLOUD_URL: Redis connection URL (e.g. redis://user:password@host:port)
 */

require("dotenv").config();
const redis = require("redis");

// Key written on every keepalive. The TTL outlasts the gap between pings, so
// the database always holds at least one live key.
const KEEPALIVE_KEY = "keepalive:last-ping";
const KEEPALIVE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
// Retry budget for the one-shot script path only. The long-lived server client
// keeps node-redis's default infinite reconnect, which is what you want there.
const MAX_CONNECT_RETRIES = 5;

/**
 * Run a keepalive round-trip against an already-connected client.
 * Kept separate from connection handling so the running server can reuse its
 * own long-lived client instead of opening a second connection.
 * @param {*} client A connected node-redis client.
 * @returns {Promise<{ping: string, lastPing: string}>}
 */
const touchRedis = async (client) => {
  const ping = await client.ping();
  const lastPing = new Date().toISOString();
  await client.set(KEEPALIVE_KEY, lastPing, { EX: KEEPALIVE_TTL_SECONDS });
  return { ping, lastPing };
};

/**
 * Open a short-lived connection, run the keepalive, and close it again.
 * @param {string} url Redis connection URL. Defaults to REDISCLOUD_URL.
 * @returns {Promise<{ping: string, lastPing: string}>}
 */
const pingRedis = async (url = process.env.REDISCLOUD_URL) => {
  if (!url) {
    throw new Error("REDISCLOUD_URL environment variable is not set.");
  }

  // node-redis reconnects forever by default. For a one-shot job that means a
  // dead host hangs the process instead of failing, so bound the retries and
  // let connect() reject.
  const client = redis.createClient({
    url,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries >= MAX_CONNECT_RETRIES) {
          return new Error(`Could not reach Redis after ${retries} attempts.`);
        }
        return Math.min(retries * 500, 3000);
      },
    },
  });

  // Without an 'error' listener node-redis crashes the process instead of
  // letting the promise below reject.
  client.on("error", (err) => {
    process.stderr.write(`Redis error: ${err.message}\n`);
  });

  try {
    await client.connect();
    return await touchRedis(client);
  } finally {
    // quit() throws if the socket is already gone; that must not mask a
    // successful keepalive.
    try {
      await client.quit();
    } catch (err) {
      process.stderr.write(`Redis disconnect failed: ${err.message}\n`);
    }
  }
};

/**
 * Keep the store warm for as long as this process is running.
 * On Render's free tier the web service sleeps after ~15 minutes without
 * traffic, so this only covers the awake window -- the scheduled /health probe
 * is what covers the gaps. Both are needed.
 * @param {*} client A connected node-redis client.
 * @param {number} intervalMs How often to touch Redis.
 * @returns {*} The interval handle.
 */
const startKeepAlive = (client, intervalMs = 1000 * 60 * 10) => {
  const timer = setInterval(async () => {
    try {
      const { lastPing } = await touchRedis(client);
      process.stdout.write(`Redis keepalive at ${lastPing}\n`);
    } catch (err) {
      process.stderr.write(`Redis keepalive failed: ${err.message}\n`);
    }
  }, intervalMs);

  // Do not hold the event loop open on account of the keepalive alone.
  if (timer.unref) {
    timer.unref();
  }
  return timer;
};

module.exports = {
  KEEPALIVE_KEY,
  touchRedis,
  pingRedis,
  startKeepAlive,
};

// Script mode: only runs when invoked directly, not when required.
if (require.main === module) {
  (async () => {
    try {
      const { ping, lastPing } = await pingRedis();
      process.stdout.write(`PING response: ${ping}\n`);
      process.stdout.write(`Redis keepalive successful at ${lastPing}\n`);
      process.exit(0);
    } catch (err) {
      process.stderr.write(`Failed to ping Redis: ${err.message}\n`);
      process.exit(1);
    }
  })();
}
