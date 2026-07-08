"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP);

export type PreviewData = { img: string; w?: number; h?: number; angle?: number };
type PreviewApi = { show: (d: PreviewData) => void; hide: () => void };

const PreviewCtx = createContext<PreviewApi | null>(null);

// Consumed by ItemRow — hovering a row with a photo floats that photo under
// the cursor.
export function usePreview() {
  return useContext(PreviewCtx);
}

/**
 * Cursor-following photo preview for menu rows. Provider renders one portal
 * <img> at the top level; show()/hide() drive it via GSAP. Fine-pointer
 * devices only — on touch there's no cursor to track.
 */
export default function MenuImagePreview({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const apiRef = useRef<PreviewApi | null>(null);
  const [mounted, setMounted] = useState(false);
  // Portal targets document.body, which only exists client-side — flag the
  // mount on the next frame (rAF keeps the setState out of the effect body).
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      if (!wrapRef.current || !imgRef.current) return;
      const wrap = wrapRef.current;
      const img = imgRef.current;
      gsap.set(wrap, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 });
      const xTo = gsap.quickTo(wrap, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(wrap, "y", { duration: 0.5, ease: "power3" });
      // Track the live pointer so a freshly-shown preview can be dropped straight
      // onto the cursor — otherwise it flashes at 0,0 (a white box in the
      // top-left) while quickTo eases over from its previous position.
      let lastX = window.innerWidth / 2;
      let lastY = window.innerHeight / 2;
      const onMove = (e: PointerEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener("pointermove", onMove);

      // Bumped on every show()/hide() so a slow image's onload can't reveal the
      // preview after the pointer has already left the row.
      let token = 0;

      apiRef.current = {
        show: (d) => {
          // skip on touch / coarse pointers — there's no cursor to track
          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;
          const my = ++token;
          // 250px display box → 600px source is plenty even on 2x screens.
          img.src = cldUrl(d.img, { transform: "w_600,c_limit" });
          const natW = d.w ?? 240;
          const natH = d.h ?? 180;
          const W = 250;
          // Size it and place it ON the cursor instantly (no tween) so it can
          // never appear in the top-left corner.
          gsap.set(wrap, {
            width: W,
            height: W * (natH / natW),
            rotate: d.angle ?? 0,
            x: lastX,
            y: lastY,
          });
          const reveal = () => {
            if (my !== token) return; // superseded by a hide() / newer show()
            gsap.to(wrap, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.35,
              ease: "back.out(1.6)",
              overwrite: "auto",
            });
          };
          // Only fade in once the photo is actually decoded, so the empty cream
          // border never shows on its own.
          if (img.complete && img.naturalWidth > 0) reveal();
          else img.onload = reveal;
        },
        hide: () => {
          token++; // cancel any pending reveal
          gsap.to(wrap, {
            autoAlpha: 0,
            scale: 0.8,
            duration: 0.25,
            ease: "power2.in",
            overwrite: "auto",
          });
        },
      };
      return () => window.removeEventListener("pointermove", onMove);
    },
    { dependencies: [mounted] },
  );

  const api = useMemo<PreviewApi>(
    () => ({
      show: (d) => apiRef.current?.show(d),
      hide: () => apiRef.current?.hide(),
    }),
    [],
  );

  return (
    <PreviewCtx.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            ref={wrapRef}
            aria-hidden
            // Inline opacity:0 + visibility:hidden so the empty cream-bordered
            // img can never flash in the top-left corner before useGSAP runs
            // and calls gsap.set(autoAlpha: 0). show() overrides both via
            // autoAlpha when (and if) it's ever called.
            style={{ opacity: 0, visibility: "hidden" }}
            className="pointer-events-none fixed left-0 top-0 z-[60] will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt=""
              className="block h-full w-full rounded-2xl border-[6px] border-cream object-cover shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
            />
          </div>,
          document.body,
        )}
    </PreviewCtx.Provider>
  );
}
