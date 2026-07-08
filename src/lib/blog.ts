// Single source of truth for Cafe Mama & Sons blog posts.
// Consumed both by the on-page Blog section (Menu.tsx) and the indexable
// /blog and /blog/[slug] routes that exist purely for SEO.
//
// `body` paragraphs accept inline link segments so each post can backlink to
// the press coverage that mentioned us — those external dofollow links signal
// authority back to cafemamasons.com.

export const SITE_URL = "https://cafemamasons.com";

export type BlogSegment = string | { text: string; href: string };
export type BlogParagraph = string | BlogSegment[];

export type BlogPost = {
  slug: string;
  title: string;
  date: string; // human-readable, e.g. "17 April 2026"
  isoDate: string; // ISO 8601 for <time>/JSON-LD/sitemap lastmod
  img: string;
  alt: string;
  excerpt: string;
  keywords: string[];
  // small rotation used by the layered card row on the homepage
  r: number;
  body: BlogParagraph[];
  author?: string;
};

export const AUTHOR = "Cafe Mama & Sons";

// Internal anchors on the home page — used so each post links back to the
// menu / location / gallery section it describes.
const A_MENU = "/#menu";
const A_LOCATION = "/#location";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "the-infatuation-review",
    title: "The Infatuation reviews Cafe Mama & Sons",
    date: "17 April 2026",
    isoDate: "2026-04-17",
    // img: "/media/about%20us/web/about4-web.jpg",
    img: "/media/blog/longanisa-web.jpg",
    alt: "Cafe Mama & Sons Filipino-Japanese cafe interior on Kentish Town Road",
    excerpt:
      "The Infatuation's full review of our Kentish Town cafe — the sandos, the ube matcha, and the bakery counter that keeps people queuing on Kentish Town Road.",
    keywords: [
      "cafe mama and sons review",
      "the infatuation kentish town",
      "filipino cafe london",
      "kentish town brunch",
    ],
    r: 3,
    body: [
      "The Infatuation has published its full review of Cafe Mama & Sons in Kentish Town, and we couldn't be more pleased with how it turned out. Their reviewer spent a long morning with us, working through the sando board and the bakery counter, then sticking around for a second ube matcha latte before heading back to the office.",
      "The piece focuses on what we set out to do when we opened on Kentish Town Road: a Filipino-Japanese cafe that takes the milk-bread sando seriously, bakes everything in-house each morning, and treats coffee and matcha with the same care as the food. Their highlights — the chilli kimchi chicken sando, the adobo mushroom croquette, the ube mochi croissant and the £14 meal deal — line up almost exactly with what regulars order most.",
      "If you've never been, the easiest place to start is our weekday meal deal: a sando of your choice, house-made nori crisps and any drink for £14. Browse the full lineup on the menu or come find us on Kentish Town Road.",
      [
        "Read the full review on The Infatuation ",
        {
          text: "here",
          href: "https://www.theinfatuation.com/london/reviews/cafe-mama-sons",
        },
        ", then head over to our ",
        { text: "menu", href: A_MENU },
        " or ",
        { text: "find us", href: A_LOCATION },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "bbc-good-food-best-bakeries-london",
    title: "Named one of London's best bakeries by BBC Good Food",
    date: "8 April 2026",
    isoDate: "2026-04-08",
    img: "/media/blog/bakeryfront-web.jpg",
    alt: "Tray of freshly baked pandesal, ube pain au chocolat and ube mochi croissants at Cafe Mama & Sons",
    excerpt:
      "BBC Good Food's 2026 round-up of London's best bakeries includes Cafe Mama & Sons — and Time Out picked up the list a few days later.",
    keywords: [
      "best bakeries london",
      "bbc good food bakeries",
      "ube mochi croissant london",
      "filipino bakery kentish town",
    ],
    r: -3,
    body: [
      "BBC Good Food has named Cafe Mama & Sons one of the best bakeries in London in its 2026 round-up. The list celebrates bakeries that are doing something distinctive, and we were called out for our Filipino-Japanese baking — the ube mochi croissant, the ube bow, the cookie croissant and the daily pandesal that anchors everything we make.",
      "A couple of days later Time Out republished the list, calling our ube mochi croissant one of the things to walk across town for. It's been gratifying to see the bakery counter get this kind of attention — every croissant is laminated and baked here in Kentish Town, and the ube swirl uses a custard we cook fresh each morning.",
      "The fastest way to try the bakery side of the menu is on a quiet weekday morning — we open at 8am Mon–Fri and 9am at weekends. The full menu of pastries, sandos, coffee and matcha lives on our menu, and you can plan your visit from our location page.",
      [
        "Read the BBC Good Food list ",
        { text: "here", href: "https://www.bbcgoodfood.com/travel/best-bakeries-in-london" },
        ", or the Time Out write-up ",
        {
          text: "here",
          href: "https://www.timeout.com/london/news/the-17-greatest-bakeries-in-london-according-to-good-food-041026",
        },
        ".",
      ],
      [
        "When you're ready, come find us at ",
        { text: "83 Kentish Town Rd, NW1 8NY", href: A_LOCATION },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "valentines-day-heart-croissants-2026",
    title: "Heart-shaped Filipino croissants for Valentine's Day",
    date: "3 February 2026",
    isoDate: "2026-02-03",
    img: "/media/blog/ubeheart-web.jpg",
    alt: "Heart-shaped ube and chocolate croissants on a marble counter at Cafe Mama & Sons",
    excerpt:
      "Forbes, MSN, Metro, London World and The Upcoming all picked up our Valentine's Day heart-shaped Filipino-inspired croissants — here's what's on the counter for February.",
    keywords: [
      "valentines day london 2026",
      "heart shaped croissants london",
      "ube croissant london",
      "filipino bakery valentines",
    ],
    r: 4,
    body: [
      "For Valentine's Day 2026 we baked something that ended up travelling further than we expected: a heart-shaped Filipino-inspired croissant, laminated and filled with ube custard or dark chocolate. Forbes included it in their last-minute London Valentine's dining guide, MSN syndicated the story across their lifestyle desk, and London World, My London and The Upcoming all covered the launch the week before.",
      "Each croissant is shaped by hand, so the hearts aren't identical — they sit cheerfully wonky in the counter and look very pleased with themselves. Inside, the ube version uses the same purple yam custard we put in the ube mochi croissant; the chocolate version is a 70% dark ganache.",
      "They're available for a limited window each February. The rest of the year, our regular croissant lineup — plain butter, ube pain au chocolat, cookie croissant, ube bow — is on the bakery side of the menu.",
      [
        "Forbes' write-up is ",
        {
          text: "here",
          href: "https://www.forbes.com/sites/rachel-dube/2026/02/11/left-it-late-where-to-eat-and-drink-in-london-for-valentines-day-2026/",
        },
        ", The Upcoming's launch piece is ",
        {
          text: "here",
          href: "https://www.theupcoming.co.uk/2026/02/03/london-bakery-debuts-heart-shaped-filipino-inspired-croissants-for-valentines-day/",
        },
        ", and London World's coverage is ",
        {
          text: "here",
          href: "https://www.londonworld.com/whats-on/heart-shaped-croissants-london-valentines-day-5499953",
        },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "design-my-night-hojicha",
    title: "Hojicha at Cafe Mama & Sons — featured in Design My Night",
    date: "28 January 2026",
    isoDate: "2026-01-28",
    img: "/media/blog/hojicha-web.jpg",
    alt: "Iced Spanish hojicha latte on the Cafe Mama & Sons counter",
    excerpt:
      "Design My Night included Cafe Mama & Sons in its piece on the rise of hojicha in the UK. Here's what's in our cup — and why roasted green tea pairs so well with our bakery.",
    keywords: [
      "hojicha london",
      "hojicha latte uk",
      "best hojicha kentish town",
      "design my night hojicha",
    ],
    r: 2,
    body: [
      "Design My Night spent the back end of 2025 looking at why hojicha — Japan's roasted, toasted green tea — has gone from a specialist-cafe curio to one of London's most-ordered teas. Cafe Mama & Sons is one of the cafes they featured, alongside a tight list of independents pushing the drink beyond a basic latte.",
      "On our menu hojicha shows up two ways: a Spanish hojicha (with our condensed-milk Spanish base, iced or hot) and a Milo hojicha (with malty Filipino Milo). Both are made with stone-ground hojicha powder, not steeped tea, so the flavour is concentrated and the colour stays a deep caramel-bronze.",
      "Hojicha's toastiness is also why it sits so comfortably next to our bakery: pair the iced Spanish hojicha with a cookie croissant, or the Milo hojicha with a slice of milo tiramisu, and you've got a properly Filipino-Japanese pit stop.",
      [
        "Read the Design My Night feature ",
        { text: "here", href: "https://www.designmynight.com/uk/blog/the-rise-of-hojicha-uk" },
        ", or pick a drink from our ",
        { text: "menu", href: A_MENU },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "blue-monday-2026",
    title: "Blue Monday round-up: free coffee, cheap eats and a soft landing",
    date: "19 January 2026",
    isoDate: "2026-01-19",
    img: "/media/blog/mondayblues2-web.jpg",
    alt: "Filter coffee being poured at Cafe Mama & Sons on a January morning",
    excerpt:
      "Secret London, Cheapskate, The London Standard and Living 360 all included our Blue Monday offer in their 2026 round-ups. Here's the deal — and why January is a good time to come and sit in.",
    keywords: [
      "blue monday london 2026",
      "free coffee london",
      "january deals kentish town",
      "secret london blue monday",
    ],
    r: -2,
    body: [
      "For Blue Monday 2026 we ran a small, no-strings offer for the neighbourhood — and it ended up listed on Secret London, in the London Standard, on Cheapskate's newsletter and on Living 360. We're grateful, although we secretly hoped a quieter Monday would let us bake an extra tray of pandesal.",
      "If you're reading this in another January and looking for somewhere warm to land: we open at 8am Monday to Friday and 9am at weekends, and a flat white plus a longanisa pandesal is, statistically, the best £6.90 most of our regulars spend in a week.",
      "If you've spotted us via Cheapskate's newsletter or Secret London, welcome — the full menu is here on the website and you can grab directions from the location section.",
      [
        "Read Secret London's January round-up ",
        { text: "here", href: "https://secretldn.com/january-deals-discounts-freebies-2026/" },
        ", or the London Standard piece ",
        { text: "here", href: "https://www.standard.co.uk/news/uk/blue-monday-best-deals-free-b1267078.html" },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "uk-coffee-week-2025",
    title: "Free coffee for UK Coffee Week — thank you to everyone who showed up",
    date: "3 October 2025",
    isoDate: "2025-10-03",
    img: "/media/blog/coffee-web.jpg",
    alt: "Espresso shot being pulled on the Cafe Mama & Sons espresso machine",
    excerpt:
      "We ran a Free Coffee Friday for UK Coffee Week 2025 — and The Upcoming, London Post, Metro Slice and Cheapskate all helped get the secret code out.",
    keywords: [
      "uk coffee week 2025",
      "free coffee london",
      "kentish town coffee",
      "the upcoming uk coffee week",
    ],
    r: -1,
    body: [
      "For UK Coffee Week 2025 we ran a Free Coffee Friday — a secret code unlocked a complimentary house coffee, with all proceeds across the week going to Project Waterfall to bring clean drinking water to coffee-growing communities.",
      "The London Post broke the story on the 3rd, The Upcoming picked it up the same day, and by the end of the week Metro Slice and Cheapskate's newsletter had both shared the code with their audiences. We were absolutely slammed and a few of our regulars had to queue for a cortado for the first time ever, for which we apologise and also thank you.",
      "We'll be back for UK Coffee Week 2026. In the meantime our standard coffee menu — espresso, cortado, flat white, Spanish latte, ube latte, Milo latte and the rest — is open from 8am every weekday.",
      [
        "Read The Upcoming's piece ",
        {
          text: "here",
          href: "https://www.theupcoming.co.uk/2025/10/03/kentish-towns-cafe-mama-sons-offers-free-coffee-for-uk-coffee-week-with-special-code/",
        },
        " and the London Post's coverage ",
        {
          text: "here",
          href: "https://london-post.co.uk/free-coffee-friday-at-cafe-mama-sons-for-uk-coffee-week-with-secret-code/",
        },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "ube-mochi-croissant-launch",
    title: "Introducing the Ube Mochi Croissant",
    date: "12 August 2025",
    isoDate: "2025-08-12",
    img: "/media/blog/ubebow-web.jpg",
    alt: "Ube mochi croissants dusted with sugar on the Cafe Mama & Sons bakery counter",
    excerpt:
      "The Ube Mochi Croissant — laminated butter pastry, soft mochi centre, Filipino purple-yam custard — covered by London TV, Tasting Britain, About Time and The Wordrobe.",
    keywords: [
      "ube mochi croissant",
      "ube croissant london",
      "filipino pastry london",
      "best pastries london",
    ],
    r: 1,
    body: [
      "In August 2025 we launched the Ube Mochi Croissant: a laminated butter croissant with a soft, chewy mochi centre and our house ube custard, topped with a thin shatter of caramelised sugar. London TV ran the launch announcement, Tasting Britain wrote it up in full, About Time put it on its list of London's most showstopping pastries and The Wordrobe filed it under the best things to try in London in 2025.",
      "The texture is the whole point: the croissant shatters, the mochi pulls, and the ube custard is sweet but not cloying. We make every component in-house — including the rice-flour mochi, which we cook to order in small batches so the pull stays soft.",
      "We bake a limited run each morning and they almost always sell out by early afternoon. If you'd like one, weekdays mid-morning is the safest window.",
      [
        "Read Tasting Britain's launch piece ",
        {
          text: "here",
          href: "https://tastingbritain.com/cafe-mama-sons-launches-ube-mochi-croissant-in-kentish-town/",
        },
        ", About Time's pastry round-up ",
        {
          text: "here",
          href: "https://www.abouttimemagazine.co.uk/food/about-time-you-tried-londons-most-showstopping-pastries/",
        },
        ", or The Wordrobe ",
        { text: "here", href: "https://thewordrobe.com/the-best-things-to-try-in-london-2025/" },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "matcha-trend-the-independent",
    title: "Why matcha keeps growing — featured in The Independent",
    date: "19 June 2025",
    isoDate: "2025-06-19",
    img: "/media/drinks/ubematcha-web.jpg",
    alt: "Iced ube matcha latte with a layered purple-and-green pour at Cafe Mama & Sons",
    excerpt:
      "The Independent spoke to us for its piece on the matcha trend. Here's how we approach matcha at Cafe Mama & Sons — and why ube matcha is our best seller.",
    keywords: [
      "matcha london",
      "ube matcha latte",
      "best matcha cafe london",
      "the independent matcha",
    ],
    r: 3,
    body: [
      "The Independent's feature on the matcha trend — looking at why ceremonial-grade matcha has gone from a wellness niche to one of the most-ordered drinks in UK independent cafes — included Cafe Mama & Sons among the cafes it spoke to. Living 360 and London World subsequently put us in their best-matcha-in-London round-ups.",
      "We take matcha seriously: ceremonial grade, whisked with a chasen for plain matcha and an immersion frother for milk drinks, so the texture stays silky. Our ube matcha — the deep-purple yam custard layered under a ceremonial-grade pour — is our number-one seller. The strawberry matcha, mango matcha and Spanish matcha all earn their keep too.",
      "The full matcha menu lives on our drinks page. If you've not had Filipino-style ube before, the ube matcha latte is the gentlest possible introduction.",
      [
        "Read the Independent piece ",
        {
          text: "here",
          href: "https://www.independent.co.uk/life-style/food-and-drink/features/matcha-tea-latte-trend-health-benefits-b2772204.html",
        },
        ", Living 360's matcha round-up ",
        { text: "here", href: "https://living360.uk/best-matcha-cafes-london-2025/" },
        " and London World's list ",
        {
          text: "here",
          href: "https://www.londonworld.com/lifestyle/food-and-drink/best-places-matcha-latte-london-5217083",
        },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "london-on-the-inside-feature",
    title: "Featured on London on the Inside",
    date: "7 August 2025",
    isoDate: "2025-08-07",
    img: "/media/blog/longanisa2-web.jpg",
    alt: "Cafe Mama & Sons shopfront on Kentish Town Road in Camden",
    excerpt:
      "London on the Inside spotlighted Cafe Mama & Sons as part of its Camden picks — focusing on the sandos, the Filipino bakery counter and the corn latte that nobody saw coming.",
    keywords: [
      "london on the inside cafe mama",
      "camden cafe",
      "filipino bakery camden",
      "best new cafes london",
    ],
    r: -4,
    body: [
      "Thank you to London on the Inside for spotlighting Cafe Mama & Sons as part of their Camden picks. Their write-up focuses on the foundation of what we do: reimagining the Filipino bakery using freshly baked pandesal, layering it with flavour-forward sando fillings, and pulling some properly nostalgic Filipino desserts onto the counter.",
      "They mention some of our signature dishes — the corned beef and egg mayo sandos, the adobo mushroom croquette, and our banana ensaymada pudding, which continues to be one of our most-talked-about menu items. It was great to see our sweetcorn latte and ube matcha called out too: both drinks pair well with the savoury and sweet sides of the menu.",
      "We opened Cafe Mama & Sons to share the depth of Filipino flavours through a more casual, modern format. It's encouraging to see those ideas reflected in the press and recognised by the wider London food scene.",
      [
        "Read the full write-up on London on the Inside ",
        { text: "here", href: "https://londontheinside.com/location/cafe-mama-sons/" },
        ", and London on the Inside's best-sandwiches map (which also includes us) ",
        { text: "here", href: "https://londontheinside.com/map/best-sandwiches-in-london/#pin273432" },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "feed-the-lion-opening",
    title: "Opening day: Feed the Lion and Ham & High mark the launch",
    date: "11 April 2025",
    isoDate: "2025-04-11",
    img: "/media/blog/storefront.jpg",
    alt: "Cafe Mama & Sons interior with the open kitchen and bakery counter on opening week",
    excerpt:
      "Cafe Mama & Sons opened on Kentish Town Road in April 2025. Feed the Lion, Ham & High and London on the Inside covered the launch — here's how it began.",
    keywords: [
      "cafe mama and sons opening",
      "feed the lion kentish town",
      "ham and high cafe mama",
      "new kentish town cafe",
    ],
    r: 2,
    body: [
      "Cafe Mama & Sons opened on 83 Kentish Town Road in spring 2025 as the cafe-and-bakery sister to Mamasons. The launch was covered by Feed the Lion (alongside our sister site Hoodwood), Ham & High and London on the Inside, who each picked up the story that Kentish Town Road's corner site had quietly become a Filipino-Japanese cafe.",
      "From the start the brief was simple: freshly baked pandesal every morning, sandos built with care, proper coffee and matcha, and a bakery counter that takes Filipino flavours seriously. The menu has grown since — the ube mochi croissant, the Spanish hojicha, the Valentine's heart croissants, the meal deal — but the original lineup is all still there.",
      "If you've not been since opening week, an awful lot has happened. The fastest way to catch up is the menu page; the address and opening hours live on the location section.",
      [
        "Read the Feed the Lion launch piece ",
        { text: "here", href: "https://www.feedthelion.co.uk/hoodwood-cafe-mama-sons-london/" },
        ", Ham & High's profile ",
        {
          text: "here",
          href: "https://www.hamhigh.co.uk/news/25074733.meet-man-opening-three-restaurants-kentish-town/",
        },
        " and London on the Inside's openings list ",
        { text: "here", href: "https://londontheinside.com/the-best-new-restaurants-opening-in-2025/" },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "british-sandwich-week-mama-li",
    title: "British Sandwich Week: the Adobo Duck Sando with Mama Li",
    date: "14 May 2026",
    isoDate: "2026-05-14",
    img: "/media/blog/adoboduck-web.jpg",
    alt: "Adobo duck sando with crispy skin and pickled cucumber at Cafe Mama & Sons",
    excerpt:
      "For British Sandwich Week 2026 we teamed up with Chinatown's Mama Li on a limited Adobo Duck Sando — covered by London TV, British Baker, Hardens, Feast London and more.",
    keywords: [
      "british sandwich week 2026",
      "adobo duck sando",
      "mama li cafe mama collab",
      "best sandwiches london",
    ],
    r: -3,
    body: [
      "For British Sandwich Week 2026 we collaborated with Mama Li in Chinatown on a limited-edition Adobo Duck Sando: chopped Cantonese-roast duck glazed in Filipino adobo, crispy skin, a pickled cucumber and chilli mayo, served between our daily-baked milk-bread sando loaf.",
      "London TV broke the news on the 14th, British Baker filed a longer feature in their British Sandwich Week round-up, and Feast London, Sausage Press, Nibbling London, Hardens Bites and London Secrets all covered the collab across the same week.",
      "Collabs like this are part of why we opened the cafe in the first place — bringing the Maginhawa Group's Filipino approach to flavour into conversation with other independent kitchens around London. Look out for the next limited sando around major food-week moments through the rest of the year.",
      [
        "London TV's piece is ",
        {
          text: "here",
          href: "https://london-tv.co.uk/cafe-mama-sons-x-mama-li-launch-limited-adobe-duck-sandwich-for-british-sandwich-week/",
        },
        " and British Baker's coverage is ",
        {
          text: "here",
          href: "https://bakeryinfo.co.uk/finished-goods/from-roast-duck-to-biscoff-limited-edition-eats-for-british-sandwich-week-2026/719270.article",
        },
        ".",
      ],
    ],
    author: AUTHOR,
  },

  {
    slug: "best-bakeries-bakery-trail",
    title: "On In London and Luxury Lifestyle Mag put us on London's bakery trail",
    date: "15 May 2026",
    isoDate: "2026-05-15",
    img: "/media/blog/bakery-web.jpg",
    alt: "Pastry counter at Cafe Mama & Sons stacked with ube croissants, cookie croissants and pandesal",
    excerpt:
      "On In London built a National Baking Day trail of London's best sweet treats — we made the cut, and Luxury Lifestyle Mag picked the list up the following week.",
    keywords: [
      "london bakery trail",
      "national baking day london",
      "best sweet treats london",
      "luxury lifestyle bakery",
    ],
    r: 1,
    body: [
      "For National Baking Day, On In London put together a walking trail of London's best sweet-treat bakeries — and Cafe Mama & Sons made the cut. The following week Luxury Lifestyle Mag re-published the trail, and The Staff Canteen wrote a longer commentary piece on London's bakery boom that referenced our approach.",
      "We're a small bakery — everything is laminated and finished here on Kentish Town Road by a tiny team — so it's properly nice to be folded into a list of this quality. The standouts on the bakery counter remain the ube mochi croissant, the cookie croissant, the ube bow, the milo tiramisu and (always, always) the daily pandesal.",
      "If you're doing the full trail, time us early — we open at 8am Mon–Fri and 9am at weekends, and the pastries are best the moment they hit the counter.",
      [
        "On In London's National Baking Day trail is ",
        {
          text: "here",
          href: "http://onin.london/celebrate-national-baking-day-with-a-bakery-trail-of-londons-best-sweet-treats/",
        },
        ", and Luxury Lifestyle Mag's version is ",
        {
          text: "here",
          href: "https://www.luxurylifestylemag.co.uk/food-and-drink/a-bakery-trail-of-londons-best-sweet-treats/",
        },
        ".",
      ],
    ],
    author: AUTHOR,
  },
];

export const POSTS_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p]),
);

export function getPost(slug: string): BlogPost | undefined {
  return POSTS_BY_SLUG[slug];
}
