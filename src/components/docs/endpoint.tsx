type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * HTTP method + path header for an API reference entry. Color encodes the
 * verb (brand green for safe reads, amber for writes) without a pill icon.
 */
export function Endpoint({
  method,
  path,
  auth = "API key",
}: {
  method: Method;
  path: string;
  auth?: string;
}) {
  const safe = method === "GET";
  return (
    <div className="endpoint">
      <span
        className="endpoint__method"
        style={{ color: safe ? "var(--primary)" : "var(--warning)" }}
      >
        {method}
      </span>
      <code className="endpoint__path">{path}</code>
      <span className="endpoint__auth">{auth}</span>
    </div>
  );
}
