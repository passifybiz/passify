/**
 * IdentityNetwork — a custom, information-bearing diagram of the Passify model:
 *   one verified identity → a single attestation → reused across every platform,
 *   with only a SHA-256 hash written on-chain (no PII).
 *
 * Pure SVG, no dependencies. Animation is CSS-driven and fully disabled under
 * prefers-reduced-motion. The diagram is exposed to assistive tech as a single
 * labelled image, with an equivalent text description rendered for screen readers.
 */
export function IdentityNetwork() {
  const platforms = [
    { y: 64, label: "Tokenized credit" },
    { y: 138, label: "Real estate fund" },
    { y: 212, label: "Treasury notes" },
  ];

  return (
    <figure className="idn" aria-labelledby="idn-caption">
      <svg
        className="idn__svg"
        viewBox="0 0 760 276"
        role="img"
        aria-label="How a Passify attestation works: verify once, use everywhere"
        aria-describedby="idn-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <desc id="idn-desc">
          A diagram showing one verified investor identity producing a single Passify
          attestation. Only a SHA-256 hash is written to Solana. Three tokenized-asset
          platforms each read the same attestation, illustrating verify-once,
          use-everywhere compliance.
        </desc>

        {/* ── connectors ─────────────────────────────────── */}
        <g className="idn__links" fill="none" strokeWidth="1.5">
          {/* identity -> hub */}
          <path className="idn__link idn__link--in" d="M150 138 H300" />
          {/* hub -> platforms */}
          {platforms.map((p, i) => (
            <path
              key={p.label}
              className="idn__link idn__link--out"
              style={{ animationDelay: `${0.4 + i * 0.18}s` }}
              d={`M460 138 C520 138, 540 ${p.y}, 600 ${p.y}`}
            />
          ))}
          {/* hub -> chain (down) */}
          <path className="idn__link idn__link--chain" d="M380 174 V214" />
        </g>

        {/* ── identity node ──────────────────────────────── */}
        <g className="idn__node">
          <rect x="36" y="108" width="114" height="60" rx="6" />
          <circle className="idn__avatar" cx="68" cy="138" r="13" />
          <path
            className="idn__check"
            d="M62.5 138 l4 4 l7 -8"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text className="idn__t" x="90" y="134">Investor</text>
          <text className="idn__t idn__t--mut" x="90" y="150">KYC once</text>
        </g>

        {/* ── Passify attestation hub ────────────────────── */}
        <g className="idn__hub">
          <rect x="300" y="104" width="160" height="68" rx="8" />
          <text className="idn__hub-mark" x="380" y="132" textAnchor="middle">Passify</text>
          <text className="idn__t idn__t--inv" x="380" y="152" textAnchor="middle">
            attestation
          </text>
        </g>

        {/* ── on-chain hash chip ─────────────────────────── */}
        <g className="idn__chain">
          <rect x="296" y="214" width="168" height="40" rx="6" />
          <text className="idn__chain-label" x="380" y="231" textAnchor="middle">
            SOLANA · on-chain
          </text>
          <text className="idn__hash" x="380" y="246" textAnchor="middle">
            sha256: 9f2a…c41b
          </text>
        </g>

        {/* ── platform nodes ─────────────────────────────── */}
        <g className="idn__node">
          {platforms.map((p) => (
            <g key={p.label}>
              <rect x="600" y={p.y - 19} width="132" height="38" rx="6" />
              <circle className="idn__pdot" cx="620" cy={p.y} r="4" />
              <text className="idn__t idn__t--sm" x="634" y={p.y + 4}>
                {p.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <figcaption id="idn-caption" className="idn__caption">
        One verification. One attestation. Read by every connected platform — with only
        a hash on-chain.
      </figcaption>
    </figure>
  );
}
