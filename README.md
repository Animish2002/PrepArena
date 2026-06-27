# PrepArena

Competitive coding practice platform with real-time battles, friends, and leaderboards.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables (dark/light) |
| Animations | Motion (Framer Motion) |
| Routing | React Router DOM v7 |
| State | Zustand |
| HTTP client | Axios |
| PWA | vite-plugin-pwa |
| Backend | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Cache/Sessions | Cloudflare KV |
| File storage | Cloudflare R2 |
| Shared types | TypeScript package (`@preParena/shared`) |

## Monorepo structure

```
PrepArena/
├── apps/
│   ├── web/        React + Vite frontend
│   └── api/        Hono + Wrangler Cloudflare Worker
└── packages/
    └── shared/     Shared TypeScript interfaces
```

## Getting started

```bash
# Install all workspace deps
npm install

# Run frontend dev server
npm run dev:web

# Run API worker locally (requires wrangler login)
npm run dev:api
```

## Routes

| Path | Page |
|------|------|
| `/login` | Auth page |
| `/dashboard` | User home |
| `/problems` | Problem list |
| `/friends` | Social / friends |
| `/leaderboard` | Global rankings |
| `/battle` | Real-time coding battles |

## Environment setup (API)

Before deploying, replace placeholder IDs in `apps/api/wrangler.toml`:
- `database_id` — your D1 database ID (`wrangler d1 create preParena-db`)
- `id` under `kv_namespaces` — your KV namespace ID (`wrangler kv namespace create KV`)
