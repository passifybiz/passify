<div align="center">

# Passify

**Identity Proven. Assets Unlocked.**

API-first identity and compliance layer for Solana real-world-asset (RWA)
platforms. Verify an investor once; every platform reads the same on-chain
attestation. No PII on-chain, no contract redeploys.

[![CI](https://github.com/passifybiz/passify/actions/workflows/ci.yml/badge.svg)](https://github.com/passifybiz/passify/actions/workflows/ci.yml)
[![CodeQL](https://github.com/passifybiz/passify/actions/workflows/codeql.yml/badge.svg)](https://github.com/passifybiz/passify/actions/workflows/codeql.yml)
[![License: FSL-1.1-Apache-2.0](https://img.shields.io/badge/License-FSL--1.1--Apache--2.0-blue.svg)](./LICENSE.md)

[Website](https://passify.biz) ·
[Documentation](https://passify.biz/docs) ·
[API reference](https://passify.biz/api/openapi) ·
[Roadmap](./ROADMAP.md)

</div>

---

## Overview

Tokenized real-world assets on Solana must enforce who is allowed to hold and
transfer them. Today that logic is rebuilt per platform, couples compliance
rules to smart contracts, and risks putting personal data on-chain.

Passify separates **identity** from **assets**:

- An investor completes verification **once** through a KYC provider.
- Passify issues an **on-chain attestation** — a hash, public key, and metadata.
  No personal data is written on-chain.
- Any platform reads that attestation and **gates mint/transfer** against
  configurable compliance rules, without redeploying its program.

The result: verify once, access any compliant tokenized asset.

### Highlights

- **API-first.** Every capability is a documented REST endpoint
  (OpenAPI 3.1, see [`openapi.yaml`](./openapi.yaml)).
- **No PII on-chain.** Attestations store hashes, public keys, and metadata only.
- **Compliance without redeploys.** Rules are data, not contract code.
- **Runs locally in one command.** SQLite + in-memory cache fallback, auto-seeded.
- **Typed SDK.** First-class TypeScript client in [`packages/sdk`](./packages/sdk).


## Architecture

```
                ┌──────────────┐
   Investor ───▶│  KYC provider │  (verification happens once, off-platform)
                └──────┬───────┘
                       │ result (no PII leaves the provider boundary)
                       ▼
   Platform  ────▶  Passify API  ────▶  On-chain attestation
   (your app)       │  - identity     (hash + pubkey + metadata, no PII)
                    │  - compliance rules (data, not contract code)
                    │  - mint / transfer gating (returns unsigned tx)
                    ▼
              Audit log + usage
```

- **Identity** is verified once and represented as a portable attestation.
- **Compliance rules** are stored as data and evaluated per request, so a
  platform changes its policy without redeploying its Solana program.
- **Mint and transfer** endpoints return **unsigned** transactions; signing
  stays with the platform's wallet. Passify never holds platform keys.

## Quickstart

Prerequisites: **Node.js 22+**. Docker is optional — without it, Passify falls
back to SQLite and an in-memory cache.

```bash
git clone https://github.com/passifybiz/passify.git
cd passify
cp .env.example .env
npm install
npm run dev
```

The dev server starts on `http://localhost:3000` with a seeded SQLite database.
Open the dashboard, create an API key, and call the API:

```bash
curl http://localhost:3000/api/v1/health
```

To run against Postgres and Redis instead of the local fallbacks:

```bash
docker compose up -d
npm run db:migrate:apply
npm run db:seed
npm run dev
```


## Configuration

Configuration is via environment variables (copy `.env.example` to `.env`). The
defaults run a fully working experience in **mock** mode with no external keys.

| Variable | Required | Description |
| --- | --- | --- |
| `PROVIDER` | — | `mock` (default) for a full local UX with no keys, or `real` to wire live providers. |
| `DATABASE_URL` | real/prod | Postgres connection string. Falls back to local SQLite when unset. |
| `REDIS_URL` | real/prod | Redis connection string. Falls back to an in-memory cache when unset. |
| `SESSION_SECRET` | yes | Long random string used to sign dashboard session JWTs. |
| `APP_URL` | — | Public base URL of the app. |
| `HELIUS_API_KEY` | `PROVIDER=real` | Solana RPC / DAS access. |
| `BLOCKPASS_CLIENT_ID` / `BLOCKPASS_API_KEY` / `BLOCKPASS_WEBHOOK_SECRET` | `PROVIDER=real` | KYC provider credentials. |
| `ATTESTER_KEYPAIR_BASE58` | `PROVIDER=real` | Base58 attester keypair. **Never commit a real value.** |
| `ATTESTATION_PROGRAM_ID` | `PROVIDER=real` | On-chain attestation program id. |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | optional | Error tracking. |

Mock mode requires no keys or SOL and exercises the full verify → gate flow. See
[`SECURITY.md`](./SECURITY.md) for how secrets are handled.

## API

The full contract is published as OpenAPI 3.1 at
[`openapi.yaml`](./openapi.yaml) and served at
`https://passify.biz/api/openapi`. Core endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/kyc/start` | Begin a verification session for an investor. |
| `GET` | `/api/v1/kyc/status/{pubkey}` | Check verification status. |
| `GET` | `/api/v1/attestation/{id}` | Read an issued attestation. |
| `POST` | `/api/v1/token/mint` | Build a compliance-checked, **unsigned** mint transaction. |
| `POST` | `/api/v1/token/transfer` | Build a compliance-checked, **unsigned** transfer transaction. |
| `GET` | `/api/v1/health` | Service health check. |

Authentication uses an API key (`Authorization: Bearer passify_…`). Keys are
created in the dashboard, shown once, scoped, and revocable.


## TypeScript SDK

A typed client lives in [`packages/sdk`](./packages/sdk) and tracks the OpenAPI
contract. It is part of this monorepo and is not yet published to npm; build it
locally or consume it from source.

```ts
import { Passify } from "@passify/sdk";

const passify = new Passify({ apiKey: process.env.PASSIFY_API_KEY! });

const { sessionUrl } = await passify.kyc.start({
  userPubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  schemaId: "kyc_individual_v1",
});

const status = await passify.kyc.status("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
if (status.status === "verified") {
  const { unsignedTransactionBase64 } = await passify.token.mint({
    userPubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintConfig: "us_real_estate_fund_v1",
    amount: 1000,
  });
}
```

See [`packages/sdk/README.md`](./packages/sdk/README.md) for the full API,
options, and error handling.

## Project structure

```
.
├── src/                 # Next.js app, API routes, dashboard, and lib
│   ├── app/             #   routes (UI + /api/v1)
│   ├── lib/             #   auth, providers, validation, errors, cache
│   └── __tests__/       #   vitest suites
├── packages/sdk/        # @passify/sdk — typed TypeScript client
├── drizzle/             # schema, migrations, and seeds (Postgres + SQLite)
├── openapi.yaml         # generated OpenAPI 3.1 contract
└── docker-compose.yml   # optional Postgres + Redis
```

## Development

```bash
npm run dev          # start the dev server (SQLite fallback)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:generate  # generate a migration from schema changes
npm run db:studio    # open Drizzle Studio
npm run openapi:gen  # regenerate openapi.yaml from the route definitions
```

## Testing

```bash
npm test             # run the vitest suite once
npm run test:watch   # watch mode
```

Tests live in `src/__tests__/`. Add or update tests for any behavior you change;
CI runs lint, typecheck, tests, build, and a dependency audit on every push and
pull request to `main`.


## Security

Passify stores no end-user PII on-chain and follows defensive defaults
(hashed credentials, scoped API keys, fail-closed rate limiting, strict
transport headers). To report a vulnerability, see [`SECURITY.md`](./SECURITY.md).
Do not open public issues for security reports.

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for
setup, coding standards, and the pull-request process, and our
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Changes are tracked in
[`CHANGELOG.md`](./CHANGELOG.md).

## Support

Documentation is at [passify.biz/docs](https://passify.biz/docs). For questions
and integration help, see [`SUPPORT.md`](./SUPPORT.md) and GitHub Discussions.

## License

Passify is source-available under the **Functional Source License**
(FSL-1.1-Apache-2.0). You may use, modify, and redistribute the software for any
purpose except a competing commercial product; the license converts to
Apache-2.0 two years after each release. See [`LICENSE.md`](./LICENSE.md).
