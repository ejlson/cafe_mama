"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Focus mode — a WordArt toggle (above the clock) brings up the video in the
 * bottom-left corner at its native aspect ratio. The video carries its own
 * audio. The panel can be dragged anywhere on screen; a play/pause button
 * overlays it.
 */
const VIDEO_URL = "/media/0615.mp4";

export default function FocusMode() {
  const [on, setOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const toggle = () => {
    if (on) {
      setOn(false);
    } else {
      setPaused(false);
      setPos({ x: 0, y: 0 });
      setOn(true);
    }
  };

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  // Drag the panel around — but not when the press lands on a control.
  const onDown = (e: React.PointerEvent) => {
    if (e.target instanceof Element && e.target.closest("button")) return;
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    setPos({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) });
  };
  const onUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Play (with sound) when focus mode opens — the toggle click is the user
  // gesture that lets it autoplay unmuted.
  useEffect(() => {
    if (on) videoRef.current?.play().catch(() => {});
  }, [on]);

  return (
    <>
      {/* toggle — classic WordArt, sits above the watch in the bottom-right stack */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Exit focus mode" : "Focus mode"}
        className="fixed bottom-[17rem] right-6 z-[56] flex w-28 select-none justify-center transition-transform hover:-translate-y-0.5 active:scale-95 sm:bottom-[19rem] sm:w-32"
      >
        <span
          className="wordart-3d text-3xl sm:text-4xl"
          data-text={on ? "EXIT" : "FOCUS"}
        >
          {on ? "EXIT" : "FOCUS"}
        </span>
      </button>

      {/* draggable video panel — native aspect ratio, bottom-left to start */}
      {on && (
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className="fixed bottom-4 left-4 z-[80] w-48 cursor-grab touch-none overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] active:cursor-grabbing sm:w-72"
        >
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="pointer-events-none block h-auto w-full"
            loop
            autoPlay
            playsInline
          />

          {/* play / pause (doesn't start a drag) */}
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? "Play" : "Pause"}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition-transform hover:scale-110"
          >
            {paused ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );
}
