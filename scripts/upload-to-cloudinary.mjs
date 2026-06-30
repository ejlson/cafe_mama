// Mirror /public into Cloudinary under the `cafemama/` folder and write a
// manifest mapping each local URL path (e.g. "/media/shopfront.jpg") to its
// Cloudinary delivery URL. The site reads the manifest via src/lib/cloudinary.ts.
//
// Run with:  node --env-file=.env.local scripts/upload-to-cloudinary.mjs
//
// Idempotent: existing assets are overwritten by public_id, so re-running just
// refreshes/adds new files. Pass --dry-run to print without uploading.

import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "public");
const MANIFEST_PATH = path.resolve(process.cwd(), "src/lib/cld-manifest.json");
const FOLDER = "cafemama";
const CONCURRENCY = 6;
const DRY_RUN = process.argv.includes("--dry-run");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".aac"]);
const RAW_EXT = new Set([".pdf"]);

if (!process.env.CLOUDINARY_URL) {
  console.error("CLOUDINARY_URL is not set. Add it to .env.local.");
  process.exit(1);
}
cloudinary.config({ secure: true });

function classify(ext) {
  const e = ext.toLowerCase();
  if (IMAGE_EXT.has(e)) return "image";
  if (VIDEO_EXT.has(e) || AUDIO_EXT.has(e)) return "video";
  if (RAW_EXT.has(e)) return "raw";
  return null;
}

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (entry.isFile()) acc.push(full);
  }
  return acc;
}

// Cloudinary public_ids can contain letters, numbers, dashes, underscores,
// slashes (for folders), and dots, but spaces and most punctuation break the
// URL. Normalize to a safe slug while keeping the folder shape.
function toPublicId(relPath) {
  const noExt = relPath.replace(/\.[^./]+$/, "");
  return noExt
    .split("/")
    .map((seg) =>
      seg
        .normalize("NFKD")
        .replace(/[^A-Za-z0-9._-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, ""),
    )
    .filter(Boolean)
    .join("/");
}

async function uploadOne(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join("/");
  const ext = path.extname(rel);
  const kind = classify(ext);
  if (!kind) return null;

  const publicId = `${FOLDER}/${toPublicId(rel)}`;
  const urlPath = `/${rel}`; // what the site uses today

  if (DRY_RUN) {
    console.log(`[dry] ${kind.padEnd(5)} ${urlPath}  ->  ${publicId}${ext}`);
    return { urlPath, kind, publicId, ext };
  }

  try {
    // The free plan caps single-shot uploads at 10MB. Use the chunked
    // upload_large path for videos and any oversize file so the hero clip
    // and big stills both go through.
    const stat = await fs.stat(absPath);
    const useChunked = kind === "video" || stat.size > 9.5 * 1024 * 1024;
    const upload = useChunked
      ? (path, opts) =>
          new Promise((resolve, reject) =>
            cloudinary.uploader.upload_large(path, opts, (err, res) =>
              err ? reject(err) : resolve(res),
            ),
          )
      : cloudinary.uploader.upload;
    const res = await upload(absPath, {
      public_id: publicId,
      resource_type: kind,
      overwrite: true,
      invalidate: true,
      use_filename: false,
      unique_filename: false,
      ...(useChunked ? { chunk_size: 6 * 1024 * 1024 } : {}),
    });
    const deliveryUrl = res.secure_url;
    console.log(`ok  ${urlPath}  ->  ${deliveryUrl}`);
    return {
      urlPath,
      kind,
      publicId: res.public_id,
      ext: `.${res.format ?? ext.slice(1)}`,
      width: res.width,
      height: res.height,
      url: deliveryUrl,
    };
  } catch (err) {
    console.error(`FAIL ${urlPath}: ${err?.message ?? err}`);
    return null;
  }
}

async function runPool(items, fn, n) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        results[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return results;
}

// --only <substring> uploads just paths matching a substring (useful for
// re-pushing one file after compressing it locally, without re-uploading
// everything else).
const onlyIdx = process.argv.indexOf("--only");
const onlyFilter = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

let all = (await walk(ROOT)).sort();
if (onlyFilter) {
  all = all.filter((p) => p.includes(onlyFilter));
  console.log(`--only "${onlyFilter}" matched ${all.length} files`);
} else {
  console.log(`Scanned ${all.length} files in /public`);
}
const results = (await runPool(all, uploadOne, CONCURRENCY)).filter(Boolean);

// Merge into any existing manifest so partial re-uploads (e.g. --only) don't
// drop entries from earlier full runs.
let existingAssets = {};
try {
  const prev = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  existingAssets = prev.assets ?? {};
} catch {
  /* first run — no manifest yet */
}

const newAssets = Object.fromEntries(
  results.map((r) => [
    r.urlPath,
    {
      kind: r.kind,
      publicId: r.publicId,
      ext: r.ext,
      ...(r.width ? { width: r.width, height: r.height } : {}),
    },
  ]),
);

const mergedAssets = Object.fromEntries(
  Object.entries({ ...existingAssets, ...newAssets }).sort(([a], [b]) =>
    a.localeCompare(b),
  ),
);

const manifest = {
  generatedAt: new Date().toISOString(),
  cloudName: cloudinary.config().cloud_name,
  folder: FOLDER,
  assets: mergedAssets,
};

if (!DRY_RUN) {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Wrote manifest: ${results.length} new/updated, ${Object.keys(mergedAssets).length} total -> ${MANIFEST_PATH}`,
  );
} else {
  console.log(`[dry] Would upload ${results.length} files.`);
}
