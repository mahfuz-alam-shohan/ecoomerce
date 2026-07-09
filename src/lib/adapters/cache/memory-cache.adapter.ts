import type { ICacheLockProvider } from './cache.interface';

interface CacheEntry {
  value: unknown;
  expiresAt: number | null; // Unix timestamp in ms, null = no expiry
}

/**
 * Memory Cache Adapter — In-process LRU-like cache with TTL support.
 *
 * Designed for $0 local development and low-traffic production.
 * Stores cache entries and locks in a Node.js Map.
 * Not suitable for multi-instance horizontal scaling (use Redis adapter for that).
 */
export class MemoryCacheAdapter implements ICacheLockProvider {
  readonly providerId = 'memory';
  private cache = new Map<string, CacheEntry>();
  private locks = new Set<string>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiry
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean> {
    if (this.locks.has(lockKey)) return false;

    this.locks.add(lockKey);

    // Auto-release after TTL
    setTimeout(() => {
      this.locks.delete(lockKey);
    }, ttlSeconds * 1000);

    return true;
  }

  async releaseLock(lockKey: string): Promise<void> {
    this.locks.delete(lockKey);
  }
}
