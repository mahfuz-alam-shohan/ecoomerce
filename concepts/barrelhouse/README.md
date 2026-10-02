# Barrel House — concept website

Static multi-page concept site (Home, Menu, Tavern, Our Story, Visit) for Barrel House Restaurant & Tavern, Kane PA.
Light theme by default with a dark toggle. Marked as a concept preview and set to `noindex` so it never competes with the business in search.

## Edit
- Page content: `pages/*.html` (shared header/footer/contact details live in `build.py`)
- Styles: `assets/css/style.css` · Animations: `assets/js/main.js`
- Photos: `assets/img/` — stock photos from Unsplash. Replace a file with the restaurant's own photo using the same name.

## Build
    python3 build.py        # writes dist/

## Deploy to Cloudflare (Workers static assets)
    npm install
    export CLOUDFLARE_API_TOKEN=...   # token with "Workers Scripts: Edit"
    export CLOUDFLARE_ACCOUNT_ID=...
    npm run deploy                     # -> https://barrelhouse-concept.<your-subdomain>.workers.dev
