import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { stringify } from "yaml";
import { openapiSpec } from "../src/lib/openapi";

/**
 * Generate openapi.yaml from the typed source of truth (src/lib/openapi.ts).
 * Run: `npm run openapi:gen`.
 */
const banner = "# Generated from src/lib/openapi.ts by `npm run openapi:gen`. Do not edit by hand.\n";
const yaml = banner + stringify(openapiSpec, { lineWidth: 0 });
const out = resolve(process.cwd(), "openapi.yaml");
writeFileSync(out, yaml, "utf8");
console.log(`Wrote ${out} (${yaml.length} bytes)`);
