import { TOKEN } from "@/lib/token";
import { CopyButton } from "@/components/design-system/copy";

/**
 * Contract-address chip. While `contractAddressIsPlaceholder` is true it shows
 * a "Placeholder" tag so no one mistakes the demo address for the live mint.
 * When the real CA is set in src/lib/token.ts, the tag disappears automatically.
 */
export function ContractAddress() {
  return (
    <span className="ca-chip">
      {TOKEN.contractAddressIsPlaceholder && <span className="ca-chip__tag">Placeholder</span>}
      <code>{TOKEN.contractAddress}</code>
      <CopyButton value={TOKEN.contractAddress} />
    </span>
  );
}
