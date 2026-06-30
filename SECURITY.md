# Security Policy

Passify is an identity and compliance layer. Security is a core requirement, not
a feature. We appreciate the work of security researchers and the broader
community in keeping the platform and its users safe.

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do **not** open a public
issue, pull request, or discussion for a security report.

- **Email:** security@passify.biz
- **GitHub:** use **Security → Report a vulnerability** on this repository to
  open a private advisory (GitHub Private Vulnerability Reporting).

Please include, where possible:

- a description of the issue and its impact;
- steps to reproduce or a proof of concept;
- affected versions, endpoints, or components;
- any relevant logs, requests, or configuration (redact secrets).

If you need to send sensitive material, ask in your initial email and we will
provide an encrypted channel.

## What to expect

- **Acknowledgement:** within 3 business days.
- **Triage and initial assessment:** within 10 business days.
- **Resolution:** prioritized by severity. We will keep you informed of progress
  and coordinate a disclosure timeline with you.

We support coordinated disclosure. We ask that you give us a reasonable
opportunity to remediate before any public disclosure, and we will credit you in
the advisory if you wish.

## Safe harbor

We will not pursue or support legal action against researchers who:

- act in good faith and avoid privacy violations, data destruction, and service
  degradation;
- only interact with accounts they own or have explicit permission to test;
- give us a reasonable time to remediate before public disclosure.

We do not currently operate a paid bug-bounty program. This may change, and any
such program will be announced here.

## Scope

In scope:

- this repository and the Passify API surface documented in `openapi.yaml`;
- the published `@passify/sdk` package.

Out of scope:

- third-party services and dependencies (report those to their maintainers);
- findings that require physical access, social engineering, or a compromised
  end-user device;
- volumetric denial-of-service testing.

## Supported versions

Passify is delivered as a continuously deployed service plus a versioned SDK.
Security fixes are applied to the latest released SDK minor version and the
running service. Older SDK majors are supported on a best-effort basis.

| Component        | Supported            |
| ---------------- | -------------------- |
| Passify service  | Current release      |
| `@passify/sdk`   | Latest minor         |

## Security posture (summary)

The following controls are implemented in this codebase and verifiable in
source. This summary is informational and not a guarantee.

- **Credentials:** passwords hashed with bcrypt; API keys hashed at rest
  (SHA-256), shown once, prefixed, scoped, and revocable.
- **Sessions:** JWT (HS256) with `HttpOnly`, `Secure`, `SameSite=Strict`
  cookies; server-side revocation and revoke-all-on-password-change.
- **Abuse controls:** login lockout, Redis fixed-window rate limiting that fails
  closed in production.
- **Transport:** CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and `Permissions-Policy` enforced in middleware.
- **Data minimization:** no end-user PII is stored on-chain; attestations carry
  hashes, public keys, and metadata only.
- **Input handling:** centralized validation, request-body size limits, and
  parameterized queries via the ORM.

For the public roadmap of platform capabilities, see `ROADMAP.md`.
