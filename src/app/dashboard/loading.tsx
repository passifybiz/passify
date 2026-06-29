export default function DashboardLoading() {
  return (
    <div className="container">
      <div className="h2 mb-6" style={{ width: "120px", height: "28px", background: "var(--border)", borderRadius: "4px" }} />
      <div className="stats mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card card--pad" style={{ textAlign: "center" }}>
            <div style={{ width: "48px", height: "32px", background: "var(--border)", borderRadius: "4px", margin: "0 auto 8px" }} />
            <div style={{ width: "80px", height: "14px", background: "var(--border)", borderRadius: "4px", margin: "0 auto" }} />
          </div>
        ))}
      </div>
      <div className="card card--pad">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: "80px", height: "14px", background: "var(--border)", borderRadius: "4px" }} />
            <div style={{ width: "100px", height: "14px", background: "var(--border)", borderRadius: "4px" }} />
            <div style={{ width: "120px", height: "14px", background: "var(--border)", borderRadius: "4px" }} />
            <div style={{ width: "60px", height: "14px", background: "var(--border)", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
