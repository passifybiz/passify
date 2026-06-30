import { errorFromResponse, PassifyError } from "./errors";
import type {
  Attestation,
  HealthResult,
  KycStatusResult,
  MintParams,
  MintResult,
  PassifyOptions,
  StartKycParams,
  StartKycResult,
  TransferParams,
  TransferResult,
} from "./types";

const DEFAULT_BASE_URL = "https://passify.biz/api/v1";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The official Passify SDK client. Dependency-free; works in Node 18+ and
 * modern browsers via the global `fetch`. Tree-shakeable ESM.
 *
 * ```ts
 * const passify = new Passify({ apiKey: process.env.PASSIFY_API_KEY! });
 * const { sessionUrl } = await passify.kyc.start({ userPubkey, schemaId: "kyc_individual_v1" });
 * ```
 */
export class Passify {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly timeoutMs: number;

  constructor(options: PassifyOptions) {
    if (!options?.apiKey) throw new Error("Passify: `apiKey` is required.");
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const f = options.fetch ?? globalThis.fetch;
    if (!f) throw new Error("Passify: no `fetch` available; pass `fetch` in options.");
    this.fetchImpl = f;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryBaseMs = options.retryBaseMs ?? 300;
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  // ── KYC ────────────────────────────────────────────────────
  readonly kyc = {
    start: (params: StartKycParams, opts?: { idempotencyKey?: string }): Promise<StartKycResult> =>
      this.request("POST", "/kyc/start", {
        body: { userPubkey: params.userPubkey, schemaId: params.schemaId },
        idempotencyKey: opts?.idempotencyKey,
        map: (r: { session_id: string; session_url: string }) => ({
          sessionId: r.session_id,
          sessionUrl: r.session_url,
        }),
        auth: true,
      }),

    status: (pubkey: string): Promise<KycStatusResult> =>
      this.request("GET", `/kyc/status/${encodeURIComponent(pubkey)}`, {
        auth: true,
        map: (r: Record<string, string>) => ({
          status: r.status as KycStatusResult["status"],
          attestationId: r.attestation_id,
          schema: r.schema as KycStatusResult["schema"],
          expiresAt: r.expires_at,
          onchainTx: r.onchain_tx,
          issuedByPlatform: r.issued_by_platform,
        }),
      }),
  };

  // ── Attestations ───────────────────────────────────────────
  readonly attestations = {
    get: (id: string): Promise<Attestation> =>
      this.request("GET", `/attestation/${encodeURIComponent(id)}`, {
        auth: true,
        map: (r: Record<string, string>) => ({
          attestationId: r.attestation_id,
          schema: r.schema as Attestation["schema"],
          userPubkey: r.user_pubkey,
          status: r.status as Attestation["status"],
          issuedAt: r.issued_at,
          expiresAt: r.expires_at,
          onchainTx: r.onchain_tx,
          dataHash: r.data_hash,
        }),
      }),
  };

  // ── Token ──────────────────────────────────────────────────
  readonly token = {
    mint: (params: MintParams, opts?: { idempotencyKey?: string }): Promise<MintResult> =>
      this.request("POST", "/token/mint", {
        auth: true,
        idempotencyKey: opts?.idempotencyKey,
        body: { user_pubkey: params.userPubkey, mint_config: params.mintConfig, amount: params.amount },
        map: (r: { status: string; unsigned_transaction_base64: string; mint: string; amount: number }) => ({
          status: r.status,
          unsignedTransactionBase64: r.unsigned_transaction_base64,
          mint: r.mint,
          amount: r.amount,
        }),
      }),

    transfer: (params: TransferParams, opts?: { idempotencyKey?: string }): Promise<TransferResult> =>
      this.request("POST", "/token/transfer", {
        auth: true,
        idempotencyKey: opts?.idempotencyKey,
        body: { mint_config: params.mintConfig, sender: params.sender, recipient: params.recipient, amount: params.amount },
        map: (r: { status: string; unsigned_transaction_base64: string }) => ({
          status: r.status,
          unsignedTransactionBase64: r.unsigned_transaction_base64,
        }),
      }),
  };

  // ── System ─────────────────────────────────────────────────
  health(): Promise<HealthResult> {
    return this.request("GET", "/health", {
      auth: false,
      map: (r: Record<string, unknown>) => ({
        status: r.status as HealthResult["status"],
        version: String(r.version),
        uptime: Number(r.uptime),
        latencyMs: Number(r.latency_ms),
        timestamp: String(r.timestamp),
        checks: (r.checks ?? {}) as Record<string, string>,
      }),
    });
  }

  // ── Core transport ─────────────────────────────────────────
  private async request<TWire, TOut>(
    method: string,
    path: string,
    opts: { body?: unknown; map: (wire: TWire) => TOut; auth: boolean; idempotencyKey?: string },
  ): Promise<TOut> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (opts.auth) headers.Authorization = `Bearer ${this.apiKey}`;
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

    let attempt = 0;
    // total tries = 1 + maxRetries
    for (;;) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      let res: Response;
      try {
        res = await this.fetchImpl(url, {
          method,
          headers,
          body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        // Network/abort errors are retryable.
        if (attempt < this.maxRetries) {
          await sleep(this.backoff(attempt));
          attempt++;
          continue;
        }
        throw new PassifyError(0, "network_error", err instanceof Error ? err.message : String(err));
      }
      clearTimeout(timer);

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as TWire;
        return opts.map(json);
      }

      // Retry on 429 and 5xx.
      if ((res.status === 429 || res.status >= 500) && attempt < this.maxRetries) {
        await sleep(this.retryAfter(res) ?? this.backoff(attempt));
        attempt++;
        continue;
      }

      const body = await res.json().catch(() => ({}));
      throw errorFromResponse(res.status, body);
    }
  }

  private backoff(attempt: number): number {
    // Exponential with jitter.
    const base = this.retryBaseMs * 2 ** attempt;
    return base + Math.floor(Math.random() * this.retryBaseMs);
  }

  private retryAfter(res: Response): number | null {
    const h = res.headers.get("retry-after");
    if (!h) return null;
    const secs = Number(h);
    return Number.isFinite(secs) ? secs * 1000 : null;
  }
}
