import type { Metadata } from "next";
import Link from "next/link";

/**
 * Custom 404 page. Lightweight, on-brand, and gives the user three obvious
 * exit ramps (home, blog, location). Server-rendered for clean indexing —
 * we set noindex so search engines don't surface error pages themselves.
 */

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "We can't find that page. Head back to the menu or come and see us at 83 Kentish Town Rd, London NW1 8NY.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-start justify-center px-4 py-16 sm:px-8">
      <p className="font-arialblack text-xs uppercase tracking-[0.3em] opacity-70">
        404
      </p>
      <h1 className="mt-3 font-arialblack text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        That page hopped out
        <br />
        for a sando.
      </h1>
      <p className="mt-6 max-w-prose text-base leading-relaxed opacity-85 sm:text-lg">
        We couldn&apos;t find what you were looking for. The cafe&apos;s still
        on Kentish Town Road, the bakery counter&apos;s still open, and the
        menu hasn&apos;t moved.
      </p>

      <ul className="mt-10 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
        <li>
          <Link
            href="/"
            className="inline-block rounded-full border-[3px] border-current px-5 py-3 transition-transform hover:-translate-y-0.5"
          >
            Back to home
          </Link>
        </li>
        <li>
          <Link
            href="/#menu"
            className="inline-block rounded-full border-[3px] border-current px-5 py-3 transition-transform hover:-translate-y-0.5"
          >
            See the menu
          </Link>
        </li>
        <li>
          <Link
            href="/blog"
            className="inline-block rounded-full border-[3px] border-current px-5 py-3 transition-transform hover:-translate-y-0.5"
          >
            Read the blog
          </Link>
        </li>
        <li>
          <Link
            href="/#location"
            className="inline-block rounded-full border-[3px] border-current px-5 py-3 transition-transform hover:-translate-y-0.5"
          >
            Find the cafe
          </Link>
        </li>
      </ul>
    </main>
  );
}
