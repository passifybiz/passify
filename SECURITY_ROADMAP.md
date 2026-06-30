# Security Roadmap — Passify

Current posture verified in code, then a prioritized hardening roadmap. The
foundation is genuinely solid; most items below are maturity/process, not
fixes for broken security.

## Current posture (verified)

| Area | Status |
|---|---|
| Password storage | ✅ bcrypt (`lib/auth/password.ts`). |
| Sessions | ✅ JWT (HS256, 7d), httpOnly + `Secure` + `SameSite=strict`; revocation via `jti` + `revoke-after` timestamp. |
| Brute-force protection | ✅ Lockout after 10 failed logins / 15 min; security-event logging. |
| Authorization | ✅ Role gate (`admin`/`compliance` write, `viewer` read) on dashboard + write APIs. |
| API key handling | ✅ SHA-256 hashed at rest, shown once, prefix-identified, revocable, scoped. |
| Rate limiting | ✅ Redis fixed-window, **fail-closed in production**. |
| Webhook auth (inbound) | ✅ HMAC verification in real mode. |
| Transport / headers | ✅ CSP, HSTS (prod), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` in middleware. |
| Input validation | ✅ Centralized validation + body-size limits; parameterized queries via Drizzle. |
| PII exposure | ✅ Architecture stores no PII (hash + pubkey + metadata only). |
| Error hygiene | ✅ Single error shape, request IDs, structured logging; no Sentry/secret leakage. |

## Gaps & prioritized roadmap

### P0 — Process & disclosure (cheap, high trust)
1. **Responsible disclosure policy** + `SECURITY.md` + `/.well-known/security.txt`
   with a real `security@` contact (the address already exists). No bug-bounty
   payout commitment unless funded.
2. **Dependency management:** enable Dependabot/`npm audit` in CI; pin and review
   updates. (CI exists; add the audit step.)
3. **Documented incident-response runbook** (who, how to revoke keys/sessions,
   how to rotate the attester key and `SESSION_SECRET`).

### P1 — Auth/key hardening
4. **API key rotation & expiry** — support overlapping keys and a rotation flow
   (schema already has prefix + active flag; add `expires_at` + rotation UX).
5. **MFA / TOTP** for dashboard accounts (compliance staff are high-value targets).
6. **Atomic lockout counter** — current failed-login counter is explicitly
   non-atomic; move to a Redis `INCR`-based counter to avoid race-window bypass.
7. **Idempotency + replay protection** on write endpoints (also a DX item).

### P2 — Monitoring & detection
8. **Security monitoring/alerting** on the security events already emitted
   (lockouts, key revocations, anomalous usage). Wire to an alerting channel.
9. **Audit log integrity** — consider append-only/hash-chained audit entries for
   tamper-evidence (high-trust for compliance customers).
10. **Per-key anomaly detection** (sudden quota spikes) using existing usage data.

### P3 — Formal & on-chain
11. **Threat model document** (STRIDE) covering: stolen API key, webhook spoofing,
    attester key compromise, session theft, replay, and quota bypass — with the
    mitigation already in place vs. planned.
12. **Smart-contract security:** before claiming a production on-chain write path,
    deploy a canonical attestation program and obtain an **external audit**. Treat
    the attester keypair as the crown-jewel secret (HSM/KMS custody, rotation).
13. **Third-party penetration test** ahead of any enterprise commitment.
14. **SOC 2 Type II** — only when a concrete enterprise deal justifies the cost;
    never claimed before the audit completes.

## Secrets management note
Today secrets come from environment variables (`SESSION_SECRET`,
`ATTESTER_KEYPAIR_BASE58`, provider keys). For production maturity, move to a
managed secret store (e.g. cloud KMS/Secrets Manager) with rotation, and ensure
the attester keypair is never co-located with application config.

## Principle
The existing posture is honest and above-average for the stage. The roadmap is
about **process maturity, key lifecycle, monitoring, and on-chain/audit rigor** —
not patching holes. Ship P0 immediately (it is mostly documentation + a CI step).
