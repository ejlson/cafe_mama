"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [overMenu, setOverMenu] = useState(false);

  // Auto-hide on scroll-down / show on scroll-up (ScrollTrigger.direction, which
  // works under ScrollSmoother), and colour by whether the hero is showing.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Hide upward as soon as the user scrolls down (tiny buffer so it doesn't
        // hide at the very top / on a rest bounce); show again on scroll-up.
        if (self.direction === 1 && self.scroll() > 4) setHidden(true);
        else if (self.direction === -1) setHidden(false);
      },
    });

    // The hero (#top) is a fixed layer that MenuReveal fades out (autoAlpha 0)
    // when you enter the menu and back in when you return. While it's showing
    // the bar must stay yellow — track its opacity rather than scroll position
    // (the menu sits behind the hero at the top of the content).
    const heroEl = document.getElementById("top");
    const sync = () => {
      const shown = heroEl
        ? parseFloat(getComputedStyle(heroEl).opacity || "1") >= 0.5
        : false;
      setOverMenu(!shown);
      if (shown) setHidden(false); // always show the bar over the hero
    };
    sync();
    const mo = heroEl ? new MutationObserver(sync) : null;
    if (heroEl)
      mo!.observe(heroEl, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });

    return () => {
      st.kill();
      mo?.disconnect();
    };
  }, []);

  const navColor = overMenu ? "var(--loc-text, #f4c33c)" : "#f4c33c";

  return (
    <header
      style={{
        top: "var(--bz)",
        left: "var(--bz)",
        right: "var(--bz)",
        transform: hidden && !open ? "translateY(-130%)" : "translateY(0)",
        transition: "transform 0.15s cubic-bezier(0.4,0,0.2,1)",
        color: navColor,
      }}
      className="fixed z-[70]"
    >
      <nav className="relative flex w-full items-start justify-between px-3 py-3 sm:px-4">
        {/* Brand — heavy Arial Black, two lines, left aligned */}
        <a
          href="#top"
          className="nav-blackface leading-[0.92] tracking-tight"
          style={{ color: navColor }}
        >
          <span className="block text-2xl sm:text-3xl lg:text-[34px]">
            CAFE&nbsp;MAMA
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-[34px]">
            &amp;&nbsp;SONS
          </span>
        </a>

        {/* Right links (desktop) */}
        <ul
          className="nav-blackface hidden items-center gap-5 pt-1 text-xl md:flex lg:gap-8 lg:text-2xl"
          style={{ color: navColor }}
        >
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                className="transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="nav-blackface flex h-9 w-9 items-center justify-center md:hidden"
        >
          <div className="space-y-[5px]">
            <span
              className={`block h-[3px] w-6 transition-transform ${
                open ? "translate-y-[8px] rotate-45" : ""
              }`}
              style={{ backgroundColor: navColor }}
            />
            <span
              className={`block h-[3px] w-6 transition-opacity ${
                open ? "opacity-0" : ""
              }`}
              style={{ backgroundColor: navColor }}
            />
            <span
              className={`block h-[3px] w-6 transition-transform ${
                open ? "-translate-y-[8px] -rotate-45" : ""
              }`}
              style={{ backgroundColor: navColor }}
            />
          </div>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-black/10 bg-black/40 backdrop-blur-sm md:hidden">
          <ul
            className="nav-blackface flex flex-col px-6 py-4 text-2xl"
            style={{ color: navColor }}
          >
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-black/15 last:border-0">
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="block py-3"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
