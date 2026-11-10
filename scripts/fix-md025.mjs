import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "ui-reference",
]);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (/\.(md|mdc)$/.test(ent.name)) acc.push(full);
  }
  return acc;
}

function processLines(lines, { demoteNested }) {
  let inFence = false;
  let fenceChar = null;
  let fenceLen = 0;
  let firstH1Seen = false;
  let changed = false;

  const out = lines.map((line) => {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const marker = fence[2];
      const ch = marker[0];
      const len = marker.length;
      if (!inFence) {
        inFence = true;
        fenceChar = ch;
        fenceLen = len;
      } else if (ch === fenceChar && len >= fenceLen) {
        inFence = false;
        fenceChar = null;
        fenceLen = 0;
      }
      return line;
    }

    if (inFence) return line;

    const heading = line.match(/^(#{1,6})(\s+\S.*)$/);
    if (!heading) return line;

    const level = heading[1].length;
    const rest = heading[2];

    if (level === 1 && !firstH1Seen) {
      firstH1Seen = true;
      return line;
    }

    if (!firstH1Seen) return line;

    if (level === 1 || demoteNested) {
      changed = true;
      return "#".repeat(Math.min(level + 1, 6)) + rest;
    }

    return line;
  });

  return { out, changed, firstH1Seen };
}

function countH1OutsideFences(text) {
  const lines = text.split(/\r?\n/);
  let inFence = false;
  let fenceChar = null;
  let fenceLen = 0;
  let count = 0;
  for (const line of lines) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[2];
      const ch = marker[0];
      const len = marker.length;
      if (!inFence) {
        inFence = true;
        fenceChar = ch;
        fenceLen = len;
      } else if (ch === fenceChar && len >= fenceLen) {
        inFence = false;
        fenceChar = null;
        fenceLen = 0;
      }
      continue;
    }
    if (!inFence && /^# [^#]/.test(line)) count += 1;
  }
  return count;
}

const mode = process.argv[2] ?? "fix";
const root = process.cwd();
const files = walk(root);

if (mode === "check") {
  const multi = [];
  for (const file of files) {
    const count = countH1OutsideFences(fs.readFileSync(file, "utf8"));
    if (count > 1) multi.push({ file: path.relative(root, file), count });
  }
  console.log(JSON.stringify(multi, null, 2));
  console.log(`multi-h1 files: ${multi.length}`);
  process.exit(multi.length === 0 ? 0 : 1);
}

// Restore README / files that should keep nested ## under a single existing H1
// by only demoting extra H1 lines (not nested headings).
const onlyExtraH1 = new Set([
  path.join(root, "README.md"),
  path.join(root, "tests", "README.md"),
]);

let changedCount = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const demoteNested = !onlyExtraH1.has(file);
  // For files that already have a single H1, skip.
  if (countH1OutsideFences(raw) <= 1 && !onlyExtraH1.has(file)) {
    continue;
  }
  const { out, changed } = processLines(raw.split(/\r?\n/), { demoteNested });
  if (changed) {
    fs.writeFileSync(file, out.join("\n"));
    changedCount += 1;
    console.log(`fixed: ${path.relative(root, file)}`);
  }
}
console.log(`changed: ${changedCount}`);
