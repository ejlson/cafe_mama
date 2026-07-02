import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import TvHero from "@/components/TvHero";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import CrtOverlay from "@/components/CrtOverlay";
import CustomCursor from "@/components/CustomCursor";
import MusicToggle from "@/components/MusicToggle";
import MenuReveal from "@/components/MenuReveal";
import Scrollbar from "@/components/Scrollbar";
import W4WBadge from "@/components/W4WBadge";
import GalleryOverlay from "@/components/GalleryOverlay";
import OpeningClock from "@/components/OpeningClock";
import FocusMode from "@/components/FocusMode";

export default function Home() {
  return (
    <>
      {/* Fixed UI lives OUTSIDE the smooth wrapper so it isn't transformed. */}
      <Navbar />
      {/* The hero is a separate fixed layer (not in the scroll flow), toggled by
          the morph transition — so the menu never peeks behind it and vice-versa. */}
      <TvHero videoSrc="/media/hero-draft3-web.mp4" />
      {/* Footer is pinned to the viewport BEHIND the smooth-scroll content.
          The menu card scrolls up over it; as main exits the bottom of the
          screen, the footer is revealed underneath. */}
      <Footer />
      <SmoothScroll>
        <main>
          {/* H1 for SEO — visually hidden via sr-only so it doesn't intrude
              on the broadcast-style hero layout, but crawlers read it as the
              page's primary topic. Without this, the document has no H1
              (MENU / BLOG / LOCATION are H2s) which weakens topical signal. */}
          <h1 className="sr-only">
            Cafe Mama &amp; Sons — Filipino-Japanese cafe &amp; bakery on
            Kentish Town Road, London NW1. Pandesal sandos, ube mochi
            croissants, Spanish &amp; ube lattes, ceremonial-grade matcha,
            and a £14 weekday meal deal.
          </h1>
          {/* "Card" wrapping the menu. The bottom corners START square; a
              scroll-driven scrub in Footer.tsx rounds them as the user
              scrolls, so it feels like the menu peels off the page and
              the footer behind it shows through the corners. */}
          <div
            data-menu-card
            // pointer-events-auto re-enables interactivity for the menu
            // content. The parent SmoothScroll wrappers carry pointer-events-
            // none so they don't swallow clicks meant for the fixed footer
            // beneath them — Tailwind v4 / Chromium evaluates the descendants
            // as inheriting that `none`, so we explicitly opt back in here.
            className="pointer-events-auto relative z-10 overflow-hidden"
          >
            <Menu />
          </div>
        </main>
        {/* Spacer — gives ScrollSmoother runway to carry the menu card fully
            off the top of the viewport, exposing the fixed footer beneath.
            pointer-events-none so it doesn't swallow clicks meant for the
            footer's social/delivery nav once it's been revealed. */}
        <div aria-hidden className="pointer-events-none h-screen w-full" />
      </SmoothScroll>
      {/* Full-screen hero→menu morph transition + its bottom-centre trigger. */}
      <MenuReveal />
      <CrtOverlay />
      <CustomCursor />
      <MusicToggle />
      <Scrollbar />
      {/* Waves For Water teardrop badge + its info modal. */}
      <W4WBadge />
      {/* Swipe-in horizontal gallery page, opened by the navbar Gallery link. */}
      <GalleryOverlay />
      {/* Opening-hours watch — drag to spin; sat above the gallery badge. */}
      <OpeningClock className="fixed bottom-[9.5rem] right-6 z-[55] h-28 w-28 sm:bottom-[10.5rem] sm:h-32 sm:w-32" />
      {/* Focus mode — square video bottom-left + AI-voice narration of the script. */}
      <FocusMode />
    </>
  );
}
