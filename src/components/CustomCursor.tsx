"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Custom cursor — a cartoon hand that follows the pointer. At rest it shows the
 * open hand (frame 1); pressing the mouse runs it through frames 1→5 (a grab),
 * and releasing runs it back 5→1. Lives at the top level (outside ScrollSmoother)
 * so fixed positioning maps to the viewport. Fine-pointer / hover devices only;
 * the native cursor is hidden via the `has-custom-cursor` class on <html>.
 */
const FRAMES = [1, 2, 3, 4, 5].map((n) => `/media/cursor/hand${n}.png`);

export default function CustomCursor() {
  const handRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState(1); // 1..5
  const frameRef = useRef(1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useGSAP(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const hand = handRef.current!;
    document.documentElement.classList.add("has-custom-cursor");

    // preload the frames so the grab animation never flickers
    FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // scaleX:-1 mirrors the hand across a vertical line (faces right→left).
    gsap.set(hand, { xPercent: -50, yPercent: -50, scaleX: -1, autoAlpha: 0 });
    const qx = gsap.quickTo(hand, "x", { duration: 0.06, ease: "power3" });
    const qy = gsap.quickTo(hand, "y", { duration: 0.06, ease: "power3" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(hand, { autoAlpha: 1, duration: 0.15 });
      }
      qx(e.clientX);
      qy(e.clientY);
    };
    const hide = () => {
      shown = false;
      gsap.to(hand, { autoAlpha: 0, duration: 0.15 });
    };

    // step the frame toward `target` (1 = open, 5 = grabbed)
    const animateTo = (target: number) => {
      if (animRef.current) clearInterval(animRef.current);
      animRef.current = setInterval(() => {
        const cur = frameRef.current;
        if (cur === target) {
          if (animRef.current) clearInterval(animRef.current);
          animRef.current = null;
          return;
        }
        const next = cur < target ? cur + 1 : cur - 1;
        frameRef.current = next;
        setFrame(next);
      }, 28);
    };
    const down = () => animateTo(5);
    const up = () => animateTo(1);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      if (animRef.current) clearInterval(animRef.current);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={handRef}
      aria-hidden
      alt=""
      src={`/media/cursor/hand${frame}.png`}
      draggable={false}
      className="pointer-events-none fixed left-0 top-0 z-[9999] w-12 opacity-0 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
    />
  );
}
