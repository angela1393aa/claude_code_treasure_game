Deploy this project's frontend to Vercel and return the live URL.

## Steps

1. **Check Vercel CLI** — run `vercel --version`. If not found, install it globally: `npm install -g vercel`

2. **Build the frontend** — run `npm run build` from the project root. The output goes to `./build/`.

3. **Check Vercel login** — run `vercel whoami`. If not logged in, run `vercel login` and wait for the user to authenticate.

4. **Deploy to production** — run:
   ```
   vercel --prod --yes \
     --build-env SKIP_BUILD=true \
     --local-config vercel.json 2>/dev/null || \
   vercel ./build --prod --yes
   ```
   If a `vercel.json` does not exist, create one first (see below), then run `vercel --prod --yes`.

5. **Create vercel.json if missing** — before deploying, check if `vercel.json` exists. If not, create it:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "framework": null,
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
   The `rewrites` rule ensures client-side React routing works correctly.

6. **Print the URL** — after deployment succeeds, extract and display the production URL from the Vercel CLI output. It will look like `https://<project>.vercel.app`.

## Important note about the backend

This project has a **local Express + SQLite backend** (port 3001) that handles auth and score storage. Vercel hosts only the static frontend — the backend is **not deployed**.

This means on the live Vercel URL:
- The game itself works fully (guest mode)
- Sign in / Sign up will show an error (backend unreachable)

To make auth work in production, the backend would need to be hosted separately (e.g., Railway, Render, or Fly.io) and the `BASE` URL in `src/lib/api.ts` updated to the hosted backend URL.
