/**
 * Redis Keepalive Script
 *
 * Connects to Redis Cloud instance and sends a PING command to prevent
 * the free-tier database from being deleted due to inactivity.
 *
 * Environment variable required:
 * - REDISCLOUD_URL: Redis connection URL (e.g., redis://user:password@host:port)
 *
 * Exit codes:
 * - 0: Success (PING received)
 * - 1: Failed to connect or PING
 */

require("dotenv").config();
const redis = require("redis");

const { REDISCLOUD_URL } = process.env;

if (!REDISCLOUD_URL) {
  console.error("Error: REDISCLOUD_URL environment variable is not set.");
  process.exit(1);
}

const redisClient = redis.createClient({
  url: REDISCLOUD_URL,
});

redisClient.on("error", (err) => {
  console.error(`Redis Error: ${err}`);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis Cloud instance.");

    const pongResponse = await redisClient.ping();
    console.log(`PING response: ${pongResponse}`);
    console.log("✓ Redis keepalive successful.");

    await redisClient.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Failed to ping Redis: ${err.message}`);
    process.exit(1);
  }
})();
