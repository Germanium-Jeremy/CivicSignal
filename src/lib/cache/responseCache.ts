import { ensureRedisConnected } from './redisClient';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheStore = Map<string, CacheEntry<unknown>>;

declare global {
  var __civicResponseCache: CacheStore | undefined;
}

const store: CacheStore = global.__civicResponseCache || new Map<string, CacheEntry<unknown>>();
if (!global.__civicResponseCache) {
  global.__civicResponseCache = store;
}

function cacheKey(key: string) {
  return `civic:cache:${key}`;
}

async function deleteRedisByPattern(pattern: string) {
  const redis = await ensureRedisConnected();
  if (!redis) return;

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
      cursor = nextCursor;
      if (keys.length) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.warn('Redis cache invalidation failed:', error);
  }
}

export async function getOrSetCache<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const redis = await ensureRedisConnected();
  const redisKey = cacheKey(key);

  if (redis) {
    try {
      const hit = await redis.get(redisKey);
      if (hit) {
        return JSON.parse(hit) as T;
      }
    } catch (error) {
      console.warn('Redis cache read failed, using memory fallback:', error);
    }
  }

  const now = Date.now();
  const memoryHit = store.get(key) as CacheEntry<T> | undefined;
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.value;
  }

  const value = await loader();
  store.set(key, { value, expiresAt: now + ttlMs });

  if (redis) {
    try {
      await redis.set(redisKey, JSON.stringify(value), 'PX', ttlMs);
    } catch (error) {
      console.warn('Redis cache write failed:', error);
    }
  }

  return value;
}

export async function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    store.clear();
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(keyPrefix)) {
        store.delete(key);
      }
    }
  }

  if (!keyPrefix) {
    await deleteRedisByPattern('civic:cache:*');
    return;
  }

  await deleteRedisByPattern(`civic:cache:${keyPrefix}*`);
}
