import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import type { IStorageProvider, UploadOptions, UploadResult } from './storage.interface';

/**
 * Local Storage Adapter — Saves files to the local filesystem (public/uploads).
 *
 * Designed for instant offline development without requiring any cloud provider.
 * Files are stored under: public/uploads/{tenantSlug}/{folder}/{fileName}
 * and served directly by Next.js static file serving.
 */
export class LocalStorageAdapter implements IStorageProvider {
  readonly providerId = 'local';
  private readonly basePath: string;
  private readonly baseUrl: string;

  constructor(basePath = 'public/uploads', baseUrl = '/uploads') {
    this.basePath = basePath;
    this.baseUrl = baseUrl;
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const folder = options.folder || 'general';
    const dirPath = join(this.basePath, options.tenantSlug, folder);
    const filePath = join(dirPath, options.fileName);
    const key = `${options.tenantSlug}/${folder}/${options.fileName}`;

    await mkdir(dirPath, { recursive: true });
    await writeFile(filePath, file);

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      size: file.length,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.basePath, key);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist, silently ignore
    }
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
