# Passify

Identity Proven. Assets Unlocked.

API-first identity and compliance layer for Solana RWA platforms. Verify once, access any tokenized asset.

## Quick start

```bash
# Copy environment
cp .env.example .env

# Start infra (Postgres + Redis)
docker compose up -d

# Install deps
npm install

# Run migrations
npm run db:migrate:apply

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

For local dev without Docker, just run `npm run dev` — it falls back to SQLite (`passify-dev.db`) and in-memory Redis, seeded automatically on first start.

## Environment

| Variable | Required | Default | Description |
|---|---|---|---|
| `PROVIDER` | no | `mock` | `mock` or `real` |
| `DATABASE_URL` | no | SQLite | Postgres connection string |
| `REDIS_URL` | no | in-memory | Redis connection string |
| `SESSION_SECRET` | **yes** | — | JWT signing key (≥16 chars) |
| `HELIUS_API_KEY` | if real | — | Helius RPC key |
| `BLOCKPASS_CLIENT_ID` | if real | — | Blockpass client ID |
| `BLOCKPASS_WEBHOOK_SECRET` | if real | — | Blockpass HMAC secret |
| `ATTESTER_KEYPAIR_BASE58` | if real | — | Solana attester keypair |
| `ATTESTATION_PROGRAM_ID` | if real | — | Deployed attestation program |

## Scripts

```bash
npm run dev          # Next.js dev server (SQLite fallback)
npm run build        # Production build
npm start            # Start production server
npm test             # Run tests (vitest)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Push schema to Postgres (dev)
npm run db:migrate:apply  # Apply migration files to Postgres
npm run db:seed      # Seed demo data (Postgres)
```

## Architecture

```
src/
├── app/
│   ├── api/              # REST API routes
│   │   ├── auth/         # login, logout, password
│   │   ├── kyc/          # start, status, webhook
│   │   ├── token/        # mint, transfer
│   │   ├── attestation/  # read attestation
│   │   ├── keys/         # manage API keys
│   │   ├── rules/        # compliance rules
│   │   └── health/       # service health
│   ├── dashboard/        # protected dashboard pages
│   ├── kyc/              # KYC verification UI
│   ├── rules/            # compliance rules UI
│   ├── keys/             # API key management UI
│   └── attestation/      # attestation detail view
├── components/           # design system primitives
├── lib/
│   ├── auth/             # session, password, API key auth
│   ├── db/               # database client, schema, redis
│   ├── providers/        # KYC, attestation, token services
│   ├── schemas/          # attestation schema registry
│   └── ...               # validation, cache, logger, errors
└── middleware.ts         # auth guard + security headers
```

## API

All public API routes require an API key via `Authorization: Bearer <key>`.

### KYC

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/kyc/start` | Start KYC verification |
| `GET` | `/api/kyc/status/:pubkey` | Get attestation status |
| `POST` | `/api/kyc/webhook` | KYC provider callback |

### Token

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/token/mint` | Build mint transaction (compliance checked) |
| `POST` | `/api/token/transfer` | Build transfer transaction (compliance checked) |

### Attestation

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/attestation/:id` | Get attestation details |

## Development

```bash
# Run tests in watch mode
npm run test:watch

# Open Drizzle Studio (Postgres)
npm run db:studio
```

## Limitations

- The Solana attestation program is assumed pre-deployed. Without a confirmed program ID, the real attestation WRITE path (`PROVIDER=real`) is best-effort. Mock mode (`PROVIDER=mock`) gives the full working UX.
- Postgres migrations are SQL files in `drizzle/migrations/`. For development, `npm run db:migrate` pushes the schema directly via Drizzle Kit.
