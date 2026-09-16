#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "economy-simulation-parts"
);

const source = fs
  .readdirSync(directory)
  .filter((name) => name.endsWith(".inc"))
  .sort()
  .map((name) => fs.readFileSync(path.join(directory, name), "utf8"))
  .join("")
  .replace(/^#!.*\n/, "");

new Function(source)();
