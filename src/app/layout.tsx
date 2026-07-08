import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Caveat, Archivo_Black } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/blog";
import { cldUrl } from "@/lib/cloudinary";

// Web-loaded Arial Black equivalent — Arial Black is a system font that isn't
// present everywhere, so the poster headings/nav could fall back to a thinner
// Arial. Archivo Black guarantees the heavy look across devices.
const archivoBlack = Archivo_Black({
  variable: "--font-black",
  weight: "400",
  subsets: ["latin"],
});

// Cheee T-Bone (Adobe Fonts / Typekit) for the MENU, LOCATION and BLOG poster
// titles. The kit stylesheet is loaded via <link> in the <head> below.

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Cafe Mama & Sons is a Filipino-Japanese cafe and bakery on Kentish Town Road, NW1. Freshly baked pandesal sandos, ube mochi croissants, ceremonial-grade matcha, Spanish & ube lattes, and a £14 weekday meal deal.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cafe Mama & Sons — Filipino-Japanese cafe & bakery, Kentish Town",
    template: "%s · Cafe Mama & Sons",
  },
  description: DESCRIPTION,
  applicationName: "Cafe Mama & Sons",
  keywords: [
    "Cafe Mama & Sons",
    "Cafe Mama and Sons",
    "Filipino cafe London",
    "Filipino bakery London",
    "Kentish Town cafe",
    "ube mochi croissant",
    "ube matcha latte",
    "Spanish latte London",
    "honey peach mango",
    "sando London",
    "Filipino sandwich",
    "Maginhawa Group",
    "pandesal London",
    "Filipino brunch London",
  ],
  authors: [{ name: "Cafe Mama & Sons" }],
  creator: "Cafe Mama & Sons",
  publisher: "Cafe Mama & Sons",
  category: "food",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Cafe Mama & Sons",
    title: "Cafe Mama & Sons — Filipino-Japanese cafe & bakery, Kentish Town",
    description: DESCRIPTION,
    locale: "en_GB",
    images: [
      {
        url: cldUrl("/media/shopfront.jpg"),
        width: 1200,
        height: 630,
        alt: "Cafe Mama & Sons shopfront on Kentish Town Road, London NW1",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cafe Mama & Sons — Filipino-Japanese cafe & bakery, Kentish Town",
    description: DESCRIPTION,
    images: [cldUrl("/media/shopfront.jpg")],
    creator: "@cafe_mama_sons",
    site: "@cafe_mama_sons",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Square Cafe Mama wordmark on brand gold — generated from
  // public/media/logo/CAFE MAMA SQUARE LOGO.png into src/app/favicon.ico,
  // icon.png (512) and apple-icon.png (180).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4c33c",
  colorScheme: "light",
};

// Schema.org Restaurant — gives Google rich-result eligibility for opening
// hours, address, geo, menu and the sameAs social profiles.
const RESTAURANT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: "Cafe Mama & Sons",
  alternateName: ["Cafe Mama and Sons", "CM&S"],
  description: DESCRIPTION,
  url: SITE_URL,
  image: [
    cldUrl("/media/shopfront.jpg"),
    cldUrl("/media/g-shopfront-full.jpg"),
    cldUrl("/media/drinks/ubematcha-web.jpg"),
  ],
  logo: `${SITE_URL}/icon.png`,
  email: "hello@cafemamasons.com",
  priceRange: "££",
  servesCuisine: ["Filipino", "Japanese", "Cafe", "Bakery"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "83 Kentish Town Rd",
    addressLocality: "London",
    addressRegion: "Greater London",
    postalCode: "NW1 8NY",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.5436,
    longitude: -0.1414,
  },
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=Cafe+Mama+%26+Sons%2C+83+Kentish+Town+Rd%2C+London+NW1+8NY",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  hasMenu: { "@id": `${SITE_URL}/#menu-schema` },
  acceptsReservations: false,
  // Aggregate rating sourced from the live Google Business profile —
  // refresh manually as the count grows. Without this, the star-rating
  // rich result is ineligible.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.2",
    reviewCount: "77",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://www.instagram.com/cafe_mama_sons/",
    "https://www.theinfatuation.com/london/reviews/cafe-mama-sons",
    "https://guide.michelin.com/tw/en/greater-london/london/restaurant/belly",
  ],
};

// WebSite — gives Google the canonical site name + an in-site search URL
// pattern (used by some surfaces; harmless if unused).
const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Cafe Mama & Sons",
  publisher: { "@id": `${SITE_URL}/#restaurant` },
  inLanguage: "en-GB",
};

// Menu — structured Menu → MenuSection → MenuItem graph that mirrors
// what's rendered in src/components/Menu.tsx. Eligible for the Google
// restaurant menu rich result. Keep prices in GBP and titles in sync
// with the visible menu (any future edits there should be reflected
// here too).
const GBP = (price: string) => ({
  "@type": "Offer",
  price,
  priceCurrency: "GBP",
});
const item = (
  name: string,
  price: string,
  description?: string,
): Record<string, unknown> => ({
  "@type": "MenuItem",
  name,
  ...(description ? { description } : {}),
  offers: GBP(price),
});

