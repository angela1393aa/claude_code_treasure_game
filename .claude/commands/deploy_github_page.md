# Deploy to GitHub Pages

Deploy this Vite + React project's frontend to GitHub Pages and return the live URL.

## Steps

1. **Install gh-pages** — run `npm install --save-dev gh-pages` if not already installed.

2. **Set Vite base path** — in `vite.config.ts`, add `base: '/<repo-name>/'` inside `defineConfig` so asset paths resolve correctly on GitHub Pages. Derive the repo name from `git remote get-url origin`.

3. **Add deploy scripts** — in `package.json` add:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

4. **Run deploy** — run `npm run deploy`. This builds the project and pushes the `build/` folder to the `gh-pages` branch on origin.

5. **Enable GitHub Pages** (if first deploy) — GitHub Pages is automatically served from the `gh-pages` branch. No manual step needed; GitHub detects the branch.

6. **Print the URL** — the live URL follows the pattern:
   `https://<github-username>.github.io/<repo-name>/`
   Extract username and repo name from the remote URL and print it.

## Important notes

- This deploys only the **static frontend**. The local Express backend (port 3001) is not deployed.
- On the live URL, guest mode works fully. Sign in / Sign up will fail (backend unreachable).
- The `base` path in `vite.config.ts` must match the repo name exactly, or assets (JS, CSS, images) will 404.
- After running `npm run deploy`, GitHub may take 1–2 minutes to publish the page.
