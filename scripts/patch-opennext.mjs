/**
 * Apply Windows-friendly OpenNext patches after install.
 *
 * 1) @opennextjs/aws copyTracedFiles — use junctions instead of symlinks
 * 2) @opennextjs/cloudflare bundle-server — shim `sharp` (not used on Workers)
 *
 * OpenNext officially recommends WSL/Linux for builds; these patches make
 * local Windows builds workable for this project.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function resolvePackageFile(specifier, relativeFile) {
  try {
    const pkgJson = require.resolve(`${specifier}/package.json`);
    return path.join(path.dirname(pkgJson), relativeFile);
  } catch {
    return null;
  }
}

function patchCopyTracedFiles(filePath) {
  let source = fs.readFileSync(filePath, "utf8");
  if (source.includes('symlinkSync(path.resolve(path.dirname(to), symlink), to, "junction")')) {
    return false;
  }

  const needle = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

  const replacement = `        if (symlink) {
            try {
                // Windows: recreate pnpm dir links as junctions (no admin / Developer Mode).
                if (process.platform === "win32") {
                    symlinkSync(path.resolve(path.dirname(to), symlink), to, "junction");
                }
                else {
                    symlinkSync(symlink, to);
                }
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

  if (!source.includes(needle)) {
    console.warn("[patch-opennext] copyTracedFiles.js pattern not found — skipped");
    return false;
  }

  fs.writeFileSync(filePath, source.replace(needle, replacement));
  return true;
}

function patchBundleServer(filePath) {
  let source = fs.readFileSync(filePath, "utf8");
  if (source.includes('sharp: path.join(buildOpts.outputDir, "cloudflare-templates/shims/empty.js")')) {
    return false;
  }

  const needle = `            // Workers have builtin Web Sockets
            "next/dist/compiled/ws": path.join(buildOpts.outputDir, "cloudflare-templates/shims/empty.js"),
            // The toolbox optimizer pulls severals MB of dependencies`;

  const replacement = `            // Workers have builtin Web Sockets
            "next/dist/compiled/ws": path.join(buildOpts.outputDir, "cloudflare-templates/shims/empty.js"),
            // Image optimization uses Cloudflare Images / unoptimized mode — do not bundle sharp.
            sharp: path.join(buildOpts.outputDir, "cloudflare-templates/shims/empty.js"),
            // The toolbox optimizer pulls severals MB of dependencies`;

  if (!source.includes(needle)) {
    console.warn("[patch-opennext] bundle-server.js pattern not found — skipped");
    return false;
  }

  fs.writeFileSync(filePath, source.replace(needle, replacement));
  return true;
}

const copyTraced = resolvePackageFile("@opennextjs/aws", "dist/build/copyTracedFiles.js");
const bundleServer = resolvePackageFile(
  "@opennextjs/cloudflare",
  "dist/cli/build/bundle-server.js",
);

let changed = false;
if (copyTraced && fs.existsSync(copyTraced)) {
  changed = patchCopyTracedFiles(copyTraced) || changed;
}
if (bundleServer && fs.existsSync(bundleServer)) {
  changed = patchBundleServer(bundleServer) || changed;
}

if (changed) {
  console.log("[patch-opennext] Applied OpenNext Windows / sharp patches");
} else {
  console.log("[patch-opennext] Patches already applied or packages missing");
}
