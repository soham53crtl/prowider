# Prowider — Mini Lead Distribution System

A full-stack Next.js application implementing a real-time lead generation and fair distribution system.

## Live Demo
> Add your deployed URL here after deployment

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL via Prisma ORM
- **Real-time**: Server-Sent Events (SSE)

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use Neon / Supabase)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd prowider
npm install
```

### 2. Configure environment
```bash
# Create .env and set your DATABASE_URL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/prowider"
```

### 3. Push schema + seed
```bash
npx prisma db push
npx prisma db seed
```

### 4. Start
```bash
npm run dev
# http://localhost:3000
```

---

## Pages
| Route | Description |
|---|---|
| `/` | Home |
| `/request-service` | Customer lead form |
| `/dashboard` | Real-time provider dashboard |
| `/test-tools` | Webhook + concurrency tests |

---

## Allocation Algorithm

### Mandatory Rules
| Service | Mandatory Providers |
|---|---|
| Service 1 | Provider 1 |
| Service 2 | Provider 5 |
| Service 3 | Provider 1, Provider 4 |

### Fair Pool (Persistent Round-Robin)
| Service | Pool |
|---|---|
| Service 1 | Providers 2, 3, 4 |
| Service 2 | Providers 6, 7, 8 |
| Service 3 | Providers 2, 3, 5, 6, 7, 8 |

`AllocationState` table stores `nextIndex` per service — persists across restarts.

---

## Concurrency
`assignProvidersToLead()` runs inside a **Serializable Prisma transaction** with `SELECT ... FOR UPDATE` on the `AllocationState` row. Concurrent leads queue at DB level — no double quota counting.

---

## Webhook Idempotency
`POST /api/webhook` with `{ eventId, action: "reset_quota" }`:
1. Check `WebhookEvent` table for `eventId`
2. If exists → return `alreadyProcessed: true`
3. If not → insert eventId + reset quotas atomically in one transaction

Calling 5× with same `eventId` resets quota exactly once.

---

## Duplicate Lead Rule
`Lead` table has `@@unique([phone, serviceId])` — enforced at DB level. Same phone + same service returns `409 Conflict`.

---

## Deployment (Vercel + Neon)
1. Push to GitHub
2. Create PostgreSQL on [Neon](https://neon.tech)
3. Add `DATABASE_URL` to Vercel env
4. Build command: `npx prisma generate && npx prisma migrate deploy && npx prisma db seed`

> For multi-instance SSE, replace `lib/sse.ts` broadcaster with Redis pub/sub (Upstash).
