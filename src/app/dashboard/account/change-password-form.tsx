"use client";

import { useState, FormEvent } from "react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, password, confirm }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.detail ?? d.error ?? "Failed to update password.");
        return;
      }
      setSuccess(true);
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card card--pad stack">
      <h3 className="h5">Change Password</h3>

      {error && <div className="field-error">{error}</div>}
      {success && <div className="callout" style={{ color: "var(--success)", fontSize: "14px" }}>Password updated successfully.</div>}

      <div className="form-row">
        <label htmlFor="current">Current Password</label>
        <input id="current" type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
      </div>
      <div className="form-row">
        <label htmlFor="password">New Password</label>
        <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
      </div>
      <div className="form-row">
        <label htmlFor="confirm">Confirm New Password</label>
        <input id="confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
      </div>
      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
