# Alpha Hub

Alpha School enrollment hub — a unified Next.js 16 app serving:

- `/` — Marketing landing page (letter to Toronto parents)
- `/v1` — Parent stories with interactive filters and modals
- `/hub/...` — Enrollment dashboard for champions and admins
- `/[geography]` — Public intake forms per geography

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values for Supabase, Clerk, Resend, Turnstile, and Upstash.

## Deployment

Deployed to Vercel as a single project. Push to `main` to deploy.
