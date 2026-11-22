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
// Extract the 11-char video id from a YouTube address, or throw a
// specific error naming what is wrong. The old check only tested that
// the url *started* with a valid prefix + 11 id chars, so it accepted
// a 12-char id, trailing path junk (…/shorts/<id>/extra), and gave one
// generic error for every failure. This version anchors the whole url,
// requires the id to be exactly 11 chars, and only allows a query
// string or fragment after it (e.g. ?si=… or ?feature=share).
function extractVideoId(url) {
  const m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?#].*)?$/.exec(url);
  if (!m) {
    if (!/^https:\/\//.test(url)) {
      throw new Error(`VIDEO.json url must start with https:// — got ${JSON.stringify(url)}`);
    }
    if (!/(?:youtube\.com|youtu\.be)/.test(url)) {
      throw new Error(`VIDEO.json url must be a youtube.com or youtu.be address — got ${JSON.stringify(url)}`);
    }
    throw new Error(
      `VIDEO.json url is not a YouTube video address (expected shorts/<11-char id>, watch?v=<11-char id> or youtu.be/<11-char id>) — got ${JSON.stringify(url)}`,
    );
  }
  return m[1];
}

const videoId = extractVideoId(parsed.url);

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, "VIDEO.json"));
console.log(`wrote VIDEO.json -> ${join(outDir, "VIDEO.json")} (video ${videoId})`);
