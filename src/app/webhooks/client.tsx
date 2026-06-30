"use client";

import { useState } from "react";
import { Button } from "@/components/design-system/primitives";
import { CopyButton } from "@/components/design-system/copy";
import { formatDate, formatShortTime } from "@/lib/format";

export interface EndpointRow {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface DeliveryRow {
  id: string;
  eventId: string;
  endpointId: string;
  status: string;
  attempts: number;
  responseStatus: number | null;
  error: string | null;
  createdAt: string;
}

export function WebhooksClient({
  endpoints,
  deliveries,
  eventTypes,
  tablesReady,
}: {
  endpoints: EndpointRow[];
  deliveries: DeliveryRow[];
  eventTypes: string[];
  tablesReady: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  function toggleEvent(e: string) {
    setSelected((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function create() {
    setError("");
    if (!url.trim() || selected.length === 0) {
      setError("Enter a URL and select at least one event.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, description: description || undefined, events: selected }),
      });
      const data = await res.json();
      if (res.ok) setCreatedSecret(data.secret);
      else setError(data.detail ?? "Could not create endpoint.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/webhooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (body.rotateSecret && data.secret) {
      window.alert(`New signing secret (shown once):\n\n${data.secret}`);
    }
    window.location.reload();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this endpoint? Pending deliveries will stop.")) return;
    await fetch("/api/webhooks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }

  async function replay(deliveryId: string) {
    await fetch("/api/webhooks/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryId }),
    });
    window.location.reload();
  }

  const endpointLabel = (id: string) => {
    const ep = endpoints.find((e) => e.id === id);
    return ep ? new URL(ep.url).host : id.slice(0, 8);
  };

  return (
    <div className="container container--narrow">
      <div className="row row--between mb-4">
        <div>
          <h2 className="h2">Webhooks</h2>
          <p className="help-text">Receive signed events when attestations, KYC sessions, or rules change.</p>
        </div>
        <Button variant="outline" onClick={() => { setShowModal(true); setCreatedSecret(null); setUrl(""); setDescription(""); setSelected([]); }}>
          Add endpoint
        </Button>
      </div>

      {!tablesReady && (
        <div className="card card--pad mb-6" style={{ borderLeft: "3px solid var(--warning)" }}>
          <h3 className="h5" style={{ marginBottom: "4px" }}>Webhook tables not migrated</h3>
          <p className="help-text">
            The webhook tables haven&apos;t been created in this database yet. Apply the migration
            (<code>npm run db:migrate:apply</code>) to enable endpoint management. See
            WEBHOOKS_IMPLEMENTATION.md.
          </p>
        </div>
      )}

      {tablesReady && endpoints.length === 0 && (
        <div className="card card--pad" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3 className="h4" style={{ marginBottom: "8px" }}>No endpoints yet</h3>
          <p className="help-text" style={{ maxWidth: "360px", margin: "0 auto 20px" }}>
            Add an endpoint to start receiving signed webhook events.
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)}>Add your first endpoint</Button>
        </div>
      )}

      {endpoints.map((ep) => (
        <div key={ep.id} className="key-card">
          <div className="key-card__top">
            <div>
              <span className="mono" style={{ fontSize: "13px", color: "var(--text)" }}>{ep.url}</span>
              <span className={`status status--${ep.isActive ? "success" : "muted"} text-sm`} style={{ marginLeft: "12px" }}>
                {ep.isActive ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="row" style={{ gap: "8px" }}>
              <button className="btn btn--ghost btn--sm" onClick={() => patch(ep.id, { isActive: !ep.isActive })}>
                {ep.isActive ? "Disable" : "Enable"}
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => patch(ep.id, { rotateSecret: true })}>Rotate secret</button>
              <button className="btn btn--ghost btn--sm" onClick={() => remove(ep.id)}>Delete</button>
            </div>
          </div>
          <div className="key-card__meta">Events: {ep.events.join(", ")}</div>
          {ep.description && <div className="key-card__meta">{ep.description}</div>}
          <div className="key-card__meta">Created: {formatDate(ep.createdAt)}</div>
        </div>
      ))}

      {deliveries.length > 0 && (
        <div className="card mt-6">
          <div className="card--pad" style={{ paddingBottom: 0 }}>
            <h3 className="h5">Recent deliveries</h3>
          </div>
          <table className="table" aria-label="Webhook deliveries">
            <thead>
              <tr><th>Time</th><th>Endpoint</th><th>Status</th><th>Attempts</th><th></th></tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td className="text-muted text-sm">{formatShortTime(d.createdAt)}</td>
                  <td className="text-sm mono">{endpointLabel(d.endpointId)}</td>
                  <td>
                    <span className={`status status--${d.status === "success" ? "success" : d.status === "failed" ? "error" : "warning"} text-sm`}>
                      {d.status}{d.responseStatus ? ` (${d.responseStatus})` : ""}
                    </span>
                  </td>
                  <td className="text-sm">{d.attempts}</td>
                  <td>
                    {d.status !== "success" && (
                      <button className="btn btn--link btn--sm" onClick={() => replay(d.id)}>Replay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { if (!createdSecret) setShowModal(false); }} role="dialog" aria-modal="true" aria-labelledby="wh-modal-title">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {!createdSecret ? (
              <>
                <h3 id="wh-modal-title" className="h4 mb-4">Add webhook endpoint</h3>
                <div className="form-row">
                  <label htmlFor="wh-url">Endpoint URL</label>
                  <input id="wh-url" className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/passify" />
                </div>
                <div className="form-row">
                  <label htmlFor="wh-desc">Description (optional)</label>
                  <input id="wh-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Production receiver" />
                </div>
                <div className="form-row">
                  <label>Events</label>
                  {eventTypes.map((e) => (
                    <label key={e} className="row" style={{ cursor: "pointer", padding: "4px 0" }}>
                      <input type="checkbox" checked={selected.includes(e)} onChange={() => toggleEvent(e)} />
                      <span className="text-sm mono">{e}</span>
                    </label>
                  ))}
                </div>
                {error && <p className="field-error text-sm mb-3">{error}</p>}
                <Button block disabled={busy || !url.trim() || selected.length === 0} onClick={create}>
                  {busy ? "Creating..." : "Create endpoint"}
                </Button>
              </>
            ) : (
              <>
                <h3 id="wh-modal-title" className="h4 mb-4">Endpoint created</h3>
                <p className="text-sm mb-3" style={{ color: "var(--text)" }}>Signing secret (verify webhooks with this):</p>
                <div className="callout mb-3">
                  <div className="row row--between">
                    <span className="mono-sm" style={{ wordBreak: "break-all", color: "var(--text)" }}>{createdSecret}</span>
                    <CopyButton value={createdSecret} />
                  </div>
                </div>
                <p className="field-error text-sm mb-4">This secret will not be shown again.</p>
                <Button block onClick={() => { setShowModal(false); window.location.reload(); }}>Done</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
