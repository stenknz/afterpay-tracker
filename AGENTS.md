# Afterpay Tracker — AGENTS.md

## Prisma 7 (breaking changes)
- **Datasource `url` is NOT set in `schema.prisma`** — it goes in `prisma.config.ts` via `defineConfig({ datasource: { url } })`
- **PrismaClient requires a driver adapter** — for SQLite: `@prisma/adapter-better-sqlite3` with `new PrismaBetterSqlite3({ url: dbPath })`
- **Middleware / Edge Runtime cannot import Prisma** — `path`, `better-sqlite3`, `@prisma/adapter-*` are Node.js only. If middleware needs auth, keep Prisma behind dynamic `import()` or avoid importing prisma.ts in the middleware chain entirely.
- **Generator is still `prisma-client-js`** (Turbopack-compatible), not the new `prisma-client` generator
- **Env vars don't auto-load** — `prisma.config.ts` uses `process.env.DATABASE_URL` directly
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev --name <name>` for migrations

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |

## Auth
- **NextAuth v5** with Credentials provider, JWT strategy
- Auth config in `src/lib/auth.ts` uses **dynamic import** of Prisma to avoid edge runtime issues
- Middleware is a lightweight cookie check; real auth gate is in `src/app/(app)/layout.tsx`
- `/api` is excluded from middleware intentionally — each API route handles its own auth via `auth()` calls
- Register at `/api/register` (POST), sign in via `/login`

## Project structure
```
src/
  app/
    (auth)/       - login, register (no sidebar)
    (app)/        - dashboard, payments, calendar, stores, settings (authenticated)
    api/          - REST routes (dashboard, payment-plans, installments, stores, upload, calendar)
  components/     - KpiCard, charts, Sidebar, PaymentCard, InstallmentTimeline, CalendarView, etc.
  lib/            - prisma.ts (client singleton), auth.ts (NextAuth config), generate-installments.ts
```

## Style
- Palette (via `@theme inline` in `globals.css`): primary=#007AFF (blue), accent=#FF9500 (orange)
- Status colors: PAID=emerald, PENDING=amber, OVERDUE=red
- Dark mode is a custom implementation (ThemeProvider in `src/lib/theme-provider.tsx`), not `next-themes`
- Date format: DD/MM/YYYY throughout the app

## Data model
- **User** → has many **Store**, has many **PaymentPlan**
- **PaymentPlan** → has many **PaymentInstallment**, belongs to **Store** (optional)
- Installment statuses: `PENDING` | `PAID` | `OVERDUE` (computed on read)
- Plan statuses: `ACTIVE` | `COMPLETED` | `CANCELLED`
