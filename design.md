# Cafe Mama & Sons — Design System

This file describes the visual language of the site so future changes stay
coherent. Source of truth for tokens is `src/app/globals.css` (Tailwind v4
`@theme`) and component conventions in `src/components/`.

## Colour palette

Brand palette is declared in `src/app/globals.css` under `@theme`. Each token
becomes a Tailwind utility (`bg-cream`, `text-pine`, `border-tomato`, …).

| Token              | Hex       | Where it lives                                 |
| ------------------ | --------- | ---------------------------------------------- |
| `--color-cream`        | `#f6efdd` | Page background; the warm paper of the menu    |
| `--color-cream-deep`   | `#efe5cc` | Subtle paper variation                         |
| `--color-ink`          | `#221a12` | Primary text                                   |
| `--color-ink-soft`     | `#4a3f30` | Secondary text                                 |
| `--color-peach`        | `#f6c6ab` | Accent, shopfront                              |
| `--color-peach-deep`   | `#e89b76` | Warmer accent                                  |
| `--color-ube`          | `#6c4a8f` | Filipino purple accent                         |
| `--color-matcha`       | `#7a8c34` | Drinks accent                                  |
| `--color-mango`        | `#f0a92b` | Nav "channel bug" gold                         |
| `--color-tomato`       | `#c2452d` | Section accent / poster red                    |
| `--color-sun`          | `#fbd400` | Saturated poster yellow (menu background)      |
| `--color-pine`         | `#14564c` | Deep green — used on price badges              |

Section accent (the `accent` prop threaded through `Menu.tsx`) is the deep
red `#c2452d` (`--color-tomato`); poster titles (MENU / BLOG / LOCATION)
render in this accent on the sun-yellow gradient panel.

Backgrounds: `--background: #1a140e` for the `<html>` letterbox, page body
itself is `--color-cream`.

## Typography

Fonts are wired up in `src/app/layout.tsx` with `next/font/google` (except
Cheee T-Bone, which loads via the Adobe Typekit `<link>` in `<head>`).

| CSS variable          | Loaded family   | Role                                                                     |
| --------------------- | --------------- | ------------------------------------------------------------------------ |
| `--font-black`        | Archivo Black   | Heavy headings & nav — guarantees the "Arial Black" look across devices  |
| `--font-display`      | Anton           | Display secondary                                                        |
| `--font-body`         | Archivo         | Body copy (default `body { font-family }`)                               |
| `--font-hand`         | Caveat          | Handwritten accents                                                      |
| `cheee-tbone` (Typekit) | Cheee T-Bone  | The poster titles (MENU, BLOG, LOCATION)                                 |

Utility classes (`globals.css`):

- `.font-arialblack` — Archivo Black, weight 900. Default heavy face.
- `.font-cheee` — alias for the same Archivo Black stack; legacy class name
  kept so existing markup still works.
- `.font-poster` — `cheee-tbone` for poster headlines (use only for the giant
  section titles, never for paragraph text).
- `.nav-blackface` — navbar treatment: Arial Black, gold (`#f4c33c`), hard
  3px offset black shadow. Reserved for the broadcast nav strip.
- `.menu-title` — red face for the MENU poster headline (`#e23b2e`).
- `.wordart-3d` — 90s Word-Art treatment (rainbow gradient + extruded shadow);
  used very sparingly.

Selection / drag are disabled globally on `body` to keep drag gestures clean.

## Spacing — line gaps (THE rule)

Horizontal dividers are rendered through the `FullRule` component in
`src/components/Menu.tsx`. The site uses **exactly two** vertical-gap tokens
around these lines, and nothing else:

| Token             | Tailwind class     | When to use                                                            |
| ----------------- | ------------------ | ---------------------------------------------------------------------- |
| **Title-hugger**  | `mt-0` / `mb-0`    | The rule sits flush with a poster title (BLOG, MENU, about-us, etc.)   |
| **Separator**     | `mt-2` / `mb-2`    | Default. Every other divider gets this 8px gap above (or below) it.    |

`FullRule`'s default className is `mt-2`, so any call without a custom
className already gets the standard separator gap. Pass `mt-0`/`mb-0` only
when the line is intentionally touching a poster headline.

Do **not** introduce new spacing values for rules — if a section feels too
tight or too loose, adjust the adjacent block padding instead, so the rule
spacing stays uniform across the site.

The inline rule under the LOCATION title in `src/components/Location.tsx`
(no FullRule import there) follows the same convention: no top margin
because it hugs the poster title.

## Spacing — content blocks

Content padding is freer, but follows Tailwind's normal scale (`mt-2`,
`mt-6`, `py-10`, etc.). A few conventions:

- Major section vertical breathing: `py-10 sm:py-14` (the menu gradient panel).
- Inner content wrappers: `max-w-[1500px] px-4 sm:px-8` centred.
- Group header → content: small `mt-2`–`mt-3`.
- Featured / hero blocks immediately after a rule: `mt-2` (matches the
  divider gap so nothing reads as floating).

## Components & conventions

- **Poster titles** — `.font-poster`, accent colour, `[text-box:trim-both_cap_alphabetic]`
  applied so the rule above/below kisses the cap height. This is why the
  title-hugger gap is `0`: the trimming already gives the optical breathing room.
- **Section rule (`FullRule`)** — full-bleed inside the content column; spans
  `calc(100% + 2rem)` and centres via `left-1/2 -translate-x-1/2`. 1px height.
  Colour is the section's accent.
- **Side rails** — currently a no-op (`SideRails`), kept as a hook so vertical
  rails can be restored without ripping out call sites.
- **Cursor** — custom cursor enabled by adding `.has-custom-cursor` to a host
  element; system cursor is hidden under that root.
- **CRT overlay** — scanlines (z-80), rolling bar (z-83), grain (z-84) layered
  above the navbar so the whole tube reads as one screen. All are
  `pointer-events:none`.

## Motion

GSAP is the project's animation library (see the `gsap-*` skills). Conventions:

- Scroll-driven reveals use `ScrollTrigger` with `start: "top 80%"`, `once: true`.
- `gsap.utils.toArray<HTMLElement>(selector, root)` against a `ref` is the
  default selection pattern.
- Respect `prefers-reduced-motion: reduce` — CRT effects, the grid floor, the
  poster-title pop-in, and the cafe-description character fly-in all bail out
  under that media query (`globals.css` and per-component `useGSAP` blocks).

## Accessibility

- Decorative rules and floating typography use `aria-hidden`.
- Headings are real `<h2>`/`<h3>` even when the visual is the poster title.
- All images carry `alt`; press logos name the outlet for screen readers.
- Selection is disabled on body to stop drag gestures leaving half-selected
  text, but link/button focus styles must remain visible (don't add
  `outline:none` without a replacement).
