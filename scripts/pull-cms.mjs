// Pull the blog and the menus from the Maginhawa Group's CMS, before
// `next dev` and `next build`.
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
// Since 2026-11-23 the Food and Drinks menus are edited there too: the
// documents menu-cafemama-food and menu-cafemama-drinks. They are saved,
// with their dish photos, into src/lib/menu.snapshot.json and
// public/cms-menu, which ARE committed (unlike the blog's copy), so the site
// always has a menu to build from; src/lib/menu-data.ts reads the snapshot.
//
// It only downloads from Sanity's own image host for this project, only
// WebP/JPEG, only up to MAX_BYTES, never follows a redirect, and names files
// after Sanity's content hash, so nothing typed in the Studio can choose a
// URL to fetch or a path to write.
//
//   node scripts/pull-cms.mjs          fails loudly (the build)
//   node scripts/pull-cms.mjs --dev    keeps the last snapshot if offline
//   SKIP_CMS_PULL=1 ...                asks the CMS nothing and builds from
//                                      the snapshots already on disk
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import cms from "../src/lib/cms.json" with { type: "json" };

const DEV = process.argv.includes("--dev");
const SKIP = process.env.SKIP_CMS_PULL === "1";
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

const MENUS = cms.menus;
const MENU_IMAGE_DIR = path.join(ROOT, MENUS.imageDir);
const MENU_WORK_DIR = `${MENU_IMAGE_DIR}.partial`;
const MENU_SNAPSHOT = path.join(ROOT, MENUS.snapshot);

async function query(groq, params) {
  const url = new URL(
    `https://${cms.project}.api.sanity.io/v${cms.apiVersion}/data/query/${cms.dataset}`,
  );
  url.searchParams.set("query", groq);
  url.searchParams.set("perspective", "published");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
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

// Blog photos are resized to WebP at the widest the blog shows them. Dish
// photos (`original`) keep the size and format they were uploaded in, unless
// wider than WIDE. (Sanity's CDN re-encodes even then, rotating by EXIF, so
// the file is not the upload byte for byte, but looks the same.)
async function download(asset, { workDir = WORK_DIR, imagePath = cms.imagePath, original = false } = {}) {
  const width = Math.min(WIDE, asset.w); // never upscale
  const keep = original && asset.w <= WIDE;
  const url = keep
    ? asset.url
    : `${asset.url}?${new URLSearchParams({ w: String(width), fm: "webp", q: "80" })}`;
  const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`pull-cms: ${res.status} for ${url}`);
  const ext = TYPES[(res.headers.get("content-type") ?? "").split(";")[0]];
  if (!ext) throw new Error(`pull-cms: ${url} is ${res.headers.get("content-type")}, not WebP/JPEG`);
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > MAX_BYTES) throw new Error(`pull-cms: ${url} is ${body.length} bytes`);
  const file = keep ? `${hashOf(asset)}.${ext}` : `${hashOf(asset)}-${width}.${ext}`;
  await fs.writeFile(path.join(workDir, file), body);
  return `${imagePath}/${file}`;
}

