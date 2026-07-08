import { cldUrl } from "@/lib/cloudinary";

// The background gradient colours for each menu palette. Stored as CSS vars
// (--wave-*) so the hero→menu wave matches, and so we can smoothly tween them
// from one palette to the next when switching tabs (Mála-Project style).
// fa/fb are the footer gradient colours for this palette — drinks gets a
// lighter, more vibrant violet that matches its purple wash; sandwiches/bakery
// keep the bright orange-red.
// lt = Location accent text colour, lc = Location card bg/border colour, and
// ab/ay = opacity of the blue / yellow "COME FIND US" word-art tiles. Sandwiches
// reads blue-on-gold (matching the word art); drinks flips to yellow-on-purple.
export type BgVars = {
  f0: string;
  f1: string;
  b0: string;
  b1: string;
  fa: string;
  fb: string;
  lt: string;
  lc: string;
  ab: number;
  ay: number;
  // fbr = footer "CAFE MAMA & SONS" brand colour
  fbr: string;
  // footer-clock artwork — swapped per tab so the drinks variant pulls
  // the yellow halo + face, and food pulls the pink/wine pair
  clockShadow: string;
  clockFace: string;
  // Location-section pill CTA artwork — gold/wine on food, purple on
  // drinks. Same Rectangle 151 (glow halo) + Rectangle 152 (face) pair
  // as the rest of the buttons; just recoloured per tab.
  pillGlow: string;
  pillFace: string;
};

export const bgVars = (isDrinks: boolean): BgVars =>
  isDrinks
    ? {
        f0: "#c4afe6",
        f1: "#9b81c9",
        b0: "#9b81c9",
        b1: "#7e63b0",
        // drinks footer now uses the food-menu gold background
        fa: "#fbd400",
        fb: "#f4c33c",
        lt: "#fbd400",
        lc: "#5b3f86",
        ab: 0,
        ay: 1,
        // drinks: footer brand matches the drinks page (purple) background
        fbr: "#9b81c9",
        clockShadow: `url('${cldUrl("/footerclock/drinksmenu/Ellipse%2069.svg")}')`,
        clockFace: `url('${cldUrl("/footerclock/drinksmenu/Ellipse%2070.svg")}')`,
        pillGlow: `url('${cldUrl("/buttons/drinksmenu/Rectangle%20151.svg")}')`,
        pillFace: `url('${cldUrl("/buttons/drinksmenu/Rectangle%20152.svg")}')`,
      }
    : {
        // food bg = the nav-bar / drinks-text yellow (gold), subtle radial
        f0: "#fbd400",
        f1: "#f4c33c",
        b0: "#f4c33c",
        b1: "#eab92f",
        // food footer matches the food-menu accent (hot pink)
        fa: "#FF1353",
        fb: "#FF1353",
        lt: "#FF1353",
        lc: "#f4c33c",
        ab: 1,
        ay: 0,
        fbr: "#f4c33c",
        clockShadow: `url('${cldUrl("/footerclock/Ellipse%2069.svg")}')`,
        clockFace: `url('${cldUrl("/footerclock/Ellipse%2070.svg")}')`,
        pillGlow: `url('${cldUrl("/buttons/Rectangle%20151.svg")}')`,
        pillFace: `url('${cldUrl("/buttons/Rectangle%20152.svg")}')`,
      };

export function setBgVars(v: BgVars) {
  const s = document.documentElement.style;
  s.setProperty("--wave-f0", v.f0);
  s.setProperty("--wave-f1", v.f1);
  s.setProperty("--wave-b0", v.b0);
  s.setProperty("--wave-b1", v.b1);
  s.setProperty("--foot-a", v.fa);
  s.setProperty("--foot-b", v.fb);
  s.setProperty("--foot-brand", v.fbr);
  s.setProperty("--loc-text", v.lt);
  s.setProperty("--loc-card", v.lc);
  s.setProperty("--art-blue", String(v.ab));
  s.setProperty("--art-yellow", String(v.ay));
  s.setProperty("--foot-clock-shadow", v.clockShadow);
  s.setProperty("--foot-clock-face", v.clockFace);
  s.setProperty("--loc-pill-glow", v.pillGlow);
  s.setProperty("--loc-pill-face", v.pillFace);
}

// Per-category text theme (the background gradient is handled by the vars
// above). Drinks gets yellow type on pastel ube; food keeps the poster pink.
export const textTheme = (isDrinks: boolean) =>
  isDrinks
    ? {
        accent: "#fbd400", // headings, tabs, title
        body: "#fbd400", // item names + prices — yellow
        dot: "rgba(251,212,0,0.6)", // dotted leaders — yellow
        line: "rgba(251,212,0,0.4)", // borders — yellow
      }
    : {
        accent: "#FF1353",
        body: "#FF1353",
        dot: "rgba(255,19,83,0.5)",
        line: "rgba(255,19,83,0.3)",
      };
