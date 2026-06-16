import type { Metadata } from "next";
import { Anton, Archivo, Caveat, Archivo_Black } from "next/font/google";
import "./globals.css";

// Web-loaded Arial Black equivalent — Arial Black is a system font that isn't
// present everywhere, so the poster headings/nav could fall back to a thinner
// Arial. Archivo Black guarantees the heavy look across devices.
const archivoBlack = Archivo_Black({
  variable: "--font-black",
  weight: "400",
  subsets: ["latin"],
});

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

export const metadata: Metadata = {
  metadataBase: new URL("https://cafemamasons.example"),
  title: "Cafe Mama & Sons — Kentish Town",
  description:
    "Cafe Mama & Sons — Filipino-inspired coffee, matcha, sandos & meal deals on Kentish Town Road, NW1. Honey Peach Mango, Ube Matcha Latte, Spanish Latte and more.",
  openGraph: {
    title: "Cafe Mama & Sons",
    description:
      "Filipino-inspired coffee, matcha, sandos & meal deals on Kentish Town Road, NW1.",
    images: ["/media/shopfront.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${caveat.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
