import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import TvHero from "@/components/TvHero";
import Menu from "@/components/Menu";
// import Gallery from "@/components/Gallery"; // removed for now (bento gallery kept in component)
import Footer from "@/components/Footer";
import CrtOverlay from "@/components/CrtOverlay";
import CustomCursor from "@/components/CustomCursor";
import MusicToggle from "@/components/MusicToggle";
import MenuReveal from "@/components/MenuReveal";
import Scrollbar from "@/components/Scrollbar";

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
          <div className="relative z-10">
            <Menu />
            {/* <Gallery /> removed for now */}
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
    </>
  );
}
