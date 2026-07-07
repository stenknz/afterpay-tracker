# Afterpay Tracker

Track BNPL payment plans (Afterpay, ZIP, Klarna) and recurring subscriptions (Netflix, iCloud, etc.) with partner sharing.

## Features

- **BNPL Dashboard** — payment plans with installment timelines, KPIs, overdue tracking
- **Subscriptions** — recurring payments with monthly cost overview
- **Calendar** — unified view of upcoming payments and subscription due dates
- **Partner Sharing** — share plans & subscriptions with a partner via link codes (My View / Shared View)
- **Stores & Vendors** — track which stores and BNPL vendors you use
- **Multi-user** — NextAuth v5 credentials auth with JWT sessions
- **Dark mode** — theme toggle with Tailwind v4

## Environment

| | |
|---|---|
| **Runtime** | Docker container on ASUSTOR NAS |
| **Docker image** | `stenknz/afterpay-tracker:latest` (Docker Hub) |
| **Database** | SQLite (file volume inside Docker) |

## Deploy

| Script | Purpose |
|---|---|
| `.\test.ps1` | Pull latest image, local Acceptance testing |
| `.\deploy.ps1` | Rsync + SSH to NAS Production |
| `.github/workflows/docker-publish.yml` | Auto-publishes Docker image on push to master |

Push to `master` → GitHub Actions builds & tags the image → run `.\test.ps1` to verify → `.\deploy.ps1` to go live.

## Development

```bash
npm install
npx prisma migrate dev      # apply schema migrations
npx prisma generate          # regenerate client
npm run dev                  # http://localhost:3000
```

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Prisma 7** with SQLite + `@prisma/adapter-better-sqlite3`
- **NextAuth v5** (Credentials, JWT)
- **Tailwind CSS v4** (no `tailwind.config.ts`, theme in `globals.css`)
- **Docker** (multi-stage build, single container)

## Project Structure

```
src/
  app/
    (auth)/          login, register (no sidebar)
    (app)/           dashboard, payments, calendar, subscriptions, stores, settings
    api/             REST routes (dashboard, payment-plans, installments, subscriptions, stores, upload, calendar)
  components/        KpiCard, charts, Sidebar, PaymentCard, InstallmentTimeline, etc.
  lib/               prisma.ts (singleton), auth.ts (NextAuth), generate-installments.ts
```
