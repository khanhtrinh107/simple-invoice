# SimpleInvoice

A Next.js application for creating and managing invoices against the 101 Digital identity, membership, and invoice services.

## Getting Started

Copy `.env.example` to `.env.local` and fill in real values, then run the development server:

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Required Environment Variables

All variables below are read **server-side only** (no `NEXT_PUBLIC_` prefix) and must be defined in `.env.local` (git-ignored). See `.env.example` for placeholder values.

| Variable | Purpose |
| --- | --- |
| `AUTH_CLIENT_ID` | OAuth2 client id for the 101 Digital identity server. |
| `AUTH_CLIENT_SECRET` | OAuth2 client secret. Server-only — never bundled to the client. |
| `AUTH_API_URL` | Full URL of the WSO2 `/oauth2/token` endpoint. |
| `MEMBERSHIP_API_URL` | Base URL of the membership service (used for `/users/me`). |
| `INVOICE_API_URL` | Base URL of the invoice service. |

## Documentation

- [Next.js Documentation](https://nextjs.org/docs) — Next.js features and API reference.
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying) — deployment guides.

## Security Notes

- Real credentials must never be committed. Use `.env.local` (git-ignored) and reference `.env.example` for the contract.
- Authentication tokens are stored exclusively in `httpOnly`, `Secure`, `SameSite=Strict` cookies set by server route handlers — they are never exposed to the browser bundle.
- All upstream service calls (token exchange, `/users/me`, `/invoices`) are proxied through Next.js route handlers (`app/api/**`) so access tokens never leave the server.
