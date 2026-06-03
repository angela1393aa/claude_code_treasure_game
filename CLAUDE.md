# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev:all    # Start both frontend (port 3000) and backend (port 3001) concurrently
npm run dev        # Frontend only (Vite dev server, port 3000)
npm run server     # Backend only (Express + SQLite, port 3001)
```

### Build
```bash
npm run build      # Production build → ./build/
```

### Backend package management
The `server/` directory is a standalone Node.js project with its own `package.json`. Install backend dependencies separately:
```bash
cd server && npm install
```

## Architecture

### Two-server setup
This is a split-server project with no proxy between them:
- **Frontend**: Vite dev server at `http://localhost:3000` — React 18 + TypeScript
- **Backend**: Express at `http://localhost:3001` — all routes prefixed with `/api`

The frontend calls the backend directly via `src/lib/api.ts` using `http://localhost:3001` as the base URL.

### Frontend structure
- **`src/App.tsx`** — the entire game UI and logic. Contains the auth gate: if `user === null && !isGuest`, renders only `<AuthModal>` instead of the game board.
- **`src/context/AuthContext.tsx`** — single source of truth for auth state (`user`, `token`, `isGuest`). Persists JWT in `localStorage` and rehydrates on mount via `GET /api/me`.
- **`src/lib/api.ts`** — all `fetch` wrappers. Every function throws an `Error` with the server's message on non-2xx responses.
- **`src/components/`** — game-specific components (`AuthModal`, `UserBar`, `ScoreHistoryPanel`) alongside shadcn/ui primitives in `src/components/ui/`.

### Backend structure (`server/`)
- **`server/index.js`** — Express entry point. Uses ES Modules (`"type": "module"`).
- **`server/db.js`** — Initializes `treasure.db` using Node.js built-in **`node:sqlite`** (requires `--experimental-sqlite` flag). The `users` and `scores` tables are created at startup with `CREATE TABLE IF NOT EXISTS`.
- **`server/middleware/auth.js`** — JWT verification. Attaches `req.user = { userId, email }` on success.
- **`server/routes/auth.js`** — `POST /api/signup`, `POST /api/login`, `GET /api/me`
- **`server/routes/scores.js`** — `POST /api/scores`, `GET /api/scores`, `GET /api/scores/leaderboard`

### Why `node:sqlite` instead of `better-sqlite3`
`better-sqlite3` requires native C++ compilation (Visual Studio on Windows). This machine doesn't have it, so the project uses Node.js 22's built-in `node:sqlite` module instead. The `--experimental-sqlite` flag is baked into the `npm run server` and `npm run dev:all` scripts.

### Vite versioned import aliases
`vite.config.ts` maps versioned import paths to their plain package names (e.g., `sonner@2.0.3` → `sonner`, `@radix-ui/react-dialog@1.1.6` → `@radix-ui/react-dialog`). This is why shadcn/ui component files use versioned imports — **do not change these imports**; Vite resolves them correctly.

### Authentication flow
1. Guest mode: `isGuest = true`, no API calls, scores not saved.
2. Signed-in: JWT stored in `localStorage` as `auth_token`. Sent as `Authorization: Bearer <token>` on every protected request.
3. After each game ends, `App.tsx` calls `apiSaveScore()` if `user !== null`.

### Score computation note
The score in `App.tsx` is computed inside the `setBoxes` updater by reducing over `updatedBoxes` (not from the outer `score` state variable, which would be stale). Any future changes to scoring logic must keep this pattern to avoid stale closure bugs.
