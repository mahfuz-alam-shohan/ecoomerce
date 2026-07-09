import type { IStorageProvider, UploadOptions, UploadResult } from './storage.interface';

/**
 * Cloudflare R2 Storage Adapter — S3-compatible cloud object storage.
 *
 * Cloudflare R2 provides $0 egress fees, making it ideal for serving
 * product images at scale. Uses the S3 API protocol.
 *
 * NOTE: Requires environment variables:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */
export class R2StorageAdapter implements IStorageProvider {
  readonly providerId = 'r2';
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || '';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const folder = options.folder || 'general';
    const key = `${options.tenantSlug}/${folder}/${options.fileName}`;

    // TODO: Implement S3-compatible PUT request to Cloudflare R2
    // Using @aws-sdk/client-s3 with R2 endpoint:
    // const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com` });
    // await s3.send(new PutObjectCommand({ Bucket: this.bucketName, Key: key, Body: file, ContentType: options.contentType }));

    return {
      url: `${this.publicUrl}/${key}`,
      key,
      size: file.length,
    };
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement S3-compatible DELETE request to Cloudflare R2
    // await s3.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
