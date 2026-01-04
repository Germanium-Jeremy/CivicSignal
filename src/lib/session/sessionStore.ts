import crypto from 'crypto';
import { ensureRedisConnected } from '@/lib/cache/redisClient';

export interface ServerSessionData {
  userId: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  tenantId?: string;
  createdAt: number;
}

type MemorySessionRecord = {
  data: ServerSessionData;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __civicSessionStore: Map<string, MemorySessionRecord> | undefined;
}

const memoryStore = global.__civicSessionStore || new Map<string, MemorySessionRecord>();
if (!global.__civicSessionStore) {
  global.__civicSessionStore = memoryStore;
}

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);

function sessionKey(sessionId: string) {
  return `civic:session:${sessionId}`;
}

export async function createServerSession(payload: Omit<ServerSessionData, 'createdAt'>) {
  const sessionId = crypto.randomUUID();
  const data: ServerSessionData = {
    ...payload,
    createdAt: Date.now(),
  };

  const redis = await ensureRedisConnected();
  if (redis) {
    try {
      await redis.set(sessionKey(sessionId), JSON.stringify(data), 'EX', SESSION_TTL_SECONDS);
      return { sessionId, data, ttlSeconds: SESSION_TTL_SECONDS };
    } catch (error) {
      console.warn('Failed to write session to Redis, falling back to memory:', error);
    }
  }

  memoryStore.set(sessionId, {
    data,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  return { sessionId, data, ttlSeconds: SESSION_TTL_SECONDS };
}

export async function getServerSession(sessionId: string): Promise<ServerSessionData | null> {
  const redis = await ensureRedisConnected();
  if (redis) {
    try {
      const value = await redis.get(sessionKey(sessionId));
      if (value) return JSON.parse(value) as ServerSessionData;
    } catch (error) {
      console.warn('Redis session read failed:', error);
    }
  }

  const record = memoryStore.get(sessionId);
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    memoryStore.delete(sessionId);
    return null;
  }
  return record.data;
}

export async function destroyServerSession(sessionId: string) {
  memoryStore.delete(sessionId);
  const redis = await ensureRedisConnected();
  if (!redis) return;

  try {
    await redis.del(sessionKey(sessionId));
  } catch (error) {
    console.warn('Redis session deletion failed:', error);
  }
}

