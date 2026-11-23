// The cafe's menu, as the site's code sees it. Rendered by the Menu section
// and read by the cafe-reply "mini LLM" (src/lib/cafe-brain.ts) so comment
// replies always quote real items, prices and hours.

export type Item = {
  name: string;
  price: string;
  desc?: string;
  allergens?: string;
  img?: string;
  angle?: number;
  w?: number;
  h?: number;
};

export type Group = { title: string; items: Item[]; blurb?: string };

export type Category = {
  key: string;
  label: string;
  groups?: Group[];
  soon?: boolean;
};

// SINCE 2026-11-23 THE MENU IS EDITED IN THE CMS, not here: the Maginhawa
// Group's shared Sanity Studio, documents menu-cafemama-food (the Food tab)
// and menu-cafemama-drinks (Drinks). scripts/pull-cms.mjs saves them into the
// committed src/lib/menu.snapshot.json, dish photos into public/cms-menu,
// before every `npm run dev` and `npm run build`. This file only turns that
// snapshot back into the shapes below, which the components and the brain
// already read. Section heading -> group title, intro -> blurb,
// description -> desc. A dish ticked "Hide for now" is left out, and so is a
// section with nothing left in it.
//
// What stays in code: the tab keys and labels, each photo's tilt and size,
// CAFE_DESC and CAFE_FACTS (hours and the meal deal are not in the CMS).

import snapshot from "./menu.snapshot.json";

type SnapshotItem = {
  name: string;
  price: string;
  description?: string;
  allergens?: string;
  photo?: { src: string; alt: string };
  hide?: boolean;
};
type SnapshotSection = { title: string; intro?: string; items: SnapshotItem[] };
type SnapshotMenu = { restaurant: string; title: string; sections: SnapshotSection[] };

const MENUS = (snapshot as { menus: Record<string, SnapshotMenu> }).menus;

// Tilt and size of a dish photo. The six sandos keep the values they were
// hand-placed with; any other dish with a photo takes the next one from this
// same pattern, by its place among the photographed dishes on its tab, so a
// new dish looks deliberate rather than random.
type Pose = Required<Pick<Item, "angle" | "w" | "h">>;
const POSES: Record<string, Pose> = {
  "Chilli Kimchi Chicken": { angle: -7, w: 230, h: 300 },
  "Egg Mayo": { angle: 5, w: 290, h: 200 },
  "Tuna Melt": { angle: -3, w: 220, h: 260 },
  "Jerk Chicken": { angle: 8, w: 310, h: 215 },
  "Adobo Mushroom": { angle: -9, w: 240, h: 295 },
  "Corned Beef": { angle: 4, w: 265, h: 205 },
};
const POSE_PATTERN = Object.values(POSES);

function toGroups(id: string): Group[] {
  const menu = MENUS[id];
  if (!menu) throw new Error(`menu-data: ${id} is missing from menu.snapshot.json`);
  let photo = 0;
  const groups: Group[] = [];
  for (const s of menu.sections) {
    const items: Item[] = [];
    for (const i of s.items) {
      if (i.hide) continue;
      const item: Item = { name: i.name, price: i.price };
      if (i.description) item.desc = i.description;
      if (i.allergens) item.allergens = i.allergens;
      if (i.photo) {
        item.img = i.photo.src;
        Object.assign(item, POSES[i.name] ?? POSE_PATTERN[photo % POSE_PATTERN.length]);
        photo++;
      }
      items.push(item);
    }
    if (items.length === 0) continue;
    groups.push(s.intro ? { title: s.title, items, blurb: s.intro } : { title: s.title, items });
  }
  return groups;
}

export const CATEGORIES: Category[] = [
  { key: "sandos", label: "Food", groups: toGroups("menu-cafemama-food") },
  { key: "drinks", label: "Drinks", groups: toGroups("menu-cafemama-drinks") },
];

// The older per-section exports, kept so nothing that imports them breaks.
// They follow the section headings the menu had when it moved into the CMS;
// a section that has been renamed, hidden or removed comes back empty.
const FOOD = CATEGORIES[0].groups ?? [];
const group = (title: string) => FOOD.find((g) => g.title === title);

export const SANDOS: Item[] = group("Sando/Sandwiches")?.items ?? [];
export const PANDESAL: Item[] = group("All-Day Breakfast")?.items ?? [];
export const SIDES: Item[] = group("Sides")?.items ?? [];
export const BAKED: Item[] = group("Baked Goods")?.items ?? [];
export const DRINKS_GROUPS: Group[] = CATEGORIES[1].groups ?? [];

// The blurbs beside each food group header are the first menu copy Google
// sees on the page, so each one names what the section is and its standout.
export const BLURB_SANDOS = group("Sando/Sandwiches")?.blurb ?? "";
export const BLURB_BREAKFAST = group("All-Day Breakfast")?.blurb ?? "";
export const BLURB_SIDES = group("Sides")?.blurb ?? "";
export const BLURB_BAKED = group("Baked Goods")?.blurb ?? "";

export const CAFE_DESC =
  "Cafe Mama & Sons is a Filipino-Japanese café serving freshly made sandos, all-day pandesal breakfast meals, unique drinks, and baked goods.";

// Shared cafe facts — one place for the details quoted across Location,
// Footer, OpeningClock and the comment-reply brain.
export const CAFE_FACTS = {
  address: "83 Kentish Town Rd, London NW1 8NY",
  hoursLine: "Mon–Fri from 8am, Sat–Sun from 9am, until 5pm",
  weekdayOpen: 8,
  weekendOpen: 9,
  close: 17,
  mealDeal:
    "£14 weekday meal deal — any sando with house-made nori crisps and a drink, all day",
  instagram: "@cafe_mama_sons",
};
