import { StorefrontResolvedData, Product } from './types';

/**
 * Storefront API Client
 * Connects this decoupled frontend template to the ECom Headless Backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';
const STOREFRONT_API_KEY = process.env.NEXT_PUBLIC_STOREFRONT_TOKEN || 'sf_pub_shenzen_123';
const DEFAULT_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || 'shenzen-electronics';

export async function resolveStorefront(): Promise<StorefrontResolvedData | null> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/storefront/resolve`);
    if (STOREFRONT_API_KEY) {
      url.searchParams.set('apiKey', STOREFRONT_API_KEY);
    } else {
      url.searchParams.set('slug', DEFAULT_SLUG);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 }, // Cache for 30s or ISR
      headers: {
        'Accept': 'application/json',
        'X-Storefront-Token': STOREFRONT_API_KEY,
      },
    });

    if (!res.ok) {
      console.error(`Storefront resolve failed with status ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      return null;
    }

    return json.data as StorefrontResolvedData;
  } catch (error) {
    console.error('Error in resolveStorefront:', error);
    return null;
  }
}

export async function getStoreCatalog(options?: {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  try {
    const store = await resolveStorefront();
    if (!store) return [];

    const url = new URL(`${API_BASE_URL}/api/v1/storefront/catalog`);
    url.searchParams.set('tenantId', store.tenantId);

    if (options?.category) url.searchParams.set('category', options.category);
    if (options?.search) url.searchParams.set('search', options.search);
    if (options?.sort) url.searchParams.set('sort', options.sort);
    if (options?.minPrice !== undefined) url.searchParams.set('minPrice', String(options.minPrice));
    if (options?.maxPrice !== undefined) url.searchParams.set('maxPrice', String(options.maxPrice));

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      headers: {
        'Accept': 'application/json',
        'X-Storefront-Token': STOREFRONT_API_KEY,
      },
    });

    if (!res.ok) return [];
    const json = await res.json();
    return (Array.isArray(json.data) ? json.data : (json.data?.products || [])) as Product[];
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<{ product: Product; relatedProducts: Product[] } | null> {
  try {
    const store = await resolveStorefront();
    if (!store) return null;

    const url = new URL(`${API_BASE_URL}/api/v1/storefront/products/${encodeURIComponent(handle)}`);
    url.searchParams.set('tenantId', store.tenantId);

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      headers: {
        'Accept': 'application/json',
        'X-Storefront-Token': STOREFRONT_API_KEY,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    return json.data as { product: Product; relatedProducts: Product[] };
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
    return null;
  }
}