async function pull() {
  const posts = await query(cms.query, { site: cms.site });
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

/* ---- Menus ---- */

const isStr = (v) => typeof v === "string";
const optStr = (v) => v == null || isStr(v);

// Everything menu-data.ts relies on, checked before anything is written, so
// a menu the site cannot show stops the build instead of reaching visitors.
function checkMenu(id, doc) {
  const fail = (what) => {
    throw new Error(`pull-cms: menu "${id}" ${what}`);
  };
  if (!doc) fail("is not published in the CMS.");
  if (doc.restaurant !== cms.site) fail(`belongs to "${doc.restaurant}", not "${cms.site}".`);
  if (!Array.isArray(doc.sections) || doc.sections.length === 0) fail("has no sections.");
  doc.sections.forEach((s, si) => {
    const where = `section ${si + 1} (${JSON.stringify(s?.title)})`;
    if (!isStr(s?.title) || !s.title.trim()) fail(`${where} has no heading.`);
    if (!optStr(s.intro)) fail(`${where} has a malformed intro.`);
    if (!Array.isArray(s.items)) fail(`${where} has no dishes.`);
    s.items.forEach((i, ii) => {
      const dish = `${where}, dish ${ii + 1} (${JSON.stringify(i?.name)})`;
      if (!isStr(i?.name) || !i.name.trim()) fail(`${dish} has no name.`);
      if (!isStr(i.price) || !i.price.trim()) fail(`${dish} has no price.`);
      if (!optStr(i.description) || !optStr(i.allergens)) fail(`${dish} has a malformed field.`);
      if (i.hide != null && typeof i.hide !== "boolean") fail(`${dish} has a malformed "hide".`);
      // A photo with no image is no photo: removing an image in the Studio
      // keeps its alt text behind, and that must not stop every build.
      if (i.photo?.asset) hashOf(i.photo.asset); // the id and host checks
    });
  });
}

async function pullMenus() {
  const docs = await query(MENUS.query, { ids: MENUS.ids });
  if (!Array.isArray(docs)) throw new Error("pull-cms: the menu query returned no list.");
  const byId = new Map(docs.map((d) => [d._id, d]));
  for (const id of MENUS.ids) checkMenu(id, byId.get(id));

  await fs.rm(MENU_WORK_DIR, { recursive: true, force: true });
  await fs.mkdir(MENU_WORK_DIR, { recursive: true });

  const saved = new Map();
  const menus = {};
  for (const id of MENUS.ids) {
    const doc = byId.get(id);
    const sections = [];
    for (const s of doc.sections) {
      const items = [];
      for (const i of s.items) {
        /* A dish ticked "Hide for now" never reaches the snapshot, nor its
           photo the site: both are committed, and the menu ships in the
           page's public JavaScript, where a hidden dish would be readable. */
        if (i.hide) continue;
        const a = i.photo?.asset;
        if (a && !saved.has(a._id)) {
          saved.set(
            a._id,
            await download(a, { workDir: MENU_WORK_DIR, imagePath: MENUS.imagePath, original: true }),
          );
        }
        // Only the fields that are set, so the snapshot reads like the menu.
        items.push({
          name: i.name,
          price: i.price,
          ...(i.description ? { description: i.description } : {}),
          ...(i.allergens ? { allergens: i.allergens } : {}),
          ...(a ? { photo: { src: saved.get(a._id), alt: i.photo.alt ?? "" } } : {}),
        });
      }
      if (items.length) sections.push({ title: s.title, ...(s.intro ? { intro: s.intro } : {}), items });
    }
    menus[id] = { restaurant: doc.restaurant, title: doc.title, sections };
  }

  await fs.rm(MENU_IMAGE_DIR, { recursive: true, force: true });
  await fs.rename(MENU_WORK_DIR, MENU_IMAGE_DIR);
  // No timestamp: the file is committed, and only a menu change should
  // change it.
  await fs.writeFile(MENU_SNAPSHOT, JSON.stringify({ menus }, null, 2) + "\n");
  console.log(`pull-cms: ${MENUS.ids.length} menus, ${saved.size} photos -> ${MENUS.imageDir}`);
}

async function run(what, step, snapshot) {
  try {
    await step();
  } catch (err) {
    // Offline on a laptop is not a reason to refuse to start the dev server
    // when there is a previous snapshot. A build never gets this pass.
    if (DEV && existsSync(snapshot)) {
      console.warn(`pull-cms: could not pull the ${what}, using the last snapshot.\n  ${err.message}`);
    } else {
      throw err;
    }
  }
}

if (SKIP) {
  const missing = [SNAPSHOT, MENU_SNAPSHOT].filter((f) => !existsSync(f));
  if (missing.length) {
    throw new Error(
      `pull-cms: SKIP_CMS_PULL=1 but there is no snapshot at ${missing.map((f) => path.relative(ROOT, f)).join(", ")}.`,
    );
  }
  console.log("pull-cms: SKIP_CMS_PULL=1, building from the snapshots on disk.");
} else {
  await run("blog", pull, SNAPSHOT);
  await run("menus", pullMenus, MENU_SNAPSHOT);
}
