// Pull the blog from the Maginhawa Group's CMS, before `next dev` and
// `next build`.
//
// Since 2026-10-13 Cafe Mama & Sons' blog posts are edited in the group's
// shared Sanity Studio (github.com/ejlson/maginhawa-cms): posts of kind
// "Our own post" tagged Café Mama & Sons. This asks for them, saves each
// photo into public/cms, and writes src/lib/cms-blog.json, which
// src/lib/blog.ts imports. So:
//
// - visitors are served every word and photo from this site's own hosting
//   and never touch Sanity, so traffic cannot use up the CMS's free
//   allowance, and nothing in the built pages names the project
// - the photos stay off Cloudinary (the free account shared with the group
//   website): cldUrl() leaves any path not in its manifest local
//
// It only downloads from Sanity's own image host for this project, only
// WebP/JPEG, only up to MAX_BYTES, never follows a redirect, and names files
// after Sanity's content hash, so nothing typed in the Studio can choose a
// URL to fetch or a path to write.
//
//   node scripts/pull-cms.mjs          fails loudly (the build)
//   node scripts/pull-cms.mjs --dev    keeps the last snapshot if offline
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import cms from "../src/lib/cms.json" with { type: "json" };

const DEV = process.argv.includes("--dev");
const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGE_DIR = path.join(ROOT, cms.imageDir);
// Photos land here and are swapped in only once every one has arrived, so a
// pull that fails halfway leaves the last good set alone.
const WORK_DIR = `${IMAGE_DIR}.partial`;
const SNAPSHOT = path.join(ROOT, cms.snapshot);
const CDN = `https://cdn.sanity.io/images/${cms.project}/${cms.dataset}/`;
const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = { "image/webp": "webp", "image/jpeg": "jpg" };
// The widest the blog ever shows a photo (the featured card asks for 1400).
const WIDE = 1400;

async function query() {
  const url = new URL(
    `https://${cms.project}.api.sanity.io/v${cms.apiVersion}/data/query/${cms.dataset}`,
  );
  url.searchParams.set("query", cms.query);
  url.searchParams.set("perspective", "published");
  url.searchParams.set("$site", JSON.stringify(cms.site));
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  return (await res.json()).result;
}

// "image-374db48…-1600x1067-jpg" -> "374db48…". Anything else is refused.
function hashOf(asset) {
  const m = /^image-([a-f0-9]{20,64})-\d+x\d+-[a-z]+$/.exec(asset?._id ?? "");
  if (!m) throw new Error(`pull-cms: unexpected image id ${JSON.stringify(asset?._id)}`);
  if (!asset.url?.startsWith(CDN)) throw new Error(`pull-cms: image not on ${CDN}: ${asset.url}`);
  return m[1];
}

async function download(asset) {
  const width = Math.min(WIDE, asset.w); // never upscale
  const url = `${asset.url}?${new URLSearchParams({ w: String(width), fm: "webp", q: "80" })}`;
  const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`pull-cms: ${res.status} for ${url}`);
  const ext = TYPES[(res.headers.get("content-type") ?? "").split(";")[0]];
  if (!ext) throw new Error(`pull-cms: ${url} is ${res.headers.get("content-type")}, not WebP/JPEG`);
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > MAX_BYTES) throw new Error(`pull-cms: ${url} is ${body.length} bytes`);
  const file = `${hashOf(asset)}-${width}.${ext}`;
  await fs.writeFile(path.join(WORK_DIR, file), body);
  return `${cms.imagePath}/${file}`;
}

async function pull() {
  const posts = await query();
  await fs.rm(WORK_DIR, { recursive: true, force: true });
  await fs.mkdir(WORK_DIR, { recursive: true });

  const saved = new Map();
  for (const p of posts) {
    const a = p.image?.asset;
    if (!a) throw new Error(`pull-cms: "${p.title}" has no main photo.`);
    if (!saved.has(a._id)) saved.set(a._id, await download(a));
    p.image = { alt: p.image.alt ?? "", src: saved.get(a._id) };
  }

  await fs.rm(IMAGE_DIR, { recursive: true, force: true });
  await fs.rename(WORK_DIR, IMAGE_DIR);
  await fs.writeFile(
    SNAPSHOT,
    JSON.stringify({ pulledAt: new Date().toISOString(), posts }, null, 2) + "\n",
  );
  console.log(`pull-cms: ${posts.length} posts, ${saved.size} photos -> ${cms.imageDir}`);
}

try {
  await pull();
} catch (err) {
  // Offline on a laptop is not a reason to refuse to start the dev server
  // when there is a previous snapshot. A build never gets this pass.
  if (DEV && existsSync(SNAPSHOT)) {
    console.warn(`pull-cms: could not reach the CMS, using the last snapshot.\n  ${err.message}`);
  } else {
    throw err;
  }
}
