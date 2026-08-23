import { access, readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoredDirectories = new Set([".git", ".next", "node_modules", "dist", "coverage"]);
const forbiddenPlaceholders = [
  "YOUR_ORG",
  "trendshift.io/repositories/22628",
  "npm install -g aimix",
  "npx aimix",
  "9r_your_key",
  "aimix.com/docs",
  "NEXT_PUBLIC_BASE_URLhttp",
  "POST httplocalhost",
];

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if ([".md", ".mdx"].includes(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const failures = [];
const files = await collect(root);
for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const placeholder of forbiddenPlaceholders) {
    if (content.includes(placeholder)) failures.push(`${file}: forbidden placeholder '${placeholder}'`);
  }

  const links = content.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g);
  for (const match of links) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (!rawTarget || rawTarget.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(rawTarget)) continue;
    const target = decodeURIComponent(rawTarget.split("#", 1)[0].split("?", 1)[0]);
    if (!target || target.includes("<") || target.includes(">")) continue;
    let absolute = resolve(dirname(file), target);
    const gitbookRoot = join(root, "gitbook", "content");
    if (file.startsWith(gitbookRoot) && target.startsWith("/")) {
      const language = file.slice(gitbookRoot.length + 1).split(/[\\/]/, 1)[0];
      absolute = resolve(gitbookRoot, language, target.slice(1));
    }
    if (!await exists(absolute)) failures.push(`${file}: broken relative link '${rawTarget}'`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed (${files.length} Markdown files).`);
}
