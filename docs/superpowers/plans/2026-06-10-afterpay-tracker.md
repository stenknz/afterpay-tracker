# Afterpay Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Afterpay payment tracking web app with dashboard, calendar, and payment management.

**Architecture:** Next.js 14+ App Router with RSC-heavy data fetching. Prisma ORM + SQLite for storage. NextAuth.js for auth. Server components read data directly; client components handle interactive UI and call API routes for mutations.

**Tech Stack:** Next.js 14+, TypeScript, Prisma (SQLite), NextAuth.js, Tailwind CSS, Recharts, FullCalendar, Zod, React Dropzone

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run: `npx create-next-app@latest afterpay-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack`

- [ ] **Step 2: Install all dependencies**

```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta @next-auth/prisma-adapter recharts @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction react-dropzone zod bcryptjs date-fns
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 3: Set up folder structure**

Create directories: `src/app/(auth)/login`, `src/app/(auth)/register`, `src/app/(auth)/reset-password`, `src/app/(app)/dashboard`, `src/app/(app)/payments/new`, `src/app/(app)/payments/[id]`, `src/app/(app)/payments/[id]/edit`, `src/app/(app)/calendar`, `src/app/(app)/stores`, `src/app/(app)/settings`, `src/app/(app)/payments/upcoming`, `src/app/(app)/payments/overdue`, `src/app/(app)/payments/paid`, `src/components`, `src/lib`, `src/types`, `prisma`, `public/uploads`

- [ ] **Step 4: Configure .env**

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="public/uploads"
```

- [ ] **Step 5: Commit**

```bash
git add -A; git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Set up Prisma schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Write Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             String        @id @default(cuid())
  name           String?
  email          String        @unique
  hashedPassword String
  stores         Store[]
  paymentPlans   PaymentPlan[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Store {
  id           String        @id @default(cuid())
  name         String
  logoPath     String?
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  paymentPlans PaymentPlan[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model PaymentPlan {
  id                String             @id @default(cuid())
  userId            String
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeId           String?
  store             Store?             @relation(fields: [storeId], references: [id], onDelete: SetNull)
  totalAmount       Float
  installmentAmount Float
  frequency         String             @default("MONTHLY")
  startDate         DateTime
  endDate           DateTime?
  status            String             @default("ACTIVE")
  notes             String?
  installments      PaymentInstallment[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model PaymentInstallment {
  id            String   @id @default(cuid())
  paymentPlanId String
  paymentPlan   PaymentPlan @relation(fields: [paymentPlanId], references: [id], onDelete: Cascade)
  amount        Float
  dueDate       DateTime
  status        String   @default("PENDING")
  paidAt        DateTime?
  createdAt     DateTime @default(now())
}
```

- [ ] **Step 2: Create Prisma client singleton**

File: `src/lib/prisma.ts`

- [ ] **Step 3: Run migration + generate**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add -A; git commit -m "feat: add Prisma schema with User, Store, PaymentPlan, Installment"
```

---

### Task 3: Set up NextAuth.js with credentials provider

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`, `src/app/api/register/route.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write auth config**

- [ ] **Step 2: Create API route handler**

- [ ] **Step 3: Create register API route**

- [ ] **Step 4: Add SessionProvider to root layout**

- [ ] **Step 5: Commit**

---

### Task 4: Set up theme, providers, and app layout

**Files:**
- Create: `src/components/providers.tsx`, `src/app/(app)/layout.tsx`, `src/components/Sidebar.tsx`, `src/components/TopBar.tsx`, `src/components/ThemeToggle.tsx`
- Modify: `tailwind.config.ts`, `src/app/globals.css`

- [ ] **Step 1: Configure tailwind with palette and dark mode**

- [ ] **Step 2: Write providers component**

- [ ] **Step 3: Write sidebar with navigation links**

- [ ] **Step 4: Write topbar with user menu and theme toggle**

- [ ] **Step 5: Write app layout wrapping sidebar + topbar + content**

- [ ] **Step 6: Write global CSS with base styles**

- [ ] **Step 7: Commit**

---

### Task 5: Login & Register pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Auth layout (centered card, no sidebar)**

- [ ] **Step 2: Login page with email/password form using NextAuth signIn**

- [ ] **Step 3: Register page with name/email/password form, calls /api/register**

- [ ] **Step 4: Commit**

---

### Task 6: Dashboard with KPI cards and charts

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`, `src/components/KpiCard.tsx`, `src/components/KpiCardGrid.tsx`, `src/components/charts/BarChartCard.tsx`, `src/components/charts/LineChartCard.tsx`, `src/components/charts/DoughnutChartCard.tsx`, `src/app/api/dashboard/route.ts`

- [ ] **Step 1: Dashboard API route — aggregate installments into KPI values**

- [ ] **Step 2: Dashboard page — fetch data in server component, render client chart components**

- [ ] **Step 3: KpiCard component — icon, label, value, subtle background color**

