import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const originalResolveFilename = Module._resolveFilename;
const emptyModulePath = path.join(
  currentDirectory,
  "server-only-empty.cjs"
);

Module._resolveFilename = function resolveFilename(
  request,
  parent,
  isMain,
  options
) {
  if (request === "server-only") {
    return emptyModulePath;
  }

  return originalResolveFilename.call(
    this,
    request,
    parent,
    isMain,
    options
  );
};
