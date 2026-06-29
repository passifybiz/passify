import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { formatDateTime, truncateMiddle } from "@/lib/format";
import { parseJson } from "@/lib/db/json";

interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default async function AuditPage() {
  await requireUser();

  const logs: AuditEntry[] = await db
    .select()
    .from(auditLog)
    .orderBy(sql`${auditLog.createdAt} desc`)
    .limit(100);

  const actionLabel: Record<string, string> = {
    rule_updated: "Rule Updated",
    attestation_issued: "Attestation Issued",
    mint_config_created: "Mint Created",
    api_key_created: "API Key Created",
    api_key_revoked: "API Key Revoked",
  };

  return (
    <div className="container">
      <h2 className="h2 mb-6">Audit Log</h2>

      {logs.length === 0 && (
        <p className="text-muted text-sm">No audit entries yet.</p>
      )}

      {logs.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-muted text-sm">{formatDateTime(entry.createdAt)}</td>
                  <td><span className="mono-sm">{entry.actor}</span></td>
                  <td>{actionLabel[entry.action] ?? entry.action}</td>
                  <td className="mono text-muted">{truncateMiddle(entry.entityId, 6, 4)}</td>
                  <td style={{ maxWidth: "240px" }}>
                    <details style={{ fontSize: "13px", cursor: "pointer" }}>
                      <summary className="text-muted text-sm">View</summary>
                      <div className="stack" style={{ marginTop: "8px", fontSize: "12px", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                        {entry.oldValue && <div className="text-muted">old: {JSON.stringify(parseJson(entry.oldValue))}</div>}
                        {entry.newValue && <div className="text-muted">new: {JSON.stringify(parseJson(entry.newValue))}</div>}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
