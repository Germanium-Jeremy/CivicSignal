import Redis from 'ioredis';

declare global {
  var __civicRedisClient: Redis | null | undefined;
}

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    enableAutoPipelining: true,
  });

  client.on('error', (error) => {
    console.error('Redis client error:', error?.message || error);
  });

  return client;
}

export function getRedisClient(): Redis | null {
  if (global.__civicRedisClient !== undefined) {
    return global.__civicRedisClient || null;
  }

  global.__civicRedisClient = createRedisClient();
  return global.__civicRedisClient || null;
}

export async function ensureRedisConnected() {
  const client = getRedisClient();
  if (!client) return null;

  if (client.status === 'ready' || client.status === 'connecting') {
    return client;
  }

  try {
    await client.connect();
  } catch (error) {
    // Connection could already be in progress, ignore in that case.
    const status = String(client.status);
    if (status !== 'connecting' && status !== 'ready') {
      console.error('Failed to connect to Redis:', error);
      return null;
    }
  }

  return client;
}
