"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Looping background music with a music-note toggle pinned to the very
 * bottom-left of the screen (a slash crosses the notes when muted).
 *
 * We want the site to open *with* music. Browsers block sound-on autoplay
 * until the user interacts, so we try to autoplay on mount and, if blocked,
 * arm the first user gesture (click / scroll / key / touch) to start it. The
 * first time playback begins we also fire a short synthesized CRT power-on
 * sound, so the page "switches on" like the TV in the hero.
 */
// Mask the note PNG so we can paint it any solid colour (gold fill + black drop).
const NOTE_MASK: CSSProperties = {
  WebkitMaskImage: "url(/media/musical-note.png)",
  maskImage: "url(/media/musical-note.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  // Synthesize a brief CRT "power-on" — a low thump, a high flyback whine and
  // a static click — via the Web Audio API, so it needs no asset.
  const playPowerOn = () => {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AC();
      const now = ctx.currentTime;

      const thump = ctx.createOscillator();
      const tg = ctx.createGain();
      thump.frequency.setValueAtTime(120, now);
      thump.frequency.exponentialRampToValueAtTime(55, now + 0.25);
      tg.gain.setValueAtTime(0.0001, now);
      tg.gain.exponentialRampToValueAtTime(0.45, now + 0.02);
      tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      thump.connect(tg).connect(ctx.destination);
      thump.start(now);
      thump.stop(now + 0.4);

      const whine = ctx.createOscillator();
      const wg = ctx.createGain();
      whine.type = "sine";
      whine.frequency.setValueAtTime(15600, now);
      wg.gain.setValueAtTime(0.0001, now);
      wg.gain.exponentialRampToValueAtTime(0.035, now + 0.05);
      wg.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      whine.connect(wg).connect(ctx.destination);
      whine.start(now);
      whine.stop(now + 0.6);

      const len = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.22, now);
      noise.connect(ng).connect(ctx.destination);
      noise.start(now);

      window.setTimeout(() => ctx.close().catch(() => {}), 1200);
    } catch {
      /* Web Audio unavailable — skip the power-on flourish. */
    }
  };

  const begin = (withPowerOn: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (withPowerOn) playPowerOn();
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;

    const startOnGesture = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      cleanup();
      begin(true);
    };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, startOnGesture));

    // Optimistic autoplay; if the browser allows it, no gesture needed.
    audio
      .play()
      .then(() => {
        startedRef.current = true;
        setPlaying(true);
      })
      .catch(() => {
        events.forEach((e) =>
          window.addEventListener(e, startOnGesture, { passive: true }),
        );
      });

    return cleanup;
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    startedRef.current = true;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      begin(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/media/bg-music.mp4" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mute background music" : "Play background music"}
        aria-pressed={playing}
        title={playing ? "Mute music" : "Play music"}
        className="fixed bottom-3 left-3 z-[70] p-2"
      >
        {/* A single note in the navbar's gold with its hard black drop — a
            black copy of the note offset 3px/3px behind the gold one, exactly
            like the navbar's `text-shadow: 3px 3px 0 #000`. It sits below the
            CRT overlays so the scanlines/static grade it, dances while playing
            and holds still when muted. */}
        <span className="relative flex items-center justify-center">
          <span
            className={`relative block h-7 w-7 ${playing ? "note-dance" : ""}`}
            style={{ "--note-rot": "-8deg", animationDelay: "0s" } as CSSProperties}
          >
            {/* Hard black drop */}
            <span
              aria-hidden
              className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black"
              style={NOTE_MASK}
            />
            {/* Gold note on top */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[#f4c33c]"
              style={NOTE_MASK}
            />
          </span>

          {/* Horizontal slash (slight tilt) through the note when muted */}
          {!playing && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-full bg-[#f4c33c] shadow-[1px_1px_0_#000]"
            />
          )}
        </span>
      </button>
    </>
  );
}
