/**
 * ICacheLockProvider — Modular Cache & Distributed Lock Adapter Interface
 *
 * Provides key-value caching for tenant configs, store themes, and edge data,
 * plus distributed locking for inventory reservation during checkout.
 * Implementations: In-Memory LRU (free), Redis/Upstash (scaling).
 */

export interface ICacheLockProvider {
  readonly providerId: string;

  // Key-Value Cache
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;

  // Distributed Locks (for inventory reservation / flash sale protection)
  acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean>;
  releaseLock(lockKey: string): Promise<void>;
}
