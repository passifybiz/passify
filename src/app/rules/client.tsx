"use client";

import { useState } from "react";
import { Button, Input } from "@/components/design-system/primitives";
import { formatDateTime, truncateMiddle } from "@/lib/format";
import { schemaLabel, SCHEMAS } from "@/lib/schemas/registry";

export interface MintRow {
  mint: {
    id: string;
    slug: string;
    name: string;
    mintAddress: string;
    decimals: number;
    totalSupply: string;
    mintedSupply: string;
    isConfidential: boolean;
    createdAt: string;
  };
  rule: {
    id: string;
    requiredSchema: string;
    allowedJurisdictions: string[];
    minInvestmentUsd: string;
    maxHolders: number;
    transferLockUntil: string | null;
    updatedBy: string;
    updatedAt: string;
  } | null;
}

export function RulesClient({ mints }: { mints: MintRow[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = mints[activeIdx];

  const [requiredSchema, setRequiredSchema] = useState(active?.rule?.requiredSchema ?? "kyc_individual_v1");
  const [jurisdictions, setJurisdictions] = useState(active?.rule?.allowedJurisdictions?.join(", ") ?? "");
  const [minInvestment, setMinInvestment] = useState(active?.rule?.minInvestmentUsd ?? "0");
  const [maxHolders, setMaxHolders] = useState(String(active?.rule?.maxHolders ?? ""));
  const [transferLock, setTransferLock] = useState(active?.rule?.transferLockUntil ? formatDateTime(active.rule.transferLockUntil).split(" ")[0] : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/rules/${active.mint.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredSchema,
          allowedJurisdictions: jurisdictions.split(",").map((s: string) => s.trim().toUpperCase()).filter(Boolean),
          minInvestmentUsd: minInvestment,
          maxHolders: parseInt(maxHolders, 10) || 999999,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!mints.length) {
    return (
      <div className="container">
        <h2 className="h2">Compliance Rules</h2>
        <p className="text-muted text-sm mt-2">No token configurations found.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="h2 mb-6">Compliance Rules</h2>
      <div className="two-col">
        <div>
          <h4 className="h5 mb-3">Token Configurations</h4>
          {mints.map((m, i) => (
            <button
              key={m.mint.id}
              className={`mint-list__item${i === activeIdx ? " mint-list__item--active" : ""}`}
              onClick={() => { setActiveIdx(i); setSaved(false); }}
            >
              <div style={{ fontSize: "14px", color: "var(--text)", marginBottom: "2px" }}>{m.mint.name}</div>
              <div className="mono-sm text-muted" style={{ marginBottom: "2px" }}>{m.mint.slug}</div>
              <div className="mono-sm text-muted">{truncateMiddle(m.mint.mintAddress, 4, 3)}</div>
            </button>
          ))}
        </div>

        <div>
          <h3 className="h4 mb-4">Rules: {active.mint.name}</h3>

          <div className="form-row">
            <label>Required Schema</label>
            <select
              className="select"
              value={requiredSchema}
              onChange={(e) => setRequiredSchema(e.target.value)}
            >
              {SCHEMAS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Allowed Jurisdictions (comma separated)</label>
            <input
              className="input input--mono"
              value={jurisdictions}
              onChange={(e) => setJurisdictions(e.target.value)}
              placeholder="US, CA, GB"
            />
          </div>

          <div className="form-row">
            <label>Min Investment (USD)</label>
            <input
              className="input"
              type="number"
              value={minInvestment}
              onChange={(e) => setMinInvestment(e.target.value)}
              min={0}
            />
          </div>

          <div className="form-row">
            <label>Max Holders</label>
            <input
              className="input"
              type="number"
              value={maxHolders}
              onChange={(e) => setMaxHolders(e.target.value)}
              min={1}
            />
          </div>

          <Button block disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : saved ? "Saved" : "Save Rules"}
          </Button>

          {active.rule && (
            <p className="text-muted text-sm mt-3">
              Last updated by {active.rule.updatedBy} on {formatDateTime(active.rule.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
