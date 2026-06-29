"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ paddingTop: "48px", textAlign: "center" }}>
      <h2 className="h3" style={{ marginBottom: "8px" }}>Failed to load dashboard</h2>
      <p className="help-text" style={{ marginBottom: "24px" }}>
        {error.message || "An error occurred while loading data."}
      </p>
      <button onClick={reset} className="btn btn--primary btn--sm">Retry</button>
    </div>
  );
}
