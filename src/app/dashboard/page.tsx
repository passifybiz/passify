import Link from "next/link";
import { db } from "@/lib/db/client";
import { attestations, kycSessions, auditLog, apiKeys, attestationReads } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { formatShortTime, formatNumber, formatPercent, truncateMiddle } from "@/lib/format";

const PAGE_SIZE = 20;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Parallel stat queries
  const [statsResult, activityRows] = await Promise.all([
    Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(attestations),
      db.select({ count: sql<number>`count(*)` }).from(apiKeys),
      db.select({ count: sql<number>`count(*)` }).from(attestationReads),
    ]),
    db.select({ ts: auditLog.createdAt, action: auditLog.action, entityType: auditLog.entityType, entityId: auditLog.entityId })
      .from(auditLog)
      .orderBy(sql`${auditLog.createdAt} desc`)
      .limit(PAGE_SIZE + 1)
      .offset(offset),
  ]) as [{ count: number }[][], { ts: string; action: string; entityType: string; entityId: string }[]];

  const totalAttestations = Number(statsResult[0][0]?.count ?? 0);
  const activeKeys = Number(statsResult[1][0]?.count ?? 0);
  const totalReads = Number(statsResult[2][0]?.count ?? 0);
  const reuseRate = totalAttestations > 0 ? totalReads / totalAttestations : 0;

  const hasNext = activityRows.length > PAGE_SIZE;
  const pageRows = activityRows.slice(0, PAGE_SIZE);

  // Per-key usage (real data) for the usage table.
  const keyUsage = (await db
    .select({
      platformName: apiKeys.platformName,
      keyPrefix: apiKeys.keyPrefix,
      tier: apiKeys.tier,
      currentUsage: apiKeys.currentUsage,
      monthlyLimit: apiKeys.monthlyLimit,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .orderBy(sql`${apiKeys.createdAt} desc`)
    .limit(50)) as {
    platformName: string;
    keyPrefix: string;
    tier: string;
    currentUsage: number;
    monthlyLimit: number;
    isActive: boolean;
    lastUsedAt: string | null;
  }[];

  type Row = { ts: Date | string; type: string; user: string | null; status: string; statusTone: "success" | "warning" | "muted" };
  const rows: Row[] = pageRows.map((a) => {
    const label = a.action === "rule_updated" ? "Rule Update"
      : a.action === "attestation_issued" ? "Attestation Issued"
      : a.action === "kyc_started" ? "KYC Started"
      : a.action === "api_key_created" ? "Key Created"
      : a.action;
    const tone: Row["statusTone"] = a.action.includes("issued") ? "success" : a.action.includes("started") ? "warning" : "muted";
    return { ts: a.ts, type: label, user: null, status: tone === "success" ? "Verified" : tone === "warning" ? "Pending" : "Updated", statusTone: tone };
  });

  // If no audit log rows, check if we have any attestations at all (fresh install)
  const isEmpty = totalAttestations === 0 && activeKeys === 0 && rows.length === 0;

  return (
    <div className="container">
      <div className="row row--between mb-6">
        <h2 className="h2" style={{ margin: 0 }}>Overview</h2>
        {!isEmpty && (
          <a href="/api/dashboard/export" className="btn btn--outline btn--sm">Export activity (CSV)</a>
        )}
      </div>

      {isEmpty && (
        <div className="card card--pad mb-6" style={{ borderLeft: "3px solid var(--primary)" }}>
          <h3 className="h5" style={{ marginBottom: "12px" }}>Getting started</h3>
          <p className="help-text" style={{ marginBottom: "16px", maxWidth: "52ch" }}>
            Three steps to your first portable attestation. You can complete them in any order — most teams start with an API key.
          </p>
          <div className="stack" style={{ gap: "8px" }}>
            <div className="row" style={{ gap: "8px", fontSize: "14px" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: activeKeys > 0 ? "var(--success)" : "var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", flexShrink: 0 }}>{activeKeys > 0 ? "✓" : "1"}</span>
              <span><Link href="/keys" style={{ fontWeight: 600 }}>Create an API key</Link> — needed for platform integrations</span>
            </div>
            <div className="row" style={{ gap: "8px", fontSize: "14px" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: totalAttestations > 0 ? "var(--success)" : "var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", flexShrink: 0 }}>{totalAttestations > 0 ? "✓" : "2"}</span>
              <span><Link href="/kyc" style={{ fontWeight: 600 }}>Verify an investor</Link> — test the KYC flow end-to-end</span>
            </div>
            <div className="row" style={{ gap: "8px", fontSize: "14px" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", flexShrink: 0 }}>3</span>
              <span><Link href="/docs" style={{ fontWeight: 600 }}>Integrate the API</Link> — call /kyc/start from your platform</span>
            </div>
          </div>
        </div>
      )}

      <div className="stats mb-6">
        <div className="card card--pad" style={{ textAlign: "center" }}>
          <div className="stat__value">{formatNumber(totalAttestations)}</div>
          <div className="stat__label">Attestations</div>
        </div>
        <div className="card card--pad" style={{ textAlign: "center" }}>
          <div className="stat__value">{formatNumber(activeKeys)}</div>
          <div className="stat__label">Active integrations</div>
        </div>
        <div className="card card--pad" style={{ textAlign: "center" }}>
          <div className="stat__value">{formatPercent(Math.min(reuseRate, 1))}</div>
          <div className="stat__label">Cross-platform reuse</div>
        </div>
      </div>

      {keyUsage.length > 0 && (
        <div className="card mb-6">
          <div className="card--pad" style={{ paddingBottom: 0 }}>
            <h3 className="h5" style={{ marginBottom: "4px" }}>Usage by API key</h3>
            <p className="help-text" style={{ marginBottom: "12px" }}>Monthly attestation usage against each key&apos;s quota.</p>
          </div>
          <table className="table" aria-label="Usage by API key">
            <thead>
              <tr>
                <th>Key</th>
                <th>Plan</th>
                <th>Usage</th>
                <th>Last used</th>
              </tr>
            </thead>
            <tbody>
              {keyUsage.map((k) => {
                const pct = k.monthlyLimit > 0 ? Math.min(100, Math.round((k.currentUsage / k.monthlyLimit) * 100)) : 0;
                const isTest = k.keyPrefix.startsWith("passify_test");
                return (
                  <tr key={k.keyPrefix}>
                    <td>
                      <span className="mono text-sm">{k.keyPrefix}****</span>
                      {isTest && <span className="status status--warning text-sm" style={{ marginLeft: "8px" }}>Test</span>}
                      {!k.isActive && <span className="status status--muted text-sm" style={{ marginLeft: "8px" }}>Revoked</span>}
                      <div className="text-muted text-xs">{k.platformName}</div>
                    </td>
                    <td className="text-sm">{k.tier.charAt(0).toUpperCase() + k.tier.slice(1)}</td>
                    <td className="text-sm">{formatNumber(k.currentUsage)} / {formatNumber(k.monthlyLimit)} ({pct}%)</td>
                    <td className="text-muted text-sm">{k.lastUsedAt ? formatShortTime(k.lastUsedAt) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isEmpty ? (
        <div className="card card--pad" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3 className="h4" style={{ marginBottom: "8px" }}>No activity yet</h3>
          <p className="help-text" style={{ marginBottom: "20px", maxWidth: "360px", margin: "0 auto 20px" }}>
            Start by verifying an investor or creating an API key to begin tracking activity.
          </p>
          <div className="row" style={{ justifyContent: "center", gap: "12px" }}>
            <Link href="/kyc" className="btn btn--primary btn--sm">Start a KYC</Link>
            <Link href="/keys" className="btn btn--outline btn--sm">Create API key</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table" aria-label="Recent activity">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="text-muted text-sm">{formatShortTime(r.ts)}</td>
                  <td>{r.type}</td>
                  <td><span className={`status status--${r.statusTone}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination" style={{ padding: "12px 16px" }}>
            <span>Page {page}</span>
            <div className="row" style={{ gap: "8px" }}>
              {page > 1 ? (
                <Link href={`/dashboard?page=${page - 1}`} className="btn btn--link btn--sm">Previous</Link>
              ) : (
                <span className="btn btn--link btn--sm" style={{ opacity: 0.4 }}>Previous</span>
              )}
              {hasNext ? (
                <Link href={`/dashboard?page=${page + 1}`} className="btn btn--link btn--sm">Next</Link>
              ) : (
                <span className="btn btn--link btn--sm" style={{ opacity: 0.4 }}>Next</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
