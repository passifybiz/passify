import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { attestations, attestationReads, apiKeys } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { formatDateTime, truncateMiddle, solscanAccount, solscanTx } from "@/lib/format";
import { schemaLabel } from "@/lib/schemas/registry";
import { CopyButton } from "@/components/design-system/copy";
import Link from "next/link";

export default async function AttestationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const att = await db.query.attestations.findFirst({
    where: eq(attestations.attestationId, id),
  });
  if (!att) notFound();

  const reads = await db
    .select({
      platformName: apiKeys.platformName,
      readAt: attestationReads.readAt,
    })
    .from(attestationReads)
    .innerJoin(apiKeys, eq(attestationReads.apiKeyId, apiKeys.id))
    .where(eq(attestationReads.attestationId, id))
    .orderBy(sql`${attestationReads.readAt} desc`);

  const isActive = new Date(att.expiresAt) > new Date();

  return (
    <div className="container container--narrow">
      <h3 className="h3 mb-6">Attestation {att.attestationId}</h3>

      <div className="card card--pad stack">
        <table className="table">
          <tbody>
            <tr>
              <td className="text-muted text-sm" style={{ width: "160px" }}>Status</td>
              <td><span className={`status status--${isActive ? "success" : "error"}`}>{isActive ? "Verified" : "Expired"}</span></td>
            </tr>
            <tr>
              <td className="text-muted text-sm">Schema</td>
              <td>{schemaLabel(att.schemaId)}</td>
            </tr>
            <tr>
              <td className="text-muted text-sm">User</td>
              <td>
                <Link href={solscanAccount(att.userPubkey)} target="_blank" className="mono" style={{ fontSize: "13px" }}>
                  {truncateMiddle(att.userPubkey, 8, 6)}
                </Link>
              </td>
            </tr>
            {att.jurisdiction && (
              <tr>
                <td className="text-muted text-sm">Jurisdiction</td>
                <td>{att.jurisdiction}</td>
              </tr>
            )}
            <tr>
              <td className="text-muted text-sm">Issued At</td>
              <td>{formatDateTime(att.createdAt)}</td>
            </tr>
            <tr>
              <td className="text-muted text-sm">Expires At</td>
              <td>{formatDateTime(att.expiresAt)}</td>
            </tr>
            <tr>
              <td className="text-muted text-sm">Onchain Tx</td>
              <td>
                <Link href={solscanTx(att.onchainTx)} target="_blank" className="mono" style={{ fontSize: "13px" }}>
                  {truncateMiddle(att.onchainTx, 8, 6)}
                </Link>
              </td>
            </tr>
            <tr>
              <td className="text-muted text-sm">Data Hash</td>
              <td>
                <span className="row">
                  <span className="mono" style={{ fontSize: "13px" }}>{truncateMiddle(att.dataHash, 8, 6)}</span>
                  <CopyButton value={att.dataHash} />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h4 className="h5 mb-3">Read by Platforms</h4>
        {reads.length === 0 ? (
          <p className="text-muted text-sm">No platforms have read this attestation yet.</p>
        ) : (
          <div className="card card--pad">
            {reads.map((r: { platformName: string; readAt: string }, i) => (
              <div key={i} className="reuse-item">
                {r.platformName} — {formatDateTime(r.readAt)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
