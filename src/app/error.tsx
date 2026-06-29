"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="container--x-narrow" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "var(--error)", marginBottom: "12px" }}>Error</div>
        <h2 className="h3" style={{ marginBottom: "8px" }}>Something went wrong</h2>
        <p className="help-text" style={{ marginBottom: "24px", maxWidth: "360px", margin: "0 auto 24px" }}>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <button onClick={reset} className="btn btn--primary">Try again</button>
      </div>
    </div>
  );
}
