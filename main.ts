// main.ts — gta6-clipper-01 v3
// Copies VIDEO.json from the repository root to /output.
// That is all this program does: the house reads the video itself
// through the YouTube Data API.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(repoDir, "out");
const src = join(repoDir, "VIDEO.json");

const parsed = JSON.parse(readFileSync(src, "utf8"));
if (typeof parsed !== "object" || parsed === null || typeof parsed.url !== "string") {
  throw new Error("VIDEO.json must be a JSON object with a string url");
}
if (!/^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}/.test(parsed.url)) {
  throw new Error("VIDEO.json url is not a YouTube video address");
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, "VIDEO.json"));
console.log(`wrote VIDEO.json -> ${join(outDir, "VIDEO.json")}`);
