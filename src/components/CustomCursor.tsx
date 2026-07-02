"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP);

/**
 * Custom cursor — a cartoon hand that follows the pointer. At rest it shows
 * the open Mickey-glove hand (frame 1); pressing the mouse runs it through
 * frames 1→5 (a grab) and releasing runs it back 5→1. Over a <button> or
 * anything tagged with `data-cursor-target`, the cursor swaps to the
 * pointing-finger press cursor (its own 1→5 click animation). Lives at the
 * top level (outside ScrollSmoother) so fixed positioning maps to the
 * viewport. Fine-pointer / hover devices only; the native cursor is hidden
 * via the `has-custom-cursor` class on <html>.
 */
const HAND_FRAMES = [1, 2, 3, 4, 5].map((n) => `/media/cursor/hand${n}.png`);
const PRESS_FRAMES = [1, 2, 3, 4, 5].map((n) => `/media/cursor/press${n}.png`);
const PRESS_REST = 1;
const PRESS_PRESSED = 5;
const TARGET_SELECTOR = "button, a[href], [data-cursor-target]";

export default function CustomCursor() {
  const handRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState(1); // 1..5 (hand grab)
  const [pressFrame, setPressFrame] = useState(PRESS_REST); // 1..5 (poke click)
  const [over, setOver] = useState(false);
  const frameRef = useRef(1);
  const pressFrameRef = useRef(PRESS_REST);
  const overRef = useRef(false);
  const pressModeRef = useRef<"none" | "grab" | "poke">("none");
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastClientY = useRef<number | null>(null);
  const smoothedDy = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useGSAP(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const hand = handRef.current!;
    document.documentElement.classList.add("has-custom-cursor");

    // Preload every frame so neither animation flickers. Must preload the
    // SAME Cloudinary URLs the <img> renders with — preloading the raw local
    // paths 404s in production (/public/media is gitignored) and leaves the
    // real frames loading cold on first hover.
    [...HAND_FRAMES, ...PRESS_FRAMES].forEach((src) => {
      const img = new Image();
      img.src = cldUrl(src);
    });

    const setOverMode = (hit: boolean) => {
      if (overRef.current === hit) return;
      overRef.current = hit;
      setOver(hit);
      gsap.killTweensOf(hand, "scale,scaleX,scaleY,xPercent,yPercent");
      // Hand image is mirrored (scaleX:-1) and centered (-50%/-50%) on the
      // pointer. The press cursor is un-mirrored and anchored at the actual
      // fingertip pixel (~35%, ~7% of the cropped image) so the tip sits on
      // the pointer. transformOrigin matches that anchor so the tilt
      // rotation pivots around the click point.
      gsap.set(hand, {
        scaleX: hit ? 1 : -1,
        scaleY: 1,
        xPercent: hit ? -35 : -50,
        yPercent: hit ? -7 : -50,
        transformOrigin: hit ? "35% 7%" : "50% 50%",
      });
    };

    // scaleX:-1 mirrors the hand across a vertical line (faces right→left).
    gsap.set(hand, {
      xPercent: -50,
      yPercent: -50,
      scaleX: -1,
      autoAlpha: 0,
      transformOrigin: "50% 50%",
    });
    // Tight position-tracking so the cursor never visibly lags the pointer.
    const qx = gsap.quickTo(hand, "x", { duration: 0.02, ease: "power1" });
    const qy = gsap.quickTo(hand, "y", { duration: 0.02, ease: "power1" });
    // Rotation tween — slightly longer duration so the tilt smooths
    // jittery per-frame deltas into a soft lean.
    const qrot = gsap.quickTo(hand, "rotation", { duration: 0.32, ease: "power3" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(hand, { autoAlpha: 1, duration: 0.15 });
      }
      qx(e.clientX);
      qy(e.clientY);

      // Tilt the cursor toward its movement: moving up tips anticlockwise
      // (negative angle), down tips clockwise. EMA-smooth the per-frame
      // delta so quick mice don't jitter. Settle back to 0 once the
      // pointer goes still.
      if (lastClientY.current !== null) {
        const dy = e.clientY - lastClientY.current;
        smoothedDy.current = smoothedDy.current * 0.6 + dy * 0.4;
        const target = Math.max(-18, Math.min(18, smoothedDy.current * 2));
        qrot(target);
      }
      lastClientY.current = e.clientY;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        smoothedDy.current = 0;
        qrot(0);
        settleTimer.current = null;
      }, 110);

      const t = e.target as Element | null;
      setOverMode(!!(t && t.closest(TARGET_SELECTOR)));
    };
    const hide = () => {
      shown = false;
      gsap.to(hand, { autoAlpha: 0, duration: 0.15 });
      if (settleTimer.current) {
        clearTimeout(settleTimer.current);
        settleTimer.current = null;
      }
      smoothedDy.current = 0;
      lastClientY.current = null;
      qrot(0);
    };

    // step the hand frame toward `target` (1 = open, 5 = grabbed)
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
    // step the press cursor frame toward `target` (1 = open, 5 = clicked)
    const animatePressTo = (target: number) => {
      if (pressAnimRef.current) clearInterval(pressAnimRef.current);
      pressAnimRef.current = setInterval(() => {
        const cur = pressFrameRef.current;
        if (cur === target) {
          if (pressAnimRef.current) clearInterval(pressAnimRef.current);
          pressAnimRef.current = null;
          return;
        }
        const next = cur < target ? cur + 1 : cur - 1;
        pressFrameRef.current = next;
        setPressFrame(next);
      }, 22);
    };
    const down = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const onTarget = !!(t && t.closest(TARGET_SELECTOR));
      if (onTarget) {
        pressModeRef.current = "poke";
        animatePressTo(PRESS_PRESSED);
      } else {
        pressModeRef.current = "grab";
        animateTo(5);
      }
    };
    const up = () => {
      if (pressModeRef.current === "poke") {
        animatePressTo(PRESS_REST);
      } else if (pressModeRef.current === "grab") {
        animateTo(1);
      }
      pressModeRef.current = "none";
    };

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
      if (pressAnimRef.current) clearInterval(pressAnimRef.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={handRef}
      aria-hidden
      alt=""
      src={cldUrl(over ? `/media/cursor/press${pressFrame}.png` : `/media/cursor/hand${frame}.png`)}
      draggable={false}
      className="pointer-events-none fixed left-0 top-0 z-[9999] w-12 opacity-0 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
    />
  );
}
