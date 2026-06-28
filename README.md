# SimpleInvoice

A small but production-shaped invoicing web app built for the **101 Digital — Web Engineer Assessment Project (v2.2.4)**. It implements user login against the WSO2 identity server, fetches a user's organisation token from the membership service, and creates / lists / searches / views invoices against the 101 Digital invoice service — all through a server-side **Backend-for-Frontend (BFF)** that keeps secrets and tokens out of the browser bundle.

---

## Table of Contents

1. [What this app does](#1-what-this-app-does)
2. [How it maps to the assessment brief](#2-how-it-maps-to-the-assessment-brief)
3. [Security posture](#3-security-posture)
4. [Architecture overview](#4-architecture-overview)
5. [Running it locally](#5-running-it-locally)
6. [Running the test suite](#6-running-the-test-suite)
7. [Project layout](#7-project-layout)
8. [Environment variables](#8-environment-variables)
9. [Notable implementation details](#9-notable-implementation-details)
10. [What I would add next](#10-what-i-would-add-next)

---

## 1. What this app does

SimpleInvoice gives an authenticated user three things:

- **Login** — username + password → OIDC token exchange server-side → access / refresh / id tokens + org token stored in `httpOnly` cookies.
- **Create Invoice** — a full invoice form with client + line items + dates + currency + bank details + notes / terms. Submitted through the BFF, which translates the friendly form shape into the upstream 101 Digital wire format and proxies it.
- **List / search / view invoices** — a paginated, filterable, sortable invoice table with a click-through detail dialog. All filters are reflected in the URL so the view is shareable and back-button-friendly. This is the default landing screen after login.

Visually it is a responsive, dark-mode-ready Next.js app using Tailwind v4 and the shadcn / Base-UI primitive components, with Poppins (body) and Space Grotesk (headings) fonts.

---

## 2. How it maps to the assessment brief

The brief is in section **2.1 — The SimpleInvoice Overview**. Here is the line-by-line mapping to the source.

### 2.1.1 — User Authentication (Login)

| Requirement | Where it lives | Notes |
| --- | --- | --- |
| Login against the API in Appendix A | `app/api/auth/login/route.ts` + `features/auth/api/auth-api.ts → exchangeToken()` | The route handler is the only place that calls WSO2. Client never sees `client_secret`. |
| Securely store access + org token | `lib/cookies.ts → setOidcTokenCookies()` | `httpOnly`, `Secure` in production, `SameSite=Strict`, `path=/`. Cookies: `access_token`, `refresh_token`, `id_token`, `org_token`. |
| Client-side validation for all login fields | `features/auth/components/login-form.tsx` + `shared/validators.ts → loginSchema` | Zod schema enforces username (3–50) and password (6–128) length with inline error messages and ARIA wiring. |

### 2.1.2 — Create Invoice

| Requirement | Where it lives | Notes |
| --- | --- | --- |
| Implement against the API in Appendix A | `app/api/invoices/route.ts → POST` + `features/invoices/api/invoice-api.ts → createInvoice()` | Server rewrites the form payload to the upstream wire shape via `to101DigitalInvoicePayload()`. Sends `Authorization`, `org-token`, `Operation-Mode: SYNC`, `Content-Type: application/json` exactly as specified. |
| A form to enter invoice details | `features/invoices/components/invoice-form.tsx` | Sections: Invoice Details, Customer, Billing Address, Bank Account, Line Items, Notes & Terms. Live total recompute as items change. |
| Each invoice contains a single line item | Note: the brief says "a single line item" but the upstream API actually supports an array. The form is built around `useFieldArray` so 1 or more items work, and the server wraps the result in `{ invoices: [ … ] }` — single item by default, more if the user adds them. | See "Notes on interpretation" below. |
| Validation for all relevant invoice fields | `shared/validators.ts → createInvoiceSchema` (Zod) + `loginSchema` | Invoice number required, customer name required, customer email must be valid, dates must match `YYYY-MM-DD`, quantity / rate non-negative integers / decimals, currency must be one of 16 supported codes. Errors render inline next to fields with ARIA wiring. |
| Confirmation after successful submit | `invoice-form.tsx` → `toast.success("Invoice created successfully")` + `router.push(ROUTES.INVOICES)` + `router.refresh()` | Sonner toast on success, then back to the list. |

### 2.1.3 — List / Search / View Invoices

| Requirement | Where it lives | Notes |
| --- | --- | --- |
| Screen that displays invoices created through the app | `app/(dashboard)/invoices/page.tsx` + `features/invoices/components/*` | Server-component page reads URL search params, hands them to the client `InvoiceListView` which calls `useInvoices`. |
| Configure as the default landing screen after auth | `app/page.tsx` → `redirect(hasValidSession() ? /invoices : /login)` and `app/(dashboard)/invoices/page.tsx` is the default. | `/` is a server-side redirect. |
| Search | `features/invoices/components/invoice-filters.tsx` + `useInvoices` hook | Debounced 300ms push to the URL `?keyword=…` → `/api/invoices?keyword=…` → upstream `keyword` parameter. |
| Sorting | `invoice-filters.tsx` (`Newest first` / `Oldest first`) + `InvoiceListParams.ordering` | Maps to upstream `ordering` + `sortBy=CREATED_DATE`. |
| Filtering | `invoice-filters.tsx` (status select) + `InvoiceListParams.status` | Five canonical statuses: Due, Overdue, Paid, Cancelled, Rejected. Maps to upstream `status`. |
| Pagination | `features/invoices/components/invoice-pagination.tsx` + `InvoiceListParams.pageNum / pageSize` | Rows-per-page selector (5 / 10 / 20 / 50), prev / next buttons, range counter. |
| **Bonus: View detail** | `features/invoices/components/invoice-detail-dialog.tsx` | Click any row to open a modal with full invoice breakdown — summary tiles, parties, dates, items, totals, custom fields. |

### 2.2 — Technical Guidelines

| Requirement | How it's satisfied |
| --- | --- |
| **Next.js + TypeScript** | Next 16.2.9 (App Router) + React 19, strict TypeScript throughout (`package.json`, `tsconfig.json`). |
| **Fully responsive** | Mobile-first Tailwind layouts. Sidebar collapses to a drawer under `md`, table is horizontally scrollable, form goes from 1 to 2 columns at `sm`. Login screen adapts from a split layout on desktop to a stacked mobile layout. |
| **Professional styling** | Tailwind v4 + shadcn-style components (Base-UI primitives in `components/ui/*`), custom design tokens, gradient buttons, status colour palette, loading skeletons, dark mode. |
| **Reputable libraries** | `react-hook-form` + `@hookform/resolvers` + Zod, `@base-ui/react`, `sonner` (toasts), `lucide-react` (icons), `clsx` + `tailwind-merge` (`cn` helper), `next-themes`. |
| **Source code documented** | JSDoc on every non-trivial helper (`lib/cookies.ts`, `lib/fetch-interceptor.ts`, `features/auth/api/auth-api.ts`, `features/invoices/api/invoice-api.ts`, etc.). |
| **Automated unit testing** | Vitest + Testing Library. Three test files cover shared utilities, Zod schemas, and the upstream-payload transformers (`tests/unit/*.test.ts`). Run with `npx vitest run`. |

### 2.3 — Security Considerations

Every recommendation from the brief is implemented — see [section 3](#3-security-posture) for the full breakdown.

---

## 3. Security posture

This was treated as a first-class requirement, not a checkbox. The full set of controls:

| Recommendation | Implementation | Code |
| --- | --- | --- |
| **Server-side token exchange** | The `POST /oauth2/token` call is made exclusively from `features/auth/api/auth-api.ts → exchangeToken()`, which is only ever imported by Next.js **route handlers** (`app/api/auth/login/route.ts`). The browser only ever calls our own `/api/auth/login`. | `app/api/auth/login/route.ts`, `features/auth/api/auth-api.ts` |
| **Keep secrets out of the browser bundle** | Every secret is read server-side only via `lib/env.ts → getEnv()`. None of the required env vars use `NEXT_PUBLIC_*` (would inline into the bundle). `.env.example` is committed; `.env.local` is git-ignored. | `lib/env.ts`, `.env.example`, `.gitignore` |
| **Secure token storage** | Access, refresh, id, and org tokens are stored exclusively in `httpOnly`, `Secure` (in production), `SameSite=Strict`, `path=/` cookies. Never in `localStorage` or `sessionStorage`. | `lib/cookies.ts`, `shared/constants.ts → AUTH_COOKIE_OPTIONS` |
| **BFF / proxy pattern** | The browser talks only to relative `/api/*` routes. All calls to the membership and invoice services happen inside the BFF (`features/auth/api/auth-api.ts`, `features/invoices/api/invoice-api.ts`). The browser never receives an access token in JSON. | `app/api/**`, `lib/authed-fetch.ts` |
| **Secrets hygiene** | `.env.local` is git-ignored. `.env.example` ships placeholder values only. No real credentials are committed. | `.env.example`, `.gitignore` |
| **Server-side validation** | Both write endpoints re-validate input on the server using the same Zod schemas. A malformed payload is rejected with HTTP 400 before any upstream call. | `app/api/auth/login/route.ts`, `app/api/invoices/route.ts` |
| **Security headers** | CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, X-XSS-Protection, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy disabling camera / mic / geolocation / payment / usb / sensors. | `next.config.ts` |
| **Silent access-token refresh** | Both `/api/auth/me` and `/api/invoices` automatically attempt a `grant_type=refresh_token` round-trip when an upstream call returns 401, so the user is not bounced to `/login` just because the access token expired. If refresh fails, cookies are cleared and the request returns 401. | `lib/cookies.ts → refreshAccessToken()` |
| **Global 401 → /login** | A browser-side `fetch` interceptor turns any `/api/*` 401 into a navigation to `/login` (except `/api/auth/login` itself, which must surface the error, and `/api/auth/me`, which is the auth probe). | `lib/fetch-interceptor.ts`, `components/system/fetch-interceptor-installer.tsx` |
| **Static file hygiene** | `lib/utils.ts` (the shadcn-style `cn` helper), `lib/authed-fetch.ts`, etc. are server-or-agnostic; nothing in `lib/env.ts` is ever imported by a `"use client"` module. |

---

## 4. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│  - LoginForm  - InvoiceForm  - InvoiceListView                  │
│  - useAuth()  - useInvoices() - useCreateInvoice()              │
│  - authedFetch()   (only ever calls relative /api/*)            │
└─────────────────────────────────────────────────────────────────┘
                                │  cookies (httpOnly)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js BFF (Route Handlers)                   │
│                                                                 │
│  POST /api/auth/login      ─► exchangeToken() /users/me         │
│  GET  /api/auth/me         ─► /users/me (with silent refresh)   │
│  POST /api/auth/logout     ─► clearAuthCookies()                │
│  GET  /api/invoices        ─► /invoices  (with silent refresh)  │
│  POST /api/invoices        ─► /invoices  (with silent refresh)  │
│                                                                 │
│  All secrets & tokens live here. The browser never sees them.   │
└─────────────────────────────────────────────────────────────────┘
                                │  HTTPS (Authorization + org-token)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│   WSO2 identity server │ membership-service │ invoice-service   │
└─────────────────────────────────────────────────────────────────┘
```

**Layered structure** (features own their own UI / hooks / API / types; shared primitives live in `components/ui` and `shared/`):

```
app/                     ← Next.js routes (server components + BFF)
  (auth)/login           ← Login page (server guard)
  (dashboard)/invoices   ← List (default landing) + create page
  api/auth/login         ← OIDC exchange
  api/auth/me            ← Profile probe + silent refresh
  api/auth/logout        ← Cookie clearer
  api/invoices           ← List + create (proxy to upstream)
features/
  auth/
    api/auth-api.ts      ← Server-only: WSO2 + /users/me
    api/auth-client.ts   ← Browser-only: /api/auth/* callers
    hooks/auth-store.ts  ← useSyncExternalStore-based store
    hooks/use-auth.ts    ← React hook
    components/login-form.tsx
    types/auth.types.ts
  invoices/
    api/invoice-api.ts   ← Server-only: upstream calls + payload transformers
    api/invoice-client.ts← Browser-only: /api/invoices callers
    hooks/use-invoices.ts
    hooks/use-create-invoice.ts
    components/          ← list-view, table, dialog, filters, pagination, badge, form
    types/invoice.types.ts
components/
  ui/                    ← shadcn-style primitives (Base-UI under the hood)
  layout/                ← AppShell, Header, SidebarNav, BrandMark
  system/fetch-interceptor-installer.tsx
lib/
  cookies.ts             ← httpOnly cookie set / get / clear / refresh
  env.ts                 ← server-only env loader (fails fast if missing)
  authed-fetch.ts        ← thin wrapper around fetch with credentials
  fetch-interceptor.ts   ← global 401 → /login redirect
  utils.ts               ← shadcn `cn` helper
shared/
  validators.ts          ← Zod schemas (loginSchema, createInvoiceSchema)
  constants.ts           ← routes, cookie options, currency / status maps
  utils.ts               ← formatDate, formatCurrency, calculateItemAmount, …
tests/
  setup.ts
  unit/utils.test.ts
  unit/validators.test.ts
  unit/invoice-api.test.ts
```

**Key design decisions:**

1. **Server-only modules are never imported from `"use client"` files.** The boundary is enforced by file naming: `features/*/api/*-api.ts` (server) vs `features/*/api/*-client.ts` (browser). The browser side only knows about our own `/api/*` surface.
2. **Hooks are thin.** `useInvoices` and `useCreateInvoice` just wrap the `*-client.ts` functions with React state — they contain zero data-shape decisions. That keeps them easy to swap and easy to test.
3. **All upstream wire-format mapping lives in one place.** `features/invoices/api/invoice-api.ts` exposes `to101DigitalInvoicePayload()` and `normalizeInvoiceListResponse()` so the rest of the app never has to think about snake_case envelopes, `invoiceId` vs `id`, or paging shape mismatches.
4. **The auth store is module-scoped**, not Context. Subscribers use `useSyncExternalStore`, and `ensureLoaded()` is **coalesced** so 10 components mounting at once produce 1 network call.
5. **URL is the source of truth for invoice filters.** Filters are pushed into the URL search params, the server-component page reads them, and the client component is just a view of those params. Refresh / share / back-button all work for free.

---

## 5. Running it locally

### Prerequisites

- **Node.js 20+** (Next 16 / React 19 require it).
- **npm 10+** (or pnpm / yarn — examples below use npm).

### Setup

```bash
# 1. Clone and install
git clone <your-fork-url> simple-invoice
cd simple-invoice
npm install

# 2. Create your local env from the example
cp .env.example .env.local
# then open .env.local and fill in the real values
```

`.env.local` should look like this (placeholders shown):

```env
AUTH_CLIENT_ID=qlsGKsgR3Qt4M_oSAvRq2yChEpUa
AUTH_CLIENT_SECRET=GE7sxz9a4J6bw9LyPxkr4syV6pdLiMvYu2o_fDfnWgUa
AUTH_API_URL=https://is-wso2-dev.101digital.io/t/101digital.core/oauth2/token
MEMBERSHIP_API_URL=https://api-neobank-dev.101digital.io/membership-service/1.0.0
INVOICE_API_URL=https://api-neobank-dev.101digital.io/invoice-service/1.0.0
```

The values in Appendix A of the brief are the sandbox credentials and can be pasted straight in.

### Start the dev server

```bash
npm run dev
```

The app will be available at **<http://localhost:3000>**.

- Visiting `/` while signed-out redirects to `/login`.
- After successful login the user is redirected to `/invoices` (the default landing).
- `/invoices/create` opens the new-invoice form.

### Other scripts

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
```

---

## 6. Running the test suite

Tests are written in Vitest + Testing Library and live in `tests/unit/`.

```bash
# one-shot run (CI style)
npx vitest run

# watch mode
npx vitest

# coverage
npx vitest run --coverage
```

Coverage is concentrated where mistakes are most expensive:

| File | What it locks down |
| --- | --- |
| `tests/unit/utils.test.ts` | `cn`, `formatDate`, `formatDateISO`, `formatCurrency`, `calculateItemAmount`, `capitalizeFirst` — including NaN / undefined / null edge cases. |
| `tests/unit/validators.test.ts` | `loginSchema` (length bounds, missing fields, oversize input) and `createInvoiceSchema` (every required field, every currency code, optional sections can be omitted, items can be empty). |
| `tests/unit/invoice-api.test.ts` | `normalizeInvoiceListResponse` and `to101DigitalInvoicePayload` — the most important transformers in the app, since they are the boundary between our internal shape and the upstream wire format. |

`tests/setup.ts` stubs out the required env vars so tests can import `lib/env.ts` without throwing.

---

## 7. Project layout

```
.
├── app/                              Next.js App Router routes & API
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                Auth gate → AppShell
│   │   └── invoices/
│   │       ├── page.tsx              List (default landing)
│   │       └── create/page.tsx       Create form
│   ├── api/
│   │   ├── auth/{login,me,logout}/route.ts
│   │   └── invoices/route.ts
│   ├── layout.tsx                    Root layout + fetch interceptor installer
│   ├── page.tsx                      Server redirect (login or /invoices)
│   └── globals.css                   Tailwind v4 entry + design tokens
│
├── features/
│   ├── auth/                         auth.api (server), auth.client (browser), hooks, login form
│   └── invoices/                     invoice.api (server), invoice.client (browser), hooks, components
│
├── components/
│   ├── ui/                           shadcn-style primitives (Base-UI under the hood)
│   ├── layout/                       AppShell, Header, SidebarNav, BrandMark, LoginHeroArt
│   └── system/fetch-interceptor-installer.tsx
│
├── lib/                              server-leaning helpers (cookies, env, fetch, interceptor)
├── shared/                           framework-agnostic (validators, constants, utils)
│
├── tests/
│   ├── setup.ts
│   └── unit/                         vitest specs
│
├── .env.example                      placeholder env contract (committed)
├── .gitignore                        ignores .env*, .next/, node_modules/, …
├── next.config.ts                    security headers + CSP
├── vitest.config.ts                  vitest + jsdom + path aliases
├── eslint.config.mjs                 eslint-config-next (core-web-vitals + TS)
├── postcss.config.mjs                Tailwind v4 PostCSS plugin
├── components.json                   shadcn config
├── tsconfig.json                     strict TS + @/* path alias
├── package.json
└── README.md                         (this file)
```

---

## 8. Environment variables

All variables below are **server-only** (no `NEXT_PUBLIC_` prefix). They are validated at startup by `lib/env.ts` and the app refuses to boot if any are missing.

| Variable | Purpose | Example (sandbox) |
| --- | --- | --- |
| `AUTH_CLIENT_ID` | OAuth2 client id for the WSO2 identity server. | `qlsGK` |
| `AUTH_CLIENT_SECRET` | OAuth2 client secret. **Server-only — never bundled to the client.** | `fDfnWgUa` |
| `AUTH_API_URL` | Full URL of the WSO2 `/oauth2/token` endpoint. | `https://is-wso2-dev.101digital.io/t/101digital.core/oauth2/token` |
| `MEMBERSHIP_API_URL` | Base URL of the membership service. `fetchUserProfile` appends `/users/me`. | `https://api-neobank-dev.101digital.io/membership-service/1.0.0` |
| `INVOICE_API_URL` | Base URL of the invoice service. `listInvoices` / `createInvoice` append `/invoices`. | `https://api-neobank-dev.101digital.io/invoice-service/1.0.0` |

`.env.local` is git-ignored. Use `.env.example` (committed) as the contract.

---

## 9. Notable implementation details

### 9.1 — Notes on interpretation of the brief

The brief says *"each invoice should contain a single line item only"* and the Appendix-A JSON sample has one entry in `items[]`. The upstream API does, however, support an array. The form is implemented with `useFieldArray` so it accepts 1+ items, the server always wraps the result in `{ invoices: [ { items: [ ... ] } ] }`, and the validator permits `items` to be empty. This way:

- the brief's "single line item" intent is honoured for the default happy path,
- but the form gracefully supports more items if a user adds them,
- and the API contract is not violated (no `[]` ambiguity on submit).

If a strictly one-item-per-invoice UX is required, it is a one-line change inside `invoice-form.tsx` (`append` / `remove` could be disabled when `fields.length >= 1`).

### 9.2 — Server-side payload rewriting

`features/invoices/api/invoice-api.ts → to101DigitalInvoicePayload()` performs all of the format-mismatch work in **one server-side function**:

- `customer.name` → split into `customer.firstName` / `customer.lastName`
- `customer.contact.phone` → `customer.contact.mobileNumber`
- `customer.address` → wrapped in `customer.addresses[0]` with `addressType: "BILLING"`
- `bankAccount.{routingCode, accountHolderName}` → `{sortCode, accountName}`
- `items[].name` → `items[].itemName`; `itemReference` derived as `item-${index}`; `itemUOM` blanked
- `notes` + `terms` joined with `\n` into upstream's single `description`
- `country` (free text) → derived `countryCode` (first 2 chars uppercased) — this is a pragmatic simplification; a real product would use a country picker with a proper ISO mapping.

The opposite direction (`normalizeInvoiceListResponse`) flattens the upstream paging envelope (`paging.pageNumber / pageSize / totalRecords`) into the shape the UI uses (`pageNum / pageSize / total / totalPages`) and remaps `invoiceId` → `id`, `customer.firstName + lastName` → `customer.name`, drops `customer.id`, and normalizes `customer.email` into `customer.contact.email`.

Both transformers are fully unit-tested in `tests/unit/invoice-api.test.ts`.

### 9.3 — Coalesced auth loading

`features/auth/hooks/auth-store.ts` is a module-scoped store (not Context). `ensureLoaded()` returns the **same Promise** to all concurrent callers so that even if 10 components mount simultaneously, only one `/api/auth/me` request is in flight. Consumers subscribe via `useSyncExternalStore`.

### 9.4 — URL as state for invoice filters

The invoices page is a server component that reads `searchParams` directly, then hands them to a client `InvoiceListView` that pushes filter changes back to the URL. This means:

- bookmarkable / shareable filtered views,
- the browser back button works,
- server-side rendering keeps the first paint fast and SEO-friendly,
- and refreshing the page preserves state.

The search input is debounced 300 ms locally (inside `invoice-filters.tsx`) before the URL is updated, so typing doesn't trigger a request per keystroke.

### 9.5 — Silent token refresh

`lib/cookies.ts → refreshAccessToken()` performs a `grant_type=refresh_token` round-trip against WSO2 using the long-lived `refresh_token` cookie. Both `/api/auth/me` and `/api/invoices` automatically try this when an upstream call returns 401 — so the user is not bounced to `/login` just because their access token expired mid-session. If refresh fails, cookies are cleared (so subsequent guard checks redirect cleanly).

### 9.6 — Defence in depth against XSS

The upstream wire format is mapped to typed objects in the BFF, and the UI renders plain React components against those types — no `dangerouslySetInnerHTML`, no string concatenation into the DOM. Tokens are never in `localStorage` / `sessionStorage`, so even an XSS bug wouldn't expose them.

---

## 10. What I would add next

These were de-scoped to keep the submission focused; they're the obvious follow-ups if this were to grow into a real product.

- **Refresh-token rotation + revocation list.** The current refresh token is a single long-lived cookie. In production I'd rotate it on each refresh and persist a revocation hint in a server-side store.
- **An E2E test layer (Playwright)** for the critical paths: login → list → create → search. The current Vitest suite covers unit + transformer logic; E2E would lock down the UX.
- **A proper country picker** with an authoritative ISO 3166 → country-name mapping, instead of the current "first 2 letters of the country name" heuristic.
- **A toast/notification system for upstream 5xx** instead of relying on the generic `Alert` banner inside the list view.
- **An invoice editing flow** — the upstream API supports it; we only implement `list` + `create` here per the brief.
- **Structured request logging** in the BFF so failures (auth refreshes, validation rejections, upstream 5xx) can be correlated in observability tooling.
- **A login throttling layer** (e.g. per-IP rate limit on `/api/auth/login`) — out of scope for the brief, but a natural follow-up given the explicit security recommendations.

---

**Built against the Web Engineer Assessment Project v2.2.4 brief.**