- [ ] **Step 4: BarChartCard — 15/30/90 day due totals using Recharts BarChart**

- [ ] **Step 5: LineChartCard — upcoming payments trend over next 90 days**

- [ ] **Step 6: DoughnutChartCard — paid vs unpaid vs overdue installment counts**

- [ ] **Step 7: Commit**

---

### Task 7: Store management

**Files:**
- Create: `src/app/(app)/stores/page.tsx`, `src/app/api/stores/route.ts`, `src/app/api/stores/[id]/route.ts`, `src/app/api/upload/route.ts`, `src/components/LogoUploader.tsx`

- [ ] **Step 1: Upload API route — write file to `public/uploads/{userId}/` and return path**

- [ ] **Step 2: Stores API — CRUD routes for stores (name + logo)**

- [ ] **Step 3: Stores page — list stores with logos, add/edit/delete store**

- [ ] **Step 4: LogoUploader component — dropzone, preview, upload button**

- [ ] **Step 5: Commit**

---

### Task 8: Add/Edit payment plan with installment generation

**Files:**
- Create: `src/app/(app)/payments/new/page.tsx`, `src/app/(app)/payments/[id]/edit/page.tsx`, `src/app/api/payment-plans/route.ts`, `src/app/api/payment-plans/[id]/route.ts`, `src/components/PaymentForm.tsx`, `src/components/InstallmentPreview.tsx`, `src/lib/generate-installments.ts`

- [ ] **Step 1: Installment generation utility**

- [ ] **Step 2: PaymentPlans API — create with transaction (plan + installments), list with filters, update, delete**

- [ ] **Step 3: PaymentForm — store picker, logo upload, plan details, frequency selector, date picker, notes**

- [ ] **Step 4: InstallmentPreview — auto-populated read-only table of generated installments**

- [ ] **Step 5: Commit**

---

### Task 9: Payment list views (all, upcoming, overdue, paid) with filters

**Files:**
- Create: `src/app/(app)/payments/page.tsx`, `src/app/(app)/payments/upcoming/page.tsx`, `src/app/(app)/payments/overdue/page.tsx`, `src/app/(app)/payments/paid/page.tsx`, `src/components/PaymentCard.tsx`, `src/components/FilterBar.tsx`, `src/components/StatusBadge.tsx`

- [ ] **Step 1: All payments page — server component fetching payments with store, installments, filterable by search params**

- [ ] **Step 2: FilterBar — date range picker, store dropdown, status tabs**

- [ ] **Step 3: PaymentCard — store logo, name, total amount, next due date, status badge, progress**

- [ ] **Step 4: Upcoming, overdue, paid views — same layout, pre-filtered by status/due date**

- [ ] **Step 5: Commit**

---

### Task 10: Payment detail page with installment timeline

**Files:**
- Create: `src/app/(app)/payments/[id]/page.tsx`, `src/app/api/installments/[id]/route.ts`, `src/components/InstallmentTimeline.tsx`

- [ ] **Step 1: Payment detail — server component with plan info, store, notes, full installment list**

- [ ] **Step 2: Mark installment paid API — PUT `/api/installments/[id]` with `{ status: "PAID", paidAt: now }`**

- [ ] **Step 3: InstallmentTimeline — vertical timeline of installments, click to mark paid, status badges, overdue highlighting**

- [ ] **Step 4: Commit**

---

### Task 11: Calendar view

**Files:**
- Create: `src/app/(app)/calendar/page.tsx`, `src/app/api/calendar/route.ts`, `src/components/CalendarView.tsx`, `src/components/DayDetailDrawer.tsx`

- [ ] **Step 1: Calendar API — fetch all installments for user within a date range, return as FullCalendar events**

- [ ] **Step 2: Calendar page — server component wrapping FullCalendar client component**

- [ ] **Step 3: CalendarView — FullCalendar with month/week toggle, color-coded events**

- [ ] **Step 4: DayDetailDrawer — slide-out panel with installments for clicked date, links to payment details**

- [ ] **Step 5: Commit**

---

### Task 12: Settings page

**Files:**
- Create: `src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Settings page — profile info display, theme toggle, account management**

- [ ] **Step 2: Commit**

---

### Task 13: Polish, responsive design, dark mode

- [ ] **Step 1: Ensure all pages are responsive (mobile sidebar, stacked cards on small screens)**

- [ ] **Step 2: Verify dark mode toggle works across all pages**

- [ ] **Step 3: Add loading skeletons for server component suspense boundaries**

- [ ] **Step 4: Add empty states for lists with no data**

- [ ] **Step 5: Commit**

---

### Task 14: Final build verification

- [ ] **Step 1: Run `npm run build` — fix any type errors**

- [ ] **Step 2: Verify dev server starts and all routes work correctly**

- [ ] **Step 3: Commit final changes**

```bash
git add -A; git commit -m "chore: final polish and build verification"
```
