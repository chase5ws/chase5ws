// Rebuilds the project lists from os/data.js, so that file is the only place to edit projects.
//
//   README.md   between <!-- repos:start --> and <!-- repos:end -->: Public sites, Public projects, Private projects
//   index.html  between <!-- lists:start --> and <!-- lists:end -->: the same lists for the no-JavaScript version,
//               plus the ?v= cache tag on os/ files, set from a hash of their contents.
//
// Commit tags already in the README (the " <!--c--> · Public · ..." suffix) are kept; repo_commits.py refreshes them.
// Usage: node .github/scripts/build_lists.mjs   (from the repo root)

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";

const read = (f) => readFileSync(f, "utf8");
const ctx = { window: {} };
vm.runInNewContext(read("os/data.js"), ctx);
const D = ctx.window.CHASE;

const MARK = " <!--c-->";
const repoOf = (url) => (url || "").match(/github\.com\/chase5ws\/([\w.-]+)/)?.[1];
const html = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const all = [...D.projects, ...(D.tools || [])];
const sites = all.filter((p) => p.live);
const publics = all.filter((p) => !p.live && p.source);
const privates = all.filter((p) => !p.live && !p.source);
const blurb = (p) => (p.blurb || p.summary || "") + (p.status === "building" ? " (building)" : "");

function replaceBetween(text, start, end, inner, file) {
  const a = text.indexOf(start), b = text.indexOf(end);
  if (a < 0 || b < a) throw new Error(`${file}: markers ${start} / ${end} not found`);
  return text.slice(0, a + start.length) + inner + text.slice(b);
}

// ---------- README ----------
let readme = read("README.md");
const tags = new Map();
for (const line of readme.split("\n")) {
  const repo = line.startsWith("- ") && line.includes(MARK) && repoOf(line);
  if (repo) tags.set(repo, line.slice(line.indexOf(MARK)));
}
const withTag = (line, p) => line + (tags.get(repoOf(p.source)) || "");
const name = (p) => (p.source ? `**[${p.name}](${p.source})**` : `**${p.name}**`);

const siteLine = (p) => withTag(`- ${name(p)}, ${blurb(p)} ([live${p.source ? "" : " demo"}](${p.live}))${p.source ? "" : " · source is private"}`, p);
const md = [
  "",
  "",
  ...sites.map(siteLine),
  "",
  "**Public projects**",
  "",
  ...publics.map((p) => withTag(`- ${name(p)}, ${blurb(p)}`, p)),
  "",
  "**Private projects**",
  "",
  ...privates.map((p) => `- **${p.name}**, ${blurb(p)}`),
  "",
].join("\n");
readme = replaceBetween(readme, "<!-- repos:start -->", "<!-- repos:end -->", md, "README.md");
writeFileSync("README.md", readme);

// ---------- index.html ----------
let index = read("index.html");
const li = (inner) => `    <li>${inner}</li>`;
const list = (title, items) => [`  <h2>${title}</h2>`, "  <ul>", ...items, "  </ul>"];
const fallback = [
  "",
  ...list("Public sites", sites.map((p) => li(`<a href="${html(p.live)}">${html(p.name)}</a>${p.where ? ` (${html(p.where)})` : ""}`))),
  ...list("Public projects", publics.map((p) => li(`<a href="${html(p.source)}">${html(p.name)}</a>, ${html(blurb(p))}`))),
  ...list("Private projects", privates.map((p) => li(`${html(p.name)}, ${html(blurb(p))}`))),
  "  ",
].join("\n");
index = replaceBetween(index, "<!-- lists:start -->", "<!-- lists:end -->", fallback, "index.html");

// Cache tag: changes whenever a file the page loads from os/ changes.
const hash = createHash("sha256");
for (const f of ["os/os.css", "os/data.js", "os/os.js", "os/zoo.js"]) hash.update(read(f));
const v = hash.digest("hex").slice(0, 10);
index = index.replace(/(\.\/os\/[\w.-]+\.(?:css|js))\?v=[\w-]+/g, `$1?v=${v}`);
writeFileSync("index.html", index);

console.log(`lists rebuilt: ${sites.length} sites, ${publics.length} public, ${privates.length} private; cache v=${v}`);
