# @passify/sdk

Official TypeScript SDK for the [Passify](https://passify.biz) identity &
compliance API for Solana real-world-asset platforms.

- **Type-safe** — typed inputs/outputs mirroring the OpenAPI 3.1 contract.
- **Zero dependencies** — uses the platform `fetch`. Works in Node 18+ and browsers.
- **Resilient** — automatic retries with exponential backoff on `429`/`5xx`,
  `Retry-After` aware, per-request timeout.
- **Ergonomic** — camelCase everywhere; the SDK maps to the API wire format.
- **Tree-shakeable** — ESM, `sideEffects: false`.

## Install

```bash
npm install @passify/sdk
```

## Usage

```ts
import { Passify } from "@passify/sdk";

const passify = new Passify({ apiKey: process.env.PASSIFY_API_KEY! });

// 1. Start a verification session
const { sessionUrl } = await passify.kyc.start({
  userPubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  schemaId: "kyc_individual_v1",
});
// → redirect the investor to sessionUrl

// 2. Check status later
const status = await passify.kyc.status("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
if (status.status === "verified") {
  // 3. Build a compliance-checked mint (unsigned tx)
  const { unsignedTransactionBase64 } = await passify.token.mint({
    userPubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintConfig: "us_real_estate_fund_v1",
    amount: 1000,
  });
  // sign + submit unsignedTransactionBase64 with your wallet
}
```

## Error handling

Every non-2xx response throws a typed `PassifyError`:

```ts
import { PassifyError } from "@passify/sdk";

try {
  await passify.token.transfer({ mintConfig, sender, recipient, amount });
} catch (err) {
  if (err instanceof PassifyError) {
    console.error(err.status, err.code, err.detail, err.requestId);
    if (err.isAuthError) { /* 401/403 */ }
    if (err.isRateLimited) { /* 429 */ }
  }
}
```

## Options

```ts
new Passify({
  apiKey: "passify_live_...",   // required
  baseUrl: "https://passify.biz/api/v1", // override if needed
  maxRetries: 2,                 // retries on 429/5xx
  retryBaseMs: 300,              // exponential backoff base
  timeoutMs: 30000,              // per-request timeout
  fetch: customFetch,            // custom fetch (tests/edge runtimes)
});
```

## API

| Method | Endpoint |
|---|---|
| `passify.kyc.start({ userPubkey, schemaId })` | `POST /kyc/start` |
| `passify.kyc.status(pubkey)` | `GET /kyc/status/{pubkey}` |
| `passify.attestations.get(id)` | `GET /attestation/{id}` |
| `passify.token.mint({ userPubkey, mintConfig, amount })` | `POST /token/mint` |
| `passify.token.transfer({ mintConfig, sender, recipient, amount })` | `POST /token/transfer` |
| `passify.health()` | `GET /health` |

The SDK tracks the OpenAPI specification published at
`https://passify.biz/api/openapi` (and `openapi.yaml` in the repo).

## Build

```bash
npm run build   # emits dist/ with .js + .d.ts
```
