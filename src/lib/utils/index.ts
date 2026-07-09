import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Shared Utility Functions
 * Used across modules for formatting, ID generation, and response helpers.
 */

/** Merge Tailwind CSS classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a human-readable order number: ORD-20260708-A3F2 */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

/** Format cents to display currency (e.g., 1999 -> "$19.99") */
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Generate a URL-safe slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Create a standardized API success response */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return Response.json({ success: true, data, meta }, { status: 200 });
}

/** Create a standardized API error response */
export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/** Create a standardized API created response */
export function apiCreated<T>(data: T) {
  return Response.json({ success: true, data }, { status: 201 });
}

/** Extract tenant ID from request headers (set by middleware) */
export function getTenantIdFromHeaders(request: Request): string | null {
  return request.headers.get('x-tenant-id');
}

/** Extract tenant slug from request headers (set by middleware) */
export function getTenantSlugFromHeaders(request: Request): string | null {
  return request.headers.get('x-tenant-slug');
}
