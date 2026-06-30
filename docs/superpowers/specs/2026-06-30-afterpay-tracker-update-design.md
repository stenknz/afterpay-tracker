# Afterpay Tracker Update — Design Doc

**Goal:** Update the Afterpay Tracker with Apple-inspired visual redesign, functional improvements to calendar/subscriptions/payments, and fix archive/paid-visibility issues.

---

## 1. Data Model Changes

### Subscription model
- Add `billingCycle` field: `MONTHLY | QUARTERLY | BI_ANNUAL | YEARLY` (default `MONTHLY`)
- Update `subscription-dates.ts` to handle all four frequencies when calculating next due dates and generating date ranges

### PaymentPlan model
- Auto-transition `status` to `COMPLETED` when all installments are marked PAID (in `installments/[id]/route.ts` PUT handler)

---

## 2. Calendar Changes

- **Event click → centered modal popup** showing item details (name, store, amount, status, next due date). Close via X button or click-outside. No navigation away.
- **Keep existing date-click → slide-in drawer** behavior unchanged
- **Set Monday as first day of week** via FullCalendar `firstDay: 1`

---

## 3. Payment Card Changes

- Add "Amount Left to Pay" line to `PaymentCard`: `$X of $Y paid` with amount remaining highlighted
- Calculation: `totalAmount - sum(paid installment amounts)`
- Show as part of the card body

---

## 4. Paid Payments Visibility

- Add a "Completed" sub-header section in the main payments listing for fully-paid plans
- Auto-transition plan status to `COMPLETED` when all installments paid (see Section 1)
- "All" view includes a visual separator between active and completed plans

---

## 5. Archive Search Fix

- Add `archived` query param support to `/api/payment-plans/route.ts`
- When `archived=true`, filter `archivedAt: { not: null }`
- When `archived=false` or absent, filter `archivedAt: null`

---

## 6. Apple-Inspired Visual Redesign

### Palette (True Apple Neutral)
| Role | Light | Dark |
|------|-------|------|
| Background | `#F5F5F7` | `#1D1D1F` |
| Card surface | `#FFFFFF` | `#2D2D2F` |
| Primary text | `#1D1D1F` | `#F5F5F7` |
| Secondary text | `#86868B` | `#A1A1A6` |
| Accent (interactive) | `#007AFF` | `#0A84FF` |
| Paid status | `#34C759` | `#30D158` |
| Pending status | `#FF9500` | `#FF9F0A` |
| Overdue status | `#FF3B30` | `#FF453A` |
| Border/divider | `#D2D2D7` | `#3A3A3C` |

### Typography
- Replace Geist with **Inter** (Google Fonts) — variable weight 300–700
- Headings: `font-semibold`, body: `font-normal`

### Visual System
- Cards: white bg, `rounded-2xl`, `shadow-sm`, hover `shadow-md` transition
- Buttons: `rounded-xl`, pill-like, `bg-[#007AFF]` primary, white text
- Inputs: `rounded-xl`, `border-[#D2D2D7]`, focus ring `ring-[#007AFF]/30`
- Sidebar: `w-64`, frosted glass `backdrop-blur` on mobile, thinner separator
- Generous whitespace: `gap-6`, `p-6` card padding, `space-y-6` sections
- Status badges: solid colored dot + text, emerald/orange/red

### Theme
- Keep custom `ThemeProvider` (Context + localStorage), just update CSS variables
- Tailwind v4 `@theme inline` block updated with new palette
- `.dark` variant toggles all surfaces

---

## 7. Deployment

- No changes needed. Current setup:
  - Acceptance: Docker Desktop (local PC) with `Data/dev.db`
  - Production: Portainer on NAS with `/volume1/Docker/afterpay-tracker/prod-data`
- Deploy scripts already exclude database due to `.gitignore` and separate workflows
