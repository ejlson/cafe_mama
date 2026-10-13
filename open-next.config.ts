// OpenNext turns the Next build into the Cloudflare Worker.
//
// Cloudflare's build runs `npm run build`, then `npx wrangler deploy`, which
// sees this file and calls `opennextjs-cloudflare deploy` — and that only
// deploys a Worker that `opennextjs-cloudflare build` already made. So
// `npm run build` IS the OpenNext build, and the Next half of it (the CMS
// pull, then `next build`) is `npm run build:next`, named here so the two do
// not call each other in a loop.
//
// @opennextjs/cloudflare is pinned in package.json: 1.20.11 needs
// Next >=16.3.8 and crashed this site on 16.2.11 (error 1101, 13 Oct 2026).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({
    // For best results consider enabling R2 caching
    // See https://opennext.js.org/cloudflare/caching for more details
  }),
  buildCommand: "npm run build:next",
};
