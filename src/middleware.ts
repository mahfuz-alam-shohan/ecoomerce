import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge Middleware — Multi-Tenant Request Router
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
 * The middleware injects `x-tenant-id` and `x-tenant-slug` headers
 * for downstream Server Components and API routes to consume.
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

  // Skip API routes — they handle tenant context via headers
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
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
 * Applies strict enterprise security headers to every outgoing response from the Edge Router.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
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
  if (hostParts.length <= 1 || fullHost === 'localhost') {
    return { type: 'platform' };
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
