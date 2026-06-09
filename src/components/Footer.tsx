export default function Footer() {
  return (
    <footer
      className="py-12 text-ink"
      style={{
        background: "linear-gradient(180deg, #f4ebd5 0%, #e7dcc2 100%)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          {/* <p className="font-display text-2xl leading-none tracking-tight">
            CAFE MAMA <span className="font-hand lowercase">&amp; sons</span>
          </p> */}
          {/* <p className="mt-1 text-sm text-ink-soft">
            83 Kentish Town Rd, London NW1 8NY
          </p> */}
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <a href="#menu" className="hover:opacity-60">
            Menu
          </a>
          <a href="#location" className="hover:opacity-60">
            Location
          </a>
          <a href="#gallery" className="hover:opacity-60">
            Gallery
          </a>
          <a
            href="https://www.instagram.com/cafe_mama_sons/"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-60"
          >
            Instagram
          </a>
        </nav>
      </div>
      <p className="mt-8 text-center text-[11px] uppercase tracking-[0.3em] text-ink-soft/70">
        © {new Date().getFullYear()} Cafe Mama &amp; Sons · Broadcasting on CH 03
      </p>
    </footer>
  );
}
