"use client";

import dynamic from "next/dynamic";
import type { Caption } from "@/remotion/HeroBroadcast";

/**
 * Full-screen sticky broadcast hero, powered by a Remotion composition played
 * live through @remotion/player.
 *
 * The Player accesses `window` on mount, so the actual player is loaded with
 * `ssr: false`. That dynamic import is only allowed inside a Client Component
 * in the App Router, which is why this thin wrapper carries "use client".
 */
const RemotionHeroInner = dynamic(() => import("./RemotionHeroInner"), {
  ssr: false,
  loading: () => null,
});

export default function RemotionHero({
  videoSrc,
  captions,
}: {
  videoSrc?: string;
  captions?: Caption[];
}) {
  return (
    <section
      id="top"
      className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden bg-black"
    >
      <div className="power-on absolute inset-0">
        <RemotionHeroInner videoSrc={videoSrc} captions={captions} />
      </div>
    </section>
  );
}
