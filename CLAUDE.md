# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

**Docker (prod-like):**
```bash
docker compose up -d
```
Frontend on `:80`, backend on `:8000`. Data in named volumes (`goldkeep_data`, `goldkeep_uploads`).

**Backend dev:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 19090
```
Swagger at `http://localhost:19090/docs`.

**Frontend dev:**
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173, proxies /api → :8000
npm run build      # tsc -b && vite build → dist/
npm run lint       # eslint (TypeScript + React hooks rules)
```

No test suite exists yet.

**IMPORTANT:** 修改前端代码后，如果 Docker 容器已在运行，必须重建镜像才能看到变更：
```bash
docker compose build frontend && docker compose up -d frontend
```
修改后端代码同理：
```bash
docker compose build backend && docker compose up -d backend
```

## Architecture

Single-user gold asset tracker. SPA frontend + FastAPI backend + SQLite.

### Auth flow
- Password login via `POST /api/login` returns a JWT bearer token (72h expiry).
- `AuthMiddleware` guards all `/api/*` paths except the public allowlist: `/api/login`, `/api/health`, `/api/gold-prices`, `/uploads`.
- Token stored in `localStorage`. `ProtectedRoute` component redirects to `/login` when absent.
- Single `User` row — no registration. Password stored as bcrypt hash.

### Data model (SQLite, two tables)
- `gold_assets` — name, classification (`jewelry`|`gold_bar`), subtype (nullable; for jewelry: bracelet/chain/ring/necklace/earrings/pendant), weight, purchase_price_per_gram, purchase_price (total), purchase_date, photo path, notes.
- `gold_prices` — date (unique, ISO string) + price (CNY/gram). Daily time series.
- `users` — single row with `password_hash`.

### Gold price pipeline
- Backend `BackgroundScheduler` (APScheduler) runs daily at 9:30 AM, calling `daily_fetch()` in `main.py`.
- `fetch_gold.py` hits `api.gold-api.com` for USD/oz XAU price, then `open.er-api.com` for USD→CNY forex. Converts to CNY/gram.
- Price stored in `gold_prices` table. `GET /api/gold-prices/latest` triggers `ensure_today()` which fetches on-demand if missing.
- On first run, `seed.py` backfills 90 days of pseudo-random historical prices anchored to the latest real price.

### Frontend structure
- `App.tsx` — router: `/` Dashboard, `/trend` Trend, `/assets/new` form, `/assets/:id` detail, `/assets/:id/edit` edit, `/settings` settings, `/login` login.
- `Layout.tsx` — sticky header + bottom tab nav (资产/走势/设置), hidden on asset form/edit/login pages.
- `store/auth.tsx` — `AuthProvider` context wrapping the app. Exposes `login`, `logout`, `changePassword`.
- API layer (`api/client.ts`) — thin `fetch` wrappers (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) with JWT header injection.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Gold theme color `gold-*`. PWA via `vite-plugin-pwa`.

### API pattern
All asset endpoints use `multipart/form-data` (not JSON) — `Form(...)` params for fields, `UploadFile` for photos. Auth endpoints also use `Form(...)`. The frontend sends `FormData` objects.

### Production serving
- The FastAPI app checks for `frontend/dist/` at startup. If present, it mounts `/assets/*` static files and serves `index.html` as an SPA fallback for all non-API routes.
- Docker: nginx serves the built frontend; backend is API-only. Two separate containers, nginx proxies nothing — the frontend Dockerfile uses a standalone nginx image.

### Key conventions
- Domain language from `CONTEXT.md`: 黄金资产 (Gold Asset), Classification (首饰 Jewelry / 金条 Gold Bar), Subtype, Weight (克), Purchase Price Per Gram (下单克价), Purchase Price (买入总价), Holding Value (Weight × latest price), Gold Price.
- No purity/karat, no workmanship fee tracking, single-user, daily price granularity.
- All UI text in Chinese.
- **每次 push 之后必须同步更新 README.md**，确保 README 反映项目当前状态。
