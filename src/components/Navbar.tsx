"use client";

import { useState } from "react";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        top: "var(--bz)",
        left: "var(--bz)",
        right: "var(--bz)",
      }}
      className="fixed z-[70] text-cream"
    >
      <nav className="relative flex w-full items-start justify-between px-3 py-3 sm:px-4">
        {/* Brand — heavy Arial Black, two lines, left aligned */}
        <a
          href="#top"
          className="nav-blackface leading-[0.92] tracking-tight"
        >
          <span className="block text-2xl sm:text-3xl lg:text-[34px]">
            CAFE&nbsp;MAMA
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-[34px]">
            &amp;&nbsp;SONS
          </span>
        </a>

        {/* Right links (desktop) */}
        <ul className="nav-blackface hidden items-center gap-5 pt-1 text-xl md:flex lg:gap-8 lg:text-2xl">
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
              className={`block h-[3px] w-6 bg-mango transition-transform ${
                open ? "translate-y-[8px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[3px] w-6 bg-mango transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[3px] w-6 bg-mango transition-transform ${
                open ? "-translate-y-[8px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-black/10 bg-black/40 backdrop-blur-sm md:hidden">
          <ul className="nav-blackface flex flex-col px-6 py-4 text-2xl">
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
