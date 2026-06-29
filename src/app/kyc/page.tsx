"use client";

import { useState } from "react";
import { Button, Input, Card } from "@/components/design-system/primitives";
import { CopyButton } from "@/components/design-system/copy";
import { kycStartSchema } from "@/lib/validation";

export default function KycPage() {
  const [pubkey, setPubkey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sessionUrl: string; sessionId: string } | null>(null);

  async function handleStart() {
    const parsed = kycStartSchema.safeParse({ userPubkey: pubkey.trim(), schemaId: "kyc_individual_v1" });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/kyc/start-internal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPubkey: pubkey.trim(), schemaId: "kyc_individual_v1" }),
      });
      if (!res.ok) {
        const d = await res.json();
        const msg = d.detail ?? d.error ?? "Failed to start verification.";
        const friendly: Record<string, string> = {
          unauthorized: "Session expired. Please sign in again.",
          rate_limited: "Too many requests. Please wait a moment and try again.",
          validation_error: msg,
        };
        setError(friendly[d.error] ?? msg);
        return;
      }
      const d = await res.json();
      setResult({ sessionUrl: d.session_url, sessionId: d.session_id });
    } catch {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container container--x-narrow">
      <h2 className="h2">Verify an Investor</h2>
      <p className="help-text mb-6">
        Enter the investor&apos;s Solana public key. They will complete KYC through our verification partner.
      </p>

      <Input
        label="Public Key"
        placeholder="7xKXtg2..."
        value={pubkey}
        onChange={(e) => { setPubkey(e.target.value); setError(""); }}
        mono
        error={error}
        maxLength={44}
      />

      <Button block disabled={loading || !pubkey.trim()} onClick={handleStart}>
        {loading ? "Starting..." : "Start Verification"}
      </Button>

      {result && (
        <div className="callout stack mt-6">
          <p style={{ fontSize: "13px", color: "var(--text)" }}>Session created. Redirect the investor to:</p>
          <div className="row row--between">
            <span className="mono-sm" style={{ wordBreak: "break-all", color: "var(--text)" }}>{result.sessionUrl}</span>
            <CopyButton value={result.sessionUrl} />
          </div>
          <p className="mono-sm text-muted">Session ID: {result.sessionId}</p>
        </div>
      )}
    </div>
  );
}
