import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="container--x-narrow" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "64px", fontWeight: 700, color: "var(--primary)", lineHeight: 1, marginBottom: "12px" }}>404</div>
        <h2 className="h3" style={{ marginBottom: "8px" }}>Page not found</h2>
        <p className="help-text" style={{ marginBottom: "28px", maxWidth: "360px", margin: "0 auto 28px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn btn--primary">Go home</Link>
      </div>
    </div>
  );
}
