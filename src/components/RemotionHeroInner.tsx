"use client";

import { Player } from "@remotion/player";
import {
  HeroBroadcast,
  HERO_CAPTIONS,
  heroDurationInFrames,
  type Caption,
} from "@/remotion/HeroBroadcast";
import { cldUrl } from "@/lib/cloudinary";

const DEFAULT_VIDEO_SRC = cldUrl("/media/hero-draft3-web.mp4");

/**
 * Live in-browser playback of the Remotion hero via @remotion/player.
 *
 * The composition is 1920×1080. To fill the full-screen sticky hero the way
 * the old <video object-cover> did, the Player is dropped into a 16:9 box that
 * is at least as large as the viewport in both axes and centred — the
 * overflow-hidden <section> then clips it, giving true "cover" behaviour with
 * no letterboxing.
 *
 * This component is loaded with `ssr: false` (see RemotionHero) because the
 * Player touches `window` on mount.
 */
export default function RemotionHeroInner({
  videoSrc = DEFAULT_VIDEO_SRC,
  captions = HERO_CAPTIONS,
}: {
  videoSrc?: string;
  captions?: Caption[];
}) {
  return (
    <div className="absolute left-1/2 top-1/2 aspect-video min-h-full min-w-full -translate-x-1/2 -translate-y-1/2">
      <Player
        component={HeroBroadcast}
        inputProps={{ videoSrc, captions }}
        durationInFrames={heroDurationInFrames(captions.length)}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        loop
        autoPlay
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
