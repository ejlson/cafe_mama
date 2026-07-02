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

// Music volume — audible over ambient chatter, still quiet enough to talk
// over. 0.15 (the previous value) read as "did it even start?" for most
// listeners.
const MUSIC_VOLUME = 0.35;

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  // Tracks the user's intent — muted or playing. The audio's `paused` flag
  // isn't a reliable source of truth: browsers can pause the track on their
  // own (tab hidden, media session interrupt, buffering stall) and we want
  // to resume once the interruption is over.
  const wantsPlayingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  // Synthesize a brief CRT "power-on" — a low thump, a high flyback whine and
  // a static click — via the Web Audio API, so it needs no asset. Gains have
  // been dialled DOWN from earlier so the music (which starts at the same
  // instant) isn't masked for the first half-second of playback.
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
      tg.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      thump.connect(tg).connect(ctx.destination);
      thump.start(now);
      thump.stop(now + 0.4);

      const whine = ctx.createOscillator();
      const wg = ctx.createGain();
      whine.type = "sine";
      whine.frequency.setValueAtTime(15600, now);
      wg.gain.setValueAtTime(0.0001, now);
      wg.gain.exponentialRampToValueAtTime(0.015, now + 0.05);
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
      ng.gain.setValueAtTime(0.09, now);
      noise.connect(ng).connect(ctx.destination);
      noise.start(now);

      window.setTimeout(() => ctx.close().catch(() => {}), 1200);
    } catch {
      /* Web Audio unavailable — skip the power-on flourish. */
    }
  };

  // Try to play the audio. Waits until the element has at least
  // HAVE_FUTURE_DATA (readyState 3) so .play() doesn't stall on a large,
  // still-buffering file. Returns whether play actually started.
  const tryPlay = async (audio: HTMLAudioElement): Promise<boolean> => {
    if (audio.readyState < 3) {
      await new Promise<void>((resolve) => {
        const on = () => {
          audio.removeEventListener("canplay", on);
          resolve();
        };
        audio.addEventListener("canplay", on, { once: true });
        // safety timeout so we don't hang forever if the file never buffers
        window.setTimeout(() => {
          audio.removeEventListener("canplay", on);
          resolve();
        }, 4000);
      });
    }
    try {
      await audio.play();
      return !audio.paused;
    } catch {
      return false;
    }
  };

  const begin = async (withPowerOn: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    wantsPlayingRef.current = true;
    if (withPowerOn) playPowerOn();
    const ok = await tryPlay(audio);
    setPlaying(ok);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = MUSIC_VOLUME;

    const startOnGesture = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      cleanup();
      await begin(true);
    };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, startOnGesture));

    // Optimistic autoplay. Waits for the file to be playable so a slow first
    // byte doesn't make it look like the music never started.
    (async () => {
      const ok = await tryPlay(audio);
      if (ok) {
        startedRef.current = true;
        wantsPlayingRef.current = true;
        setPlaying(true);
      } else {
        events.forEach((e) =>
          window.addEventListener(e, startOnGesture, { passive: true }),
        );
      }
    })();

    // Auto-resume if the browser silently pauses the track (media session
    // interrupt, tab returning from background, buffer stall, another page
    // grabbing the audio focus). We only resume if the user hasn't muted.
    const onPause = () => {
      if (!wantsPlayingRef.current) return;
      // Give the browser a beat before re-firing play — some pause events
      // are immediately followed by an internal resume, and stacking .play()
      // on top can throw AbortError.
      window.setTimeout(() => {
        if (!wantsPlayingRef.current) return;
        audio.play().catch(() => {});
      }, 200);
    };
    const onPlay = () => setPlaying(true);
    const onEnded = () => {
      // loop=true should keep it looping, but if a browser ever drops out,
      // re-seek and go again.
      if (!wantsPlayingRef.current) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);

    return () => {
      cleanup();
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    startedRef.current = true;
    if (playing) {
      wantsPlayingRef.current = false;
      audio.pause();
      setPlaying(false);
    } else {
      begin(false);
    }
  };

  return (
    <>
      {/* Served from /public directly so we always play the newest bounce of
          the track — the Cloudinary-hosted copy can lag behind local edits. */}
      <audio ref={audioRef} src="/media/videoplayback.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mute background music" : "Play background music"}
        aria-pressed={playing}
        title={playing ? "Mute music" : "Play music"}
        // z-[90] sits above the FocusMode video panel (z-[80]) so the note
        // stays visible when Focus Mode is toggled on — otherwise the panel's
        // bottom-left position at bottom-4 left-4 covers the toggle.
        className="fixed bottom-3 left-3 z-[90] p-2"
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
