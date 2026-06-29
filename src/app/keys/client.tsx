"use client";

import { useState } from "react";
import { Button } from "@/components/design-system/primitives";
import { CopyButton } from "@/components/design-system/copy";
import { formatDate } from "@/lib/format";
import { createApiKeySchema } from "@/lib/validation";
import { TIER_LIMITS } from "@/lib/constants";

export interface KeyRow {
  id: string;
  platformName: string;
  keyPrefix: string;
  tier: string;
  monthlyLimit: number;
  currentUsage: number;
  isActive: boolean;
  allowedMints: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

export function KeysClient({ keys, mints }: { keys: KeyRow[]; mints: { slug: string; name: string }[] }) {
  const [showModal, setShowModal] = useState(false);
  const [platformName, setPlatformName] = useState("");
  const [tier, setTier] = useState("free");
  const [allowedMints, setAllowedMints] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleCreate() {
    const parsed = createApiKeySchema.safeParse({ platformName: platformName.trim(), tier, allowedMints });
    if (!parsed.success) {
      setCreating(false);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformName, tier, allowedMints }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedKey(data.plain_key);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await fetch(`/api/keys`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: false }),
      });
      window.location.reload();
    } finally {
      setRevoking(null);
    }
  }

  function toggleMint(slug: string) {
    setAllowedMints((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="container container--narrow">
      <div className="row row--between mb-4">
        <div>
          <h2 className="h2">API Keys</h2>
          <p className="help-text">Keys are shown once at creation. Store them securely.</p>
        </div>
        <Button variant="outline" onClick={() => { setShowModal(true); setCreatedKey(null); }}>Create New Key</Button>
      </div>

      {keys.length === 0 && (
        <div className="card card--pad" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h3 className="h4" style={{ marginBottom: "8px" }}>No API keys yet</h3>
          <p className="help-text" style={{ marginBottom: "20px", maxWidth: "340px", margin: "0 auto 20px" }}>
            Create your first key to start integrating Passify into your platform.
          </p>
          <Button variant="primary" onClick={() => { setShowModal(true); setCreatedKey(null); }}>Create your first key</Button>
        </div>
      )}

      {keys.map((key) => (
        <div key={key.id} className="key-card">
          <div className="key-card__top">
            <div>
              <span className="mono" style={{ fontSize: "13px", color: "var(--text)" }}>{key.keyPrefix}****</span>
              <span className="status status--success text-sm" style={{ marginLeft: "12px" }}>
                {key.isActive ? "Active" : "Revoked"}
              </span>
            </div>
            {key.isActive && (
              <div>
                {revoking === key.id ? (
                  <span className="text-sm text-muted">Revoking...</span>
                ) : (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      if (window.confirm("Are you sure? This cannot be undone.")) handleRevoke(key.id);
                    }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="key-card__meta">
            {key.tier.charAt(0).toUpperCase() + key.tier.slice(1)} plan · {key.monthlyLimit.toLocaleString()}/month · {key.currentUsage.toLocaleString()} used this month
          </div>
          <div className="key-card__meta">
            Allowed: {key.allowedMints.length > 0 ? key.allowedMints.join(", ") : "None"}
          </div>
          <div className="key-card__meta">
            Created: {formatDate(key.createdAt)}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => { if (!createdKey) setShowModal(false); }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            ref={(el) => {
              if (el) {
                const focusable = el.querySelector<HTMLElement>("input, button, [tabindex]");
                focusable?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !createdKey) setShowModal(false);
              // Simple focus trap
              if (e.key === "Tab") {
                const focusableEls = e.currentTarget.querySelectorAll<HTMLElement>(
                  'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableEls.length === 0) return;
                const first = focusableEls[0];
                const last = focusableEls[focusableEls.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            {!createdKey ? (
              <>
                <h3 id="modal-title" className="h4 mb-4">Create API Key</h3>

                <div className="form-row">
                  <label>Platform Name</label>
                  <input className="input" value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder="Platform A" />
                </div>

                <div className="form-row">
                  <label>Tier</label>
                  <div className="radio-group">
                    {["free", "pro", "enterprise"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`radio-pill${tier === t ? " radio-pill--selected" : ""}`}
                        onClick={() => setTier(t)}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}<br />
                          <span className="text-xs text-muted">{TIER_LIMITS[t].toLocaleString()}/mo</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <label>Allowed Mint Configs</label>
                  {mints.map((m) => (
                    <label key={m.slug} className="row" style={{ cursor: "pointer", padding: "4px 0" }}>
                      <input
                        type="checkbox"
                        checked={allowedMints.includes(m.slug)}
                        onChange={() => toggleMint(m.slug)}
                      />
                      <span className="text-sm">{m.name}</span>
                    </label>
                  ))}
                </div>

                <Button block disabled={creating || !platformName.trim()} onClick={handleCreate}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </>
            ) : (
              <>
                <h3 id="modal-title" className="h4 mb-4">Key Created</h3>
                <p className="text-sm mb-3" style={{ color: "var(--text)" }}>Your API key:</p>
                <div className="callout mb-3">
                  <div className="row row--between">
                    <span className="mono-sm" style={{ wordBreak: "break-all", color: "var(--text)" }}>{createdKey}</span>
                    <CopyButton value={createdKey} />
                  </div>
                </div>
                <p className="field-error text-sm mb-4">This key will not be shown again.</p>
                <Button block onClick={() => { setShowModal(false); window.location.reload(); }}>Done</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
