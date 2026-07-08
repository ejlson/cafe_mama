// Single source of truth for the cafe's menu. Rendered by the Menu section
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

// Short, descriptive blurbs sat to the right of each food group header — these
// are the first menu copy Google sees on the page, so each one names what the
// section is and the standout item in it.
export const BLURB_SANDOS =
  "Japanese-style milk-bread sandos built around Filipino flavours — adobo, longanisa, jerk chicken — all on house-baked pandesal.";
export const BLURB_BREAKFAST =
  "All-day pandesal breakfast: longanisa, egg mayo and Filipino classics, served from open to close.";
export const BLURB_SIDES =
  "Quick bites to round the meal deal out — golden tater-tots and a rotating box of house-made nori crisps.";
export const BLURB_BAKED =
  "Daily bakes from our Kentish Town counter: ube mochi croissant, cookie croissant, milo tiramisu, ensaymada and more.";

export const SANDOS: Item[] = [
  {
    name: "Chilli Kimchi Chicken",
    price: "9.00",
    desc: "Crispy chicken, chilli crisp, kimchi mayo, American cheese, tomatoes and lettuce.",
    allergens: "crustacean, fish",
    img: "/media/sandos/chilli-kimchi-chicken.jpg",
    angle: -7,
    w: 230,
    h: 300,
  },
  {
    name: "Egg Mayo",
    price: "8.50",
    desc: "Creamy egg mayo with chives and onion.",
    img: "/media/sandos/egg-mayo.jpg",
    angle: 5,
    w: 290,
    h: 200,
  },
  {
    name: "Tuna Melt",
    price: "8.50",
    desc: "Tuna mayo with sweetcorn, topped with crispy melted cheddar.",
    img: "/media/sandos/tuna-melt.jpg",
    angle: -3,
    w: 220,
    h: 260,
  },
  {
    name: "Jerk Chicken",
    price: "9.50",
    desc: "Jerk chicken with mayo, fresh tomato and pesto.",
    img: "/media/sandos/jerk-chicken.jpg",
    angle: 8,
    w: 310,
    h: 215,
  },
  {
    name: "Adobo Mushroom",
    price: "9.00",
    desc: "Crispy croquette stuffed with creamy adobo mushrooms and rich pesto.",
    allergens: "soya",
    img: "/media/sandos/adobo-mushroom.jpg",
    angle: -9,
    w: 240,
    h: 295,
  },
  {
    name: "Corned Beef",
    price: "10.50",
    desc: "Corned beef croquette with lettuce and mayo.",
    allergens: "nuts, celery & crustaceans",
    img: "/media/sandos/corned-beef.jpg",
    angle: 4,
    w: 265,
    h: 205,
  },
];

export const SIDES: Item[] = [
  { name: "Box of Tater-Tots", price: "4.50" },
  { name: "Box of Crisps", price: "4.00" },
];

export const PANDESAL: Item[] = [
  { name: "Egg Pandesal", price: "5.50" },
  { name: "Longanisa Pandesal", price: "9.00" },
];

export const BAKED: Item[] = [
  { name: "Honey Toast", price: "2.99" },
  { name: "Honey Garlic Twist", price: "4.80" },
  { name: "Spanish Bread", price: "3.50" },
  { name: "Croissant", price: "2.90" },
  { name: "Cookie Croissant", price: "6.00" },
  { name: "Almond Croissant", price: "3.50" },
  { name: "Miso Cookie", price: "3.99" },
  { name: "Ube Bow", price: "4.90" },
  { name: "Ube Pain Au Chocolat", price: "5.50" },
  { name: "Pain Au Chocolat", price: "3.00" },
  { name: "Banana Pudding", price: "5.50" },
];

export const DRINKS_GROUPS: Group[] = [
  {
    title: "Coffee",
    items: [
      { name: "Espresso", price: "3.20" },
      { name: "Cortado", price: "3.50" },
      { name: "Macchiato", price: "3.50" },
      { name: "Flat White", price: "3.70" },
      { name: "Latte (Iced/Hot)", price: "3.90" },
      { name: "Cappuccino", price: "3.90" },
      { name: "Americano (Iced/Hot)", price: "3.5" },
      { name: "Spanish Latte (Iced/Hot)", price: "5.20" },
      { name: "Ube Latte (Iced/Hot)", price: "6.20" },
      { name: "Milo Latte (Iced/Hot)", price: "6.20" },
    ],
  },
  {
    title: "Matcha",
    items: [
      { name: "Mango Matcha", price: "5.70" },
      { name: "Strawberry Matcha", price: "5.70" },
      { name: "Spanish Matcha (Iced/Hot)", price: "5.20" },
      { name: "Ube Matcha (Iced/Hot)", price: "6.20" },
      { name: "Milo Matcha (Iced/Hot)", price: "6.20" },
    ],
  },
  {
    title: "Tea",
    items: [
      { name: "Calamansi Ade/Tea", price: "4.70" },
      { name: "Honey Peach Mango", price: "4.70" },
      { name: "Strawberry Tea", price: "4.70" },
      { name: "Spanish Hojicha (Iced/Hot)", price: "6.00" },
      { name: "Milo Hojicha (Iced/Hot)", price: "6.00" },
    ],
  },
  {
    title: "Protein Shake",
    items: [
      { name: "Mango Float", price: "8.50" },
      { name: "Chocnut", price: "8.50" },
      { name: "Avocado Pandan", price: "8.50" },
    ],
  },
];

export const CATEGORIES: Category[] = [
  {
    key: "sandos",
    label: "Food",
    groups: [
      { title: "Sando/Sandwiches", items: SANDOS, blurb: BLURB_SANDOS },
      { title: "All-Day Breakfast", items: PANDESAL, blurb: BLURB_BREAKFAST },
      { title: "Sides", items: SIDES, blurb: BLURB_SIDES },
      { title: "Baked Goods", items: BAKED, blurb: BLURB_BAKED },
    ],
  },
  { key: "drinks", label: "Drinks", groups: DRINKS_GROUPS },
];

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
