import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { Video } from "@remotion/media";

/**
 * The Cafe Mama & Sons broadcast hero, rebuilt as a Remotion composition.
 *
 * The hero clip plays full-bleed with a gentle ken-burns push, a warm
 * broadcast grade, an on-air channel bug, and film-style subtitles where the
 * English line and its Tagalog translation rise in together and cross-dissolve
 * to the next caption. Everything is animated from the frame (no CSS
 * animations/transitions — those don't render in Remotion).
 *
 * The site-wide CRT scanlines/static come from <CrtOverlay/> layered over the
 * page, so they are intentionally NOT baked in here.
 */

export type Caption = { en: string; tl: string };

export type HeroBroadcastProps = {
  videoSrc: string;
  captions: Caption[];
};

export const HERO_CAPTIONS: Caption[] = [
  {
    en: "♪ …now showing on channel three ♪",
    tl: "♪ …palabas na ngayon sa channel tres ♪",
  },
  {
    en: "Welcome to Cafe Mama & Sons.",
    tl: "Maligayang pagdating sa Cafe Mama & Sons.",
  },
  {
    en: "Honey Peach Mango. Ube Matcha. Spanish Latté.",
    tl: "Mga paborito: pulot-peach-mangga, ube matcha, Spanish latte.",
  },
  {
    en: "Sandos, meal deals & little Filipino luxuries.",
    tl: "Mga sando, meal deals, at maliliit na luho ng Pinoy.",
  },
  {
    en: "83 Kentish Town Road. Pull up a stripey chair.",
    tl: "83 Kentish Town Road. Umupo ka sa may-guhit na silya.",
  },
];

/** Frames each caption stays fully on screen end-to-end (incl. its fades). */
export const CAPTION_DUR = 110;
/** Cross-dissolve length, in frames, shared by adjacent captions. */
const FADE = 18;
const STEP = CAPTION_DUR - FADE;

/** Total composition length for a given number of captions. */
export const heroDurationInFrames = (captionCount: number) =>
  Math.max(1, captionCount - 1) * STEP + CAPTION_DUR;

const SubtitleLine: React.FC<{ caption: Caption }> = ({ caption }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, FADE, CAPTION_DUR - FADE, CAPTION_DUR],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const y = interpolate(frame, [0, FADE], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const shadow =
    "0 0 2px rgba(0,0,0,0.9), 1px 1px 0 #000, -1px 1px 0 #000";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "5%",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ maxWidth: "78%", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontFamily:
              'var(--font-body), system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#fdf6dd",
            textShadow: shadow,
            fontSize: "min(3.6vw, 40px)",
            lineHeight: 1.25,
            textWrap: "balance",
          }}
        >
          {caption.en}
        </p>
        <p
          style={{
            margin: "0.4em 0 0",
            fontFamily:
              'var(--font-body), system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            fontStyle: "italic",
            letterSpacing: "0.02em",
            color: "#f6c6ab",
            textShadow: shadow,
            fontSize: "min(2.7vw, 28px)",
            lineHeight: 1.25,
            textWrap: "balance",
          }}
        >
          {caption.tl}
        </p>
      </div>
    </AbsoluteFill>
  );
};

const ChannelBug: React.FC = () => {
  const frame = useCurrentFrame();
  // On-air dot blinks ~ twice a second without a CSS animation.
  const dot = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;
  return (
    <div
      style={{
        position: "absolute",
        top: "4.5%",
        left: "4%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: '"Arial Black", Arial, sans-serif',
        fontWeight: 900,
        fontSize: "min(1.5vw, 16px)",
        letterSpacing: "0.18em",
        color: "#f4c33c",
        textShadow: "2px 2px 0 #000",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#e23b2e",
          opacity: dot,
          boxShadow: "0 0 6px rgba(226,59,46,0.9)",
        }}
      />
      CH 03 · LIVE
    </div>
  );
};

export const HeroBroadcast: React.FC<HeroBroadcastProps> = ({
  videoSrc,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow ken-burns push across the whole hero.
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.16], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Video
          src={videoSrc}
          muted
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Warm broadcast grade — subtle so the picture still reads clearly. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      {/* Sun glow rising behind the broadcast. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(40% 40% at 50% 36%, rgba(240,169,43,0.28) 0%, rgba(232,155,118,0.18) 45%, transparent 70%)",
        }}
      />

      <ChannelBug />

      {captions.map((caption, i) => (
        <Sequence
          key={i}
          from={i * STEP}
          durationInFrames={CAPTION_DUR}
          layout="none"
        >
          <SubtitleLine caption={caption} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const heroDefaultProps: HeroBroadcastProps = {
  videoSrc: staticFile("media/hero-draft3.mp4"),
  captions: HERO_CAPTIONS,
};