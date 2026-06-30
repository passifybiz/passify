# Enterprise Readiness — Passify

Honest gap assessment against what a growing company expects, with an
implementation roadmap. Current status is verified against the codebase; nothing
is claimed that does not exist.

## Scorecard

| Capability | Status | Evidence / gap |
|---|---|---|
| **Audit logs** | ✅ Present | `audit_log` table: actor, action, entity, old/new JSONB, IP, timestamp. |
| **API key management** | ✅ Present | Hashed, prefix, revocable, tiered, quota, mint-scoped, last-used. |
| **RBAC** | ⚠️ Basic | 3 roles (`admin`/`compliance`/`viewer`); write gated to admin+compliance. No per-resource or org-scoped roles. |
| **Rate limiting** | ✅ Present | Redis fixed-window, fail-closed in prod. |
| **Session security** | ✅ Present | JWT + revocation list + revoke-all-on-password-change + lockout. |
| **Organizations** | ❌ Missing | Single `accounts` table; no org entity or tenant isolation. |
| **Team management** | ❌ Missing | No invitations, no per-org membership. |
| **Service accounts** | ❌ Missing | API keys are platform-scoped, not tied to a machine identity/owner. |
| **Outbound webhooks** | ❌ Missing | Inbound only. |
| **Usage analytics** | ⚠️ Basic | Dashboard counts + `attestation_reads`; no per-key time series or export. |
| **Billing** | ❌ Missing | Tier/quota fields exist; no payment integration. |
| **Lifecycle (provisioning/deprovisioning)** | ⚠️ Partial | Manual via dashboard; no SCIM/automated offboarding. |
| **Data export** | ❌ Missing | No export of audit/attestation/usage data. |
| **Admin capabilities** | ⚠️ Partial | Dashboard admin role; no cross-org admin/support tooling. |
| **SSO / SAML / SCIM** | ❌ Missing | Email+password only. |

## Implementation roadmap (phased)

### Phase 1 — Make it multi-user (foundation)
1. **Organizations & membership.** `organizations`, `org_members(role)`; scope
   API keys, mint configs, and audit entries to an org. Migrate existing
   single accounts into a default org behind a flag.
2. **Invitations & team management.** Email invite → role assignment → revoke.
3. **Org-scoped RBAC.** Extend the existing 3-role model to be per-org; add a
   read-only `billing` viewer if needed.

*Why first:* every other enterprise capability (billing, SSO, analytics) assumes
a tenant boundary. This is the unlock.

### Phase 2 — Monetization & visibility
4. **Self-serve billing** (Stripe): plan→quota mapping, invoices, overage policy.
   Depends on orgs + usage analytics.
5. **Usage analytics & rate-limit headers.** Per-key/per-org time series from the
   data already captured.
6. **Data export.** Audit log + attestations + usage as CSV/JSON; documented
   retention.

### Phase 3 — Enterprise integration
7. **Outbound webhooks** (also a core DX item) with signed payloads + delivery log.
8. **Service accounts** — machine identities owning keys, with rotation policy.
9. **SSO (SAML/OIDC)** and eventually **SCIM** for provisioning. Highest-effort;
   only after demonstrated enterprise demand.

## Honesty guardrails for sales/marketing
Until shipped, the site must **not** imply: organizations, SSO, SCIM, billing,
outbound webhooks, contractual uptime, or certifications (SOC 2, ISO). The
current enterprise page already hedges correctly ("SLA terms available",
"deployable in your VPC") — keep that discipline. Add capabilities to the page
only as they ship.

## What "enterprise-ready" realistically requires here
The shortest credible path is **Phase 1 (orgs/teams) + Phase 2 (billing,
analytics, export) + outbound webhooks**. SSO/SCIM and SOC 2 are real, expensive
commitments to make only when a concrete enterprise opportunity justifies them —
and SOC 2 in particular should never be claimed before an actual audit.
