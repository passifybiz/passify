"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email: email.toLowerCase(), password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        const friendly: Record<string, string> = {
          invalid_credentials: "Incorrect email or password.",
          rate_limited: "Too many attempts. Please wait 5 minutes.",
          validation_error: data.detail ?? "Please check your input.",
        };
        setError(friendly[data.error] ?? data.detail ?? "Something went wrong. Try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container--x-narrow" style={{ margin: "0 auto", paddingTop: "120px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div className="wordmark" style={{ fontSize: "28px", marginBottom: "8px" }}>passify</div>
          <p className="help-text">Identity verification for tokenized assets.</p>
        </div>

        <form onSubmit={handleSubmit} className="card card--pad stack">
          <h2 className="h3" style={{ marginBottom: "4px" }}>Sign in</h2>
          <p className="help-text mb-4">Enter your credentials to access the dashboard.</p>

          {error && <div className="field-error" style={{ marginBottom: "12px" }}>{error}</div>}

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@passify.biz" required autoComplete="email" />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <details className="faq" style={{ marginTop: "24px" }}>
          <summary className="text-muted text-sm" style={{ cursor: "pointer", textAlign: "center" }}>
            Why no sign up?
          </summary>
          <div className="card card--pad stack" style={{ marginTop: "12px", fontSize: "14px" }}>
            <p className="help-text" style={{ margin: 0 }}>
              Passify is a private dashboard for authorised operators. Accounts are provisioned by your organisation admin — there is no public registration.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <p className="help-text" style={{ margin: "8px 0 0 0" }}>
                <strong>Seed (dev)</strong>: sarah@passify.biz / passify-admin
              </p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
