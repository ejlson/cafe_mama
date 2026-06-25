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
import GallerySpin from "@/components/GallerySpin";
import OpeningClock from "@/components/OpeningClock";
import FocusMode from "@/components/FocusMode";

export default function Home() {
  return (
    <>
      {/* Fixed UI lives OUTSIDE the smooth wrapper so it isn't transformed. */}
      <Navbar />
      {/* The hero is a separate fixed layer (not in the scroll flow), toggled by
          the morph transition — so the menu never peeks behind it and vice-versa. */}
      <TvHero videoSrc="/media/hero-draft3.mp4" />
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
          <div className="relative z-10">
            <Menu />
          </div>
        </main>
        <Footer />
      </SmoothScroll>
      {/* Full-screen hero→menu morph transition + its bottom-centre trigger. */}
      <MenuReveal />
      <CrtOverlay />
      <CustomCursor />
      <MusicToggle />
      <Scrollbar />
      {/* Spinning gallery badge + its swipe-in horizontal gallery page. */}
      <GallerySpin />
      {/* Opening-hours watch — drag to spin; sat above the gallery badge. */}
      <OpeningClock className="fixed bottom-[9.5rem] right-6 z-[55] h-28 w-28 sm:bottom-[10.5rem] sm:h-32 sm:w-32" />
      {/* Focus mode — square video bottom-left + AI-voice narration of the script. */}
      <FocusMode />
    </>
  );
}
