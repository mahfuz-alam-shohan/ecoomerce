/**
 * IStorageProvider — Modular File/Media Storage Adapter Interface
 *
 * All storage backends (Local Filesystem, Cloudflare R2, AWS S3, Cloudinary)
 * implement this single interface. The media upload modules call these methods
 * without knowing which storage provider is active.
 */

export interface UploadOptions {
  fileName: string;
  contentType: string;
  tenantSlug: string;
  folder?: string; // e.g., 'products', 'avatars', 'banners'
}

export interface UploadResult {
  url: string;
  key: string; // Storage key for future deletion
  size: number;
}

export interface IStorageProvider {
  readonly providerId: string;

  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