const MENU_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${SITE_URL}/#menu-schema`,
  name: "Cafe Mama & Sons Menu",
  inLanguage: "en-GB",
  hasMenuSection: [
    {
      "@type": "MenuSection",
      name: "Sandos / Sandwiches",
      hasMenuItem: [
        item(
          "Chilli Kimchi Chicken",
          "9.00",
          "Crispy chicken, chilli crisp, kimchi mayo, American cheese, tomatoes and lettuce.",
        ),
        item("Egg Mayo", "8.50", "Creamy egg mayo with chives and onion."),
        item(
          "Tuna Melt",
          "8.50",
          "Tuna mayo with sweetcorn, topped with crispy melted cheddar.",
        ),
        item(
          "Jerk Chicken",
          "9.50",
          "Jerk chicken with mayo, fresh tomato and pesto.",
        ),
        item(
          "Adobo Mushroom",
          "9.00",
          "Crispy croquette stuffed with creamy adobo mushrooms and rich pesto.",
        ),
        item(
          "Corned Beef",
          "10.50",
          "Corned beef croquette with lettuce and mayo.",
        ),
      ],
    },
    {
      "@type": "MenuSection",
      name: "All-Day Breakfast (Pandesal)",
      hasMenuItem: [
        item("Egg Pandesal", "5.50"),
        item("Longanisa Pandesal", "9.00"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Sides",
      hasMenuItem: [
        item("Box of Tater-Tots", "4.50"),
        item("Box of Crisps", "4.00"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Baked Goods",
      hasMenuItem: [
        item("Honey Toast", "2.99"),
        item("Honey Garlic Twist", "4.80"),
        item("Spanish Bread", "3.50"),
        item("Croissant", "2.90"),
        item("Cookie Croissant", "6.00"),
        item("Almond Croissant", "3.50"),
        item("Miso Cookie", "3.99"),
        item("Ube Bow", "4.90"),
        item("Ube Pain Au Chocolat", "5.50"),
        item("Pain Au Chocolat", "3.00"),
        item("Peanutsal", "4.00"),
        item("Gianduja", "5.50"),
        item("Banana Pudding", "5.50"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Coffee",
      hasMenuItem: [
        item("Espresso", "3.20"),
        item("Cortado", "3.50"),
        item("Macchiato", "3.50"),
        item("Flat White", "3.70"),
        item("Latte (Iced/Hot)", "3.90"),
        item("Cappuccino", "3.90"),
        item("Americano (Iced/Hot)", "3.50"),
        item("Spanish Latte (Iced/Hot)", "5.20"),
        item("Ube Latte (Iced/Hot)", "6.20"),
        item("Milo Latte (Iced/Hot)", "6.20"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Matcha",
      hasMenuItem: [
        item("Mango Matcha", "5.70"),
        item("Strawberry Matcha", "5.70"),
        item("Spanish Matcha (Iced/Hot)", "5.20"),
        item("Ube Matcha (Iced/Hot)", "6.20"),
        item("Milo Matcha (Iced/Hot)", "6.20"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Tea",
      hasMenuItem: [
        item("Calamansi Ade/Tea", "4.70"),
        item("Honey Peach Mango", "4.70"),
        item("Strawberry Tea", "4.70"),
        item("Spanish Hojicha (Iced/Hot)", "6.00"),
        item("Milo Hojicha (Iced/Hot)", "6.00"),
      ],
    },
    {
      "@type": "MenuSection",
      name: "Protein Shake",
      hasMenuItem: [
        item("Mango Float", "8.50"),
        item("Chocnut", "8.50"),
        item("Avocado Pandan", "8.50"),
      ],
    },
  ],
};

// FAQPage — eligible for the "People also ask" rich result. Questions are
// the ones most-Googled around the cafe (opening hours, what's served,
// where to find them, meal deal). Keep answers tight and factual.
const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is Cafe Mama & Sons?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "83 Kentish Town Rd, London NW1 8NY — a corner spot between Camden Lock and Kentish Town Station.",
      },
    },
    {
      "@type": "Question",
      name: "What are Cafe Mama & Sons' opening hours?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Monday to Friday from 8am, Saturday and Sunday from 9am, closing at 5pm. The kitchen serves all-day breakfast meals and sandos until close.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of food does Cafe Mama & Sons serve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Filipino-Japanese cafe and bakery: freshly-made pandesal sandos, all-day breakfast meals, unique house drinks (ube matcha, Spanish latte, honey peach mango), and baked goods like the ube mochi croissant.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a meal deal at Cafe Mama & Sons?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — a £14 weekday meal deal includes a sando of your choice, house-made nori crisps and any drink. Available all day.",
      },
    },
    {
      "@type": "Question",
      name: "Does Cafe Mama & Sons take reservations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — Cafe Mama & Sons is walk-in only.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${anton.variable} ${archivo.variable} ${caveat.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <head>
        {/* Every image + the hero video streams from Cloudinary — opening
            the connection during HTML parse shaves the DNS/TLS handshake off
            the LCP image (poster) and the hero stream. */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Cheee T-Bone (and the rest of the Typekit kit) for the poster
            titles. Loaded ahead of body so the title swap doesn't flash. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/pev2vne.css" />
      </head>
      <body className="min-h-full">
        {children}
        {/* Structured data — rendered as script tags so Google can parse
            the restaurant entity (opening hours, address, social profiles),
            the WebSite identity, and the FAQ block (eligible for "People
            also ask" rich results). */}
        {[RESTAURANT_JSONLD, MENU_JSONLD, WEBSITE_JSONLD, FAQ_JSONLD].map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            // safe: we control the object; </script> escaped for inline use.
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
            }}
          />
        ))}
      </body>
    </html>
  );
}
