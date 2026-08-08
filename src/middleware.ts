import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security';

/**
 * Edge Middleware — Multi-Tenant Request Router & Edge Security Shield
 *
 * Runs on every request at the edge (Cloudflare Workers / Vercel Edge).
 * Routes incoming requests to either:
 *   1. The Centralized Dashboard  → (dashboard)/[tenant_slug]/...
 *   2. A Public Storefront        → (storefront)/[tenant_slug]/...
 *   3. Platform pages             → (platform)/...
 *
 * Tenant resolution strategy:
 *   - `app.domain.com` or `dashboard.domain.com` → Dashboard
 *   - `[slug].domain.com` or custom domain       → Storefront
 *   - `domain.com` (root)                        → Platform landing page
 *
 * Also executes Edge Rate Limiting on high-sensitivity routes and injects
 * enterprise security headers (HSTS, CSP, XSS protection).
 */

const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'dashboard', 'admin', 'mail', 'docs',
]);

const PUBLIC_PATHS = new Set([
  '/favicon.ico', '/robots.txt', '/sitemap.xml',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff2?)$/) ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  // Edge Rate Limiting for high-sensitivity endpoints (`/api/auth`, `/api/v1/checkout`, `/sign-in`, `/sign-up`)
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const rateLimit = checkRateLimit(`auth:${clientIp}`, RATE_LIMITS.AUTH);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }
  } else if (pathname.startsWith('/api/v1/checkout')) {
    const rateLimit = checkRateLimit(`checkout:${clientIp}`, RATE_LIMITS.CHECKOUT);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }
  } else if (pathname.startsWith('/api/v1')) {
    const rateLimit = checkRateLimit(`api:${clientIp}`, RATE_LIMITS.API_GENERAL);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }
  }

  // Skip tenant routing for API routes — they handle tenant context via headers
  if (pathname.startsWith('/api')) {
    return withSecurityHeaders(NextResponse.next());
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const cleanHost = host.replace(/:\d+$/, ''); // Strip port
  const parts = cleanHost.split('.');

  // Determine routing context
  const routingContext = resolveRoutingContext(parts, cleanHost);

  if (routingContext.type === 'dashboard') {
    const headers = new Headers(request.headers);
    headers.set('x-routing-context', 'dashboard');
    return withSecurityHeaders(NextResponse.next({ request: { headers } }));
  }

  if (routingContext.type === 'storefront' && routingContext.slug) {
    const url = request.nextUrl.clone();
    const storefrontPath = pathname === '/' ? '' : pathname;
    url.pathname = `/store/${routingContext.slug}${storefrontPath}`;

    const headers = new Headers(request.headers);
    headers.set('x-tenant-slug', routingContext.slug);
    headers.set('x-routing-context', 'storefront');

    return withSecurityHeaders(NextResponse.rewrite(url, { request: { headers } }));
  }

  // Default: Platform landing page (root domain, no subdomain)
  return withSecurityHeaders(NextResponse.next());
}

/**
 * Creates an instant 429 Too Many Requests edge response when rate limit is exceeded.
 */
function createRateLimitResponse(rateLimit: { limit: number; remaining: number; resetAt: number }): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please slow down and try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString(),
        'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Applies strict enterprise security headers to every outgoing response from the Edge Router.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  return response;
}

/**
 * Resolves whether a request should go to:
 *   - 'dashboard' (merchant management)
 *   - 'storefront' (public tenant store)
 *   - 'platform' (landing/marketing pages)
 */
function resolveRoutingContext(
  hostParts: string[],
  fullHost: string
): { type: 'dashboard' | 'storefront' | 'platform'; slug?: string } {
  // Local development: single segment "localhost" → platform
  if (hostParts.length <= 1 || fullHost === 'localhost' || fullHost.includes('127.0.0.1')) {
    return { type: 'platform' };
  }

  // Cloudflare Pages/Workers or Vercel preview domain (e.g., ecoomerce-285.pages.dev or ecom.account.workers.dev) → Platform
  if (
    fullHost.endsWith('.pages.dev') ||
    fullHost.endsWith('.vercel.app') ||
    fullHost.endsWith('.workers.dev')
  ) {
    // Treat root preview domain (e.g. ecom.user.workers.dev or ecoomerce-285.pages.dev) as platform
    if (hostParts.length <= 4) {
      return { type: 'platform' };
    }
    // If it has a subdomain on top of the preview URL (e.g., tenant.ecoomerce-285.pages.dev)
    const subdomain = hostParts[0];
    if (subdomain === 'app' || subdomain === 'dashboard') return { type: 'dashboard' };
    if (RESERVED_SUBDOMAINS.has(subdomain)) return { type: 'platform' };
    return { type: 'storefront', slug: subdomain };
  }

  const subdomain = hostParts[0];

  // "app.domain.com" or "dashboard.domain.com" → Dashboard
  if (subdomain === 'app' || subdomain === 'dashboard') {
    return { type: 'dashboard' };
  }

  // Reserved subdomains → Platform
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return { type: 'platform' };
  }

  // Any other subdomain → Storefront tenant (e.g., "electronics.domain.com")
  return { type: 'storefront', slug: subdomain };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
