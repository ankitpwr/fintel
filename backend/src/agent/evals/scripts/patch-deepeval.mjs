import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "node_modules", "deepeval", "dist");
const legacyFile = join(distDir, "telemetry.js");
const legacyTypes = join(distDir, "telemetry.d.ts");

// deepeval ships both telemetry.js and telemetry/index.js; Node/Bun resolve
// the file first, breaking evaluate()'s telemetry imports.
if (existsSync(legacyFile)) {
  renameSync(legacyFile, join(distDir, "telemetry-legacy.js"));
}

if (existsSync(legacyTypes)) {
  renameSync(legacyTypes, join(distDir, "telemetry-legacy.d.ts"));
}
