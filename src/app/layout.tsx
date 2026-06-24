import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Caveat, Archivo_Black } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/blog";

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
        url: "/media/shopfront.jpg",
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
    images: ["/media/shopfront.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
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
    `${SITE_URL}/media/shopfront.jpg`,
    `${SITE_URL}/media/g-shopfront-full.jpg`,
    `${SITE_URL}/media/drinks/ubematcha-web.jpg`,
  ],
  logo: `${SITE_URL}/favicon.ico`,
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
  hasMenu: `${SITE_URL}/#menu`,
  acceptsReservations: false,
  sameAs: [
    "https://www.instagram.com/cafe_mama_sons/",
    "https://www.theinfatuation.com/london/reviews/cafe-mama-sons",
    "https://guide.michelin.com/tw/en/greater-london/london/restaurant/belly",
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
        {/* Cheee T-Bone (and the rest of the Typekit kit) for the poster
            titles. Loaded ahead of body so the title swap doesn't flash. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/pev2vne.css" />
      </head>
      <body className="min-h-full">
        {children}
        {/* Restaurant structured data — rendered as a script tag so Google can
            parse opening hours, address, menu link, and the social profiles. */}
        <script
          type="application/ld+json"
          // safe: we control the object; serialised with </script> escape.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(RESTAURANT_JSONLD).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </body>
    </html>
  );
}
