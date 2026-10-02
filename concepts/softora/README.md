# Softora — company website

Static multi-page site: Home, Academy (product), Custom software, Work, About, Contact, 404.
Three.js hero (assets/js/scene.js) with a different tile formation per page, GSAP scroll animation (assets/js/main.js).

## Edit
- Company details, nav, footer and the dashboard mockup: `build.py` (constants at the top, marked TODO)
- Page content: `pages/*.html` · Styles: `assets/css/style.css`
- Logos: `assets/img/softora.png`, `assets/img/academy.png`

## Build & deploy
    python3 build.py                  # writes dist/
    npm install && npm run deploy     # Cloudflare Workers static assets (needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID)
