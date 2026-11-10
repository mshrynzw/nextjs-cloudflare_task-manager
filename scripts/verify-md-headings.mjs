import fs from "node:fs";
import path from "node:path";

const SKIP = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  ".open-next",
  ".wrangler",
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function analyze(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  let inFence = false;
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  const first = [];
  const fenceCommentIssues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      if (/^## [A-Z_]/.test(line) || /^## AUTH_SECRET/.test(line)) {
        fenceCommentIssues.push(`${i + 1}:${line}`);
      }
      continue;
    }
    if (/^# /.test(line)) {
      h1 += 1;
      if (first.length < 12) first.push(line);
    } else if (/^## /.test(line)) {
      h2 += 1;
      if (first.length < 12) first.push(line);
    } else if (/^### /.test(line)) {
      h3 += 1;
      if (first.length < 12) first.push(line);
    }
  }

  return { h1, h2, h3, first, fenceCommentIssues };
}

const files = walk(".");
const multi = [];
const zero = [];
const fenceIssues = [];

for (const file of files) {
  const result = analyze(file);
  if (result.h1 > 1) multi.push({ file, count: result.h1 });
  if (result.h1 === 0) zero.push(file);
  if (result.fenceCommentIssues.length) {
    fenceIssues.push({ file, issues: result.fenceCommentIssues });
  }
}

console.log(
  JSON.stringify(
    {
      totalMd: files.length,
      multiH1: multi,
      zeroH1Count: zero.length,
      zeroH1Sample: zero.slice(0, 20),
      fenceIssues,
      developmentLog: analyze("docs/development-log.md"),
      readme: analyze("README.md"),
      agents: analyze("AGENTS.md"),
    },
    null,
    2,
  ),
);
