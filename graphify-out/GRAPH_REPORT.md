# Graph Report - .  (2026-06-30)

## Corpus Check
- Corpus is ~25,022 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 62 edges · 69 communities (7 shown, 62 thin omitted)
- Extraction: 8% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core App Features|Core App Features]]
- [[_COMMUNITY_UI Components & Pages|UI Components & Pages]]
- [[_COMMUNITY_Auth & ORM Layer|Auth & ORM Layer]]
- [[_COMMUNITY_Infrastructure & Deploy|Infrastructure & Deploy]]
- [[_COMMUNITY_Payment Management|Payment Management]]
- [[_COMMUNITY_Dashboard & Analytics|Dashboard & Analytics]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Registration Flow|Registration Flow]]
- [[_COMMUNITY_App Layout|App Layout]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_Archive Route|Archive Route]]
- [[_COMMUNITY_Auth Layout|Auth Layout]]
- [[_COMMUNITY_Calendar Page|Calendar Page]]
- [[_COMMUNITY_Calendar API Route|Calendar API Route]]
- [[_COMMUNITY_Installment Preview|Installment Preview]]
- [[_COMMUNITY_Providers|Providers]]
- [[_COMMUNITY_Status Badge|Status Badge]]
- [[_COMMUNITY_Dashboard API Route|Dashboard API Route]]
- [[_COMMUNITY_Edit Payment Page|Edit Payment Page]]
- [[_COMMUNITY_ID Route Patch|ID Route Patch]]
- [[_COMMUNITY_Format Date Utility|Format Date Utility]]
- [[_COMMUNITY_Generate Installments|Generate Installments]]
- [[_COMMUNITY_Subscription Date Range|Subscription Date Range]]
- [[_COMMUNITY_Next Payment Dates|Next Payment Dates]]
- [[_COMMUNITY_Theme Provider|Theme Provider]]
- [[_COMMUNITY_Use Theme Hook|Use Theme Hook]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_New Payment Page|New Payment Page]]
- [[_COMMUNITY_NextAuth Route|NextAuth Route]]
- [[_COMMUNITY_Partners GET Route|Partners GET Route]]
- [[_COMMUNITY_Partners POST Route|Partners POST Route]]
- [[_COMMUNITY_Payment Plans GET|Payment Plans GET]]
- [[_COMMUNITY_Payment Plans POST|Payment Plans POST]]
- [[_COMMUNITY_Payments GET Route|Payments GET Route]]
- [[_COMMUNITY_Profile PATCH Route|Profile PATCH Route]]
- [[_COMMUNITY_Register POST Route|Register POST Route]]
- [[_COMMUNITY_Restore Route|Restore Route]]
- [[_COMMUNITY_Settings Page|Settings Page]]
- [[_COMMUNITY_Settings GET Route|Settings GET Route]]
- [[_COMMUNITY_Settings PATCH Route|Settings PATCH Route]]
- [[_COMMUNITY_Installments PUT Route|Installments PUT Route]]
- [[_COMMUNITY_Partners DELETE Route|Partners DELETE Route]]
- [[_COMMUNITY_Payment Plans DELETE|Payment Plans DELETE]]
- [[_COMMUNITY_Payment Plans ID GET|Payment Plans ID GET]]
- [[_COMMUNITY_Payment Plans ID PUT|Payment Plans ID PUT]]
- [[_COMMUNITY_Stores DELETE Route|Stores DELETE Route]]
- [[_COMMUNITY_Stores PUT Route|Stores PUT Route]]
- [[_COMMUNITY_Sub Payment DELETE|Sub Payment DELETE]]
- [[_COMMUNITY_Sub Payment POST|Sub Payment POST]]
- [[_COMMUNITY_Sub DELETE Route|Sub DELETE Route]]
- [[_COMMUNITY_Sub PUT Route|Sub PUT Route]]
- [[_COMMUNITY_Uploads GET Route|Uploads GET Route]]
- [[_COMMUNITY_Util Payment DELETE|Util Payment DELETE]]
- [[_COMMUNITY_Util Payment POST|Util Payment POST]]
- [[_COMMUNITY_Util DELETE Route|Util DELETE Route]]
- [[_COMMUNITY_Util GET Route|Util GET Route]]
- [[_COMMUNITY_Util PUT Route|Util PUT Route]]
- [[_COMMUNITY_Uploads Path GET|Uploads Path GET]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Stores GET Route|Stores GET Route]]
- [[_COMMUNITY_Stores POST Route|Stores POST Route]]
- [[_COMMUNITY_Subscriptions GET|Subscriptions GET]]
- [[_COMMUNITY_Subscriptions POST|Subscriptions POST]]
- [[_COMMUNITY_Tailscale VPN|Tailscale VPN]]
- [[_COMMUNITY_Upload POST Route|Upload POST Route]]
- [[_COMMUNITY_Utilities GET Route|Utilities GET Route]]
- [[_COMMUNITY_Utilities POST Route|Utilities POST Route]]
- [[_COMMUNITY_Vendors GET Route|Vendors GET Route]]

