// The cafe's own "mini LLM" — a compact, fully-local language engine that
// generates comment replies in the @cafe_mama_sons voice. No network, no API
// keys, no quotas: it tokenises the comment, scores a set of weighted intents
// against it, resolves any menu item mentioned (fuzzy, longest-match), and
// fills a reply template chosen deterministically from the comment text so
// the same comment always gets the same reply but different comments vary.
//
// It is seeded with the restaurant's real context (menu + prices from
// src/lib/menu-data.ts, hours, address, meal deal), so factual questions —
// "how much is the ube matcha?", "what time do you open?" — get correct,
// specific answers instead of a canned "thanks for stopping by!".

import { CATEGORIES, type Item } from "@/lib/menu-data";

// ---------- text utils ----------

const normalize = (s: string): string =>
  s
    .toLowerCase()
    // strip everything except letters, numbers, spaces, ?, £ and emoji we key on
    .replace(/[‘’']/g, "")
    .replace(/[^\p{L}\p{N}\p{Extended_Pictographic}£? ]+/gu, " ")
    // detach "?" from the word it trails ("matcha?" → "matcha ?") so item
    // token matching still works while t.includes("?") keeps question intent
    .replace(/\?/g, " ? ")
    .replace(/\s+/g, " ")
    .trim();

// FNV-1a — tiny stable hash so template choice is deterministic per comment.
const hash = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const pick = <T,>(arr: readonly T[], seed: number, salt = 0): T =>
  arr[(hash(String(seed + salt * 7919)) + seed) % arr.length]!;

// ---------- menu item resolution ----------

type MenuHit = { item: Item; score: number };

// Flatten every item on the menu once, with a normalized name + token set.
const ALL_ITEMS: { item: Item; norm: string; tokens: string[] }[] =
  CATEGORIES.flatMap((c) => c.groups ?? []).flatMap((g) =>
    g.items.map((item) => {
      const norm = normalize(item.name.replace(/\(.*?\)/g, ""));
      return { item, norm, tokens: norm.split(" ").filter(Boolean) };
    }),
  );

// Generic tokens that shouldn't count as a match on their own ("iced latte"
// should resolve via "latte", but a bare "box" or "hot" shouldn't hit
// "Box of Crisps" / "(Iced/Hot)").
const WEAK_TOKENS = new Set(["of", "box", "iced", "hot", "au", "the", "a"]);

// Find the menu item a comment is talking about. Full-name substring match
// wins outright; otherwise score by how many strong name-tokens appear, and
// prefer items with MORE of their tokens covered (so "ube matcha" beats
// "matcha" alone when both words are present).
export function matchMenuItem(text: string): Item | null {
  const t = ` ${normalize(text)} `;
  let best: MenuHit | null = null;
  for (const { item, norm, tokens } of ALL_ITEMS) {
    let score = 0;
    if (norm && t.includes(` ${norm} `)) {
      score = tokens.length * 2 + 2; // exact full-name mention
    } else {
      const strong = tokens.filter(
        (tok) => !WEAK_TOKENS.has(tok) && t.includes(` ${tok} `),
      );
      // require every strong token for multi-word names, or the single
      // distinctive token for one-worders ("croissant", "espresso").
      const needed = tokens.filter((tok) => !WEAK_TOKENS.has(tok));
      if (needed.length > 0 && strong.length === needed.length)
        score = strong.length * 2;
      else if (strong.length >= 2) score = strong.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }
  return best?.item ?? null;
}

// ---------- intents ----------

type Ctx = { text: string; seed: number; item: Item | null };
type Intent = {
  name: string;
  weight: number; // higher = wins ties over lower-weight intents
  test: (t: string, ctx: Ctx) => boolean;
  replies: (ctx: Ctx) => string[];
};

const has = (t: string, ...words: string[]) =>
  words.some((w) => t.includes(w));

const itemName = (item: Item) =>
  item.name.replace(/\s*\(.*?\)\s*/g, "").toLowerCase();

const INTENTS: Intent[] = [
  {
    name: "hours",
    weight: 90,
    test: (t) =>
      has(t, "what time", "opening hours", "open today", "open tomorrow", "close", "closing", "opening time") ||
      (has(t, "open", "hours") && t.includes("?")),
    replies: () => [
      `we're open mon–fri from 8am, weekends from 9am — kitchen runs all day 🤍`,
      `mon–fri 8am, sat–sun 9am, till 5pm — come thru!`,
      `doors open 8am weekdays, 9am weekends. all-day breakfast the whole time 👀`,
    ],
  },
  {
    name: "location",
    weight: 90,
    test: (t) =>
      has(t, "where are you", "where is", "address", "located", "location", "find you", "how do i get", "postcode", "what street"),
    replies: () => [
      `83 kentish town road nw1 — the bright shopfront, you can't miss it 🤍`,
      `we're at 83 kentish town rd, between camden lock and kentish town station!`,
      `come find us — 83 kentish town road, nw1 👀`,
    ],
  },
  {
    name: "price",
    weight: 85,
    test: (t) => has(t, "how much", "price", "cost", "£", "expensive", "cheap"),
    replies: ({ item, seed }) =>
      item
        ? [
            `the ${itemName(item)} is £${item.price} 🤍`,
            `£${item.price} for the ${itemName(item)} — worth every penny 👀`,
            `that one's £${item.price}!`,
          ]
        : [
            `menu's on the site — and the £14 meal deal gets you a sando, nori crisps + any drink!`,
            `depends what you're eyeing 👀 the meal deal is £14 with a drink included`,
            pick(
              [
                `sandos run £8.50–£10.50, drinks from £3.20 🤍`,
                `most sandos are around £9, bakes from £2.90!`,
              ],
              seed,
              3,
            ),
          ],
  },
  {
    name: "meal-deal",
    weight: 85,
    test: (t) => has(t, "meal deal", "mealdeal", "deal"),
    replies: () => [
      `£14 gets you any sando, house nori crisps + a drink — all day 🤍`,
      `the meal deal is £14 — sando, crisps and any drink you like 👀`,
      `£14, all day: sando + nori crisps + drink. dangerous knowledge`,
    ],
  },
  {
    name: "veggie",
    weight: 80,
    test: (t) => has(t, "vegan", "vegetarian", "veggie", "meat free", "meatless", "plant based"),
    replies: () => [
      `the adobo mushroom sando is our veggie hero — creamy, crispy, unreal 🍄`,
      `adobo mushroom sando!! even the meat eaters order it 🤍`,
      `veggie-wise the adobo mushroom croquette is the one — £9 well spent`,
    ],
  },
  {
    name: "allergens",
    weight: 80,
    test: (t) => has(t, "allerg", "gluten", "nut free", "nuts", "dairy", "lactose", "coeliac", "celiac"),
    replies: () => [
      `allergens are listed on the menu — tell us at the counter and we'll sort you 🙏`,
      `we list allergens per item! oat + coconut milk swaps are 50p 🤍`,
      `just let the counter know — mama takes allergies seriously 🙏`,
    ],
  },
  {
    name: "delivery",
    weight: 75,
    test: (t) => has(t, "deliver", "deliveroo", "uber eats", "ubereats", "just eat", "order online", "ship"),
    replies: () => [
      `best enjoyed fresh at the counter for now — keep an eye on our page for delivery news 👀`,
      `no delivery apps yet!! come see us at 83 kentish town rd 🤍`,
      `fresh out the kitchen only for now — worth the trip, promise 🙏`,
    ],
  },
  {
    name: "recommend",
    weight: 70,
    test: (t) =>
      has(t, "recommend", "what should i", "what do i get", "first time", "must try", "whats good", "what's good", "best thing", "favourite", "favorite"),
    replies: ({ seed }) => [
      `first timer move: ${pick(["chilli kimchi chicken sando + ube latte", "longanisa pandesal + spanish latte", "adobo mushroom sando + honey peach mango"], seed, 1)} 🤍`,
      `the ${pick(["chilli kimchi chicken", "jerk chicken", "adobo mushroom"], seed, 2)} sando never misses — add the ube matcha 👀`,
      `can't go wrong with the £14 meal deal — sando, crisps, any drink!`,
    ],
  },
  {
    name: "spice",
    weight: 65,
    test: (t) => has(t, "spicy", "spice", "hot sauce", "chilli level", "heat"),
    replies: () => [
      `the chilli kimchi chicken brings real heat — sweat-and-smile levels 🥵`,
      `spice fans go chilli kimchi chicken. everything else is gentle 🤍`,
      `just the chilli kimchi sando! the rest of the menu is mild 👀`,
    ],
  },
  {
    name: "song",
    weight: 60,
    test: (t) => has(t, "song", "music", "track", "audio", "sound"),
    replies: () => [
      `straight off mama's kitchen playlist 🎶`,
      `if we told you, you'd play it more than we do 👀`,
      `house playlist secrets!! come in and shazam it 🤍`,
    ],
  },
  {
    name: "item-love",
    weight: 55,
    test: (_t, ctx) => ctx.item !== null,
    replies: ({ item }) => [
      `the ${itemName(item!)} never misses 🤍`,
      `${itemName(item!)} gang!! taste maker fr 👀`,
      `ay you get it — the ${itemName(item!)} is a top seller for a reason`,
      `mama heard that and she's smiling. ${itemName(item!)} on us next… kidding. maybe 👀`,
    ],
  },
  {
    name: "visit-intent",
    weight: 50,
    test: (t) =>
      has(t, "coming", "on my list", "visiting", "next week", "this weekend", "saturday", "sunday", "need to try", "have to try", "cant wait", "can't wait", "adding to my list", "im there", "i'm there"),
    replies: () => [
      `see you at the counter!! 🤍`,
      `we'll save you a stripey chair 👀`,
      `come hungry — the sandos are generous 🙏`,
      `ay come thru! weekends get busy so early bird it 🤍`,
    ],
  },
  {
    name: "praise",
    weight: 40,
    test: (t) =>
      has(t, "love", "amazing", "incredible", "unreal", "insane", "goat", "best", "obsessed", "fav", "delicious", "so good", "banger", "eats", "immaculate", "😍", "🔥", "🤤", "🥹", "🤍", "💛"),
    replies: () => [
      `ay grabe, thank you!! 🤍`,
      `this made our day fr 🤧`,
      `salamat po! see you again soon 🙏`,
      `you're the best 🥹`,
      `mahal ka namin 💛 see you at the counter`,
    ],
  },
  {
    name: "greeting",
    weight: 30,
    test: (t) =>
      /^(hi|hello|hey|yo|kumusta|kamusta|good (morning|afternoon|evening))\b/.test(t),
    replies: () => [
      `kumusta!! 🤍`,
      `hello po! drop by soon 👀`,
      `hey hey — hope you're hungry 🤍`,
    ],
  },
  {
    name: "question",
    weight: 20,
    test: (t) => t.includes("?"),
    replies: () => [
      `good question — dm us and we'll sort you out 🤍`,
      `slide into our dms, we'll get you an answer 👀`,
      `ask us at the counter, we love a chat 🙏`,
    ],
  },
];

// Warm default pool — same voice as before, used when nothing else matches.
const DEFAULTS = [
  "thanks for stopping by!! 🤍",
  "see you again soon 🥺",
  "salamat po! 🙏",
  "ay grabe, thank you!!",
  "you're the best 🥹",
  "noted!! we'll see you at the counter 👀",
  "biggest hug from cafe mama 🫂",
  "this made our day fr 🤧",
  "🟣🟡 see you next time!",
  "mahal ka namin 💛",
];

export type BrainReply = { reply: string; intent: string };

// Generate a reply. Deterministic for a given comment (stable hash picks the
// template), varied across comments. Always returns something ≤ ~90 chars.
export function cafeBrainReply(userText: string): BrainReply {
  const text = normalize(userText).slice(0, 280);
  const seed = hash(text);
  const item = matchMenuItem(text);
  const ctx: Ctx = { text, seed, item };

  let best: Intent | null = null;
  for (const intent of INTENTS) {
    if (intent.test(text, ctx) && (!best || intent.weight > best.weight))
      best = intent;
  }

  const pool = best ? best.replies(ctx) : DEFAULTS;
  const reply = pick(pool, seed);
  return { reply: reply.slice(0, 120), intent: best?.name ?? "default" };
}