## God Nodes (most connected - your core abstractions)
1. `CalendarView` - 1 edges
2. `ConfirmDialog` - 1 edges
3. `KpiCard` - 1 edges
4. `PaymentCard` - 1 edges
5. `ThemeToggle` - 1 edges
6. `CalendarPage` - 0 edges
7. `AppLayout` - 0 edges
8. `EditPaymentPage` - 0 edges
9. `NewPaymentPage` - 0 edges
10. `SettingsPage` - 0 edges

## Surprising Connections (you probably didn't know these)
- `Sidebar Component` ----> `Dashboard Page`  [INFERRED]
   →   _Bridges community 5 → community 1_
- `Sidebar Component` ----> `Payments Page`  [INFERRED]
   →   _Bridges community 4 → community 1_
- `Afterpay Tracker` ----> `Docker`  [HIGH]
   →   _Bridges community 0 → community 3_
- `Afterpay Tracker` ----> `NextAuth v5`  [HIGH]
   →   _Bridges community 0 → community 2_
- `Prisma 7` ----> `Prisma Config`  [HIGH]
   →   _Bridges community 2 → community 3_

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication System** — nextauth-v5, auth-config, login-page, register-page, register-api, prisma-client-singleton, edge-runtime [INFERRED]
- **Payment System** — payment-plan-model, payment-installment-model, payment-plans-api, installments-api, payments-page, paymentcard-component, installmenttimeline-component, generate-installments [INFERRED]
- **Dashboard System** — dashboard-page, dashboard-api, kpicard-component, charts-module [INFERRED]
- **Data Model** — user-model, store-model, payment-plan-model, payment-installment-model [INFERRED]
- **Infrastructure & Deployment** — docker, docker-compose, github-actions-workflow, docker-hub, asustor-nas, tailscale [INFERRED]
- **UI/Layout System** — sidebar-component, settings-page, dark-mode, tailwind-theme, tailwind-css-v4, next-themes [INFERRED]

## Communities (69 total, 62 thin omitted)

### Community 0 - "Core App Features"
Cohesion: 0.14
Nodes (15): Afterpay Tracker, BNPL Dashboard, BNPL Payment Tracking, Dark Mode, FullCalendar, Implementation Plan (2026-06-10), next-themes, Next.js 16 (+7 more)

### Community 1 - "UI Components & Pages"
Cohesion: 0.18
Nodes (11): Calendar API, Calendar Page, CalendarView Component, CalendarView, ConfirmDialog, ThemeToggle, Settings Page, Sidebar Component (+3 more)

### Community 2 - "Auth & ORM Layer"
Cohesion: 0.29
Nodes (8): Auth Config, @prisma/adapter-better-sqlite3, Edge Runtime, NextAuth v5, Prisma 7, Prisma Client Singleton, prisma generate, prisma migrate dev

### Community 3 - "Infrastructure & Deploy"
Cohesion: 0.29
Nodes (7): ASUSTOR NAS, Docker, Docker Compose, Docker Hub, GitHub Actions Docker Publish, Prisma Config, SQLite Database

### Community 4 - "Payment Management"
Cohesion: 0.33
Nodes (6): PaymentCard, Installments API, InstallmentTimeline Component, Payment Plans API, PaymentCard Component, Payments Page

### Community 5 - "Dashboard & Analytics"
Cohesion: 0.40
Nodes (5): Charts Module, KpiCard, Dashboard API, Dashboard Page, KpiCard Component

### Community 6 - "Data Models"
Cohesion: 0.50
Nodes (5): Generate Installments, PaymentInstallment Model, PaymentPlan Model, Store Model, User Model

## Knowledge Gaps
- **64 isolated node(s):** `CalendarPage`, `AppLayout`, `EditPaymentPage`, `NewPaymentPage`, `SettingsPage` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 5 inferred relationships involving `Sidebar Component` (e.g. with `Calendar Page` and `Dashboard Page`) actually correct?**
  _`Sidebar Component` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CalendarPage`, `AppLayout`, `EditPaymentPage` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core App Features` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._