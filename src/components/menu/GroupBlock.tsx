"use client";

import { useState } from "react";
import type { Group, Item } from "@/lib/menu-data";
import FullRule from "@/components/menu/FullRule";

function ItemRow({ item, body, dot }: { item: Item; body: string; dot: string }) {
  const hasDesc = Boolean(item.desc);
  const [expanded, setExpanded] = useState(false);

  return (
    // A touch more row air on mobile — full-width single-column rows need the
    // vertical rhythm to read as separate entries.
    <li className="py-2 sm:py-1">
      {/* Name + price header.
          sm+  — single row: name on the left, dotted leader filling the gap,
                 price anchored to the right baseline.
          <sm  — printed-menu row: name left, price right, one shared
                 baseline, NO dotted leader — the quiet gap does the work.
          If there's a description, the whole header doubles as a tap target
          on mobile to toggle it open (desktop always shows the desc so the
          button is inert there). */}
      <button
        type="button"
        onClick={hasDesc ? () => setExpanded((v) => !v) : undefined}
        aria-expanded={hasDesc ? expanded : undefined}
        className={`block w-full text-left ${
          hasDesc ? "cursor-pointer sm:cursor-default" : ""
        }`}
      >
        {/* sm+ single-row layout */}
        <span className="hidden w-full items-baseline gap-2 sm:flex">
          <span
            style={{ color: body }}
            // NO flex-1 here — the name must size to its content so the
            // dotted leader (the only flex-1 item) runs the full gap from
            // name to price. min-w-0 still lets long names wrap.
            className="min-w-0 font-arialblack uppercase leading-tight tracking-tight [text-wrap:balance] sm:text-xl"
          >
            {item.name}
          </span>
          <span
            aria-hidden
            style={{ borderColor: dot }}
            className="mx-1 flex-1 translate-y-[-4px] border-b-[3px] border-dotted"
          />
          <span
            style={{ color: body }}
            className="shrink-0 font-arialblack leading-none sm:text-xl"
          >
            {item.price}
          </span>
        </span>

        {/* mobile single-row layout — name left, price right, one baseline,
            dotted leader filling the gap. The leader is an empty baseline-
            aligned span whose bottom border IS the dots, so the dot row sits
            exactly on the shared text baseline (the visual bottom of the
            uppercase name and the price). min-w-0 lets long names wrap while
            the leader — the only flex-1 item — keeps the gap filled. */}
        <span className="flex w-full items-baseline sm:hidden">
          <span
            style={{ color: body }}
            className="min-w-0 font-arialblack text-[15px] uppercase leading-tight tracking-tight"
          >
            {item.name}
          </span>
          <span
            aria-hidden
            style={{ borderColor: dot }}
            className="mx-1.5 flex-1 border-b-2 border-dotted"
          />
          <span
            style={{ color: body }}
            className="shrink-0 font-arialblack text-[15px] leading-none"
          >
            {item.price}
          </span>
          {/* Expand chevron — subtle, indicates this row has more info.
              Rotates 45° when open. Hidden on rows without a desc. */}
          {hasDesc && (
            <span
              aria-hidden
              style={{ color: body }}
              className={`inline-block shrink-0 text-[13px] leading-none opacity-60 transition-transform duration-150 ease-out ${
                expanded ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          )}
        </span>
      </button>

      {/* Description — mobile hides it behind the tap-to-expand toggle above.
          sm+ always shows it because there's room on wide rows. */}
      {item.desc && (
        <p
          style={{ color: body }}
          className={`mt-1 max-w-prose text-xs font-semibold uppercase leading-snug tracking-wide opacity-70 sm:block sm:text-[13px] ${
            expanded ? "block" : "hidden"
          }`}
        >
          {item.desc}
          {item.allergens && (
            <span className="opacity-70"> ({item.allergens})</span>
          )}
        </p>
      )}
    </li>
  );
}

export default function GroupBlock({
  group,
  accent,
  body,
  dot,
  twoCol,
}: {
  group: Group;
  accent: string;
  body: string;
  dot: string;
  twoCol?: boolean;
}) {
  return (
    <div className="mt-1">
      {/* Header — mobile: single-line title (vw-sized so the longest titles
          still fit the narrow column unbroken) with the blurb stacked
          underneath it. sm+: single-line title with the blurb to its right;
          if a mid-size viewport can't fit both, the blurb (basis-64) wraps
          below rather than crushing. */}
      <div className="flex flex-col gap-y-1 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-8">
        <h3
          className="font-cheee min-w-0 shrink-0 whitespace-nowrap text-[7.5vw] uppercase leading-[0.95] tracking-tight sm:text-6xl"
          style={{ color: accent }}
        >
          {group.title}
        </h3>
        {group.blurb && (
          <p
            style={{ color: body }}
            className="min-w-0 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-70 sm:flex-1 sm:basis-64 sm:pt-1.5 sm:text-xs"
          >
            {group.blurb}
          </p>
        )}
      </div>
      {/* rule under the header + blurb */}
      <FullRule color={accent} className="mt-2" />
      {/* Mobile: single column — full-width printed-menu rows (the old
          two-col grid crushed names into ~150px and read as noise under the
          floating widgets). sm+ keeps the two-column grid for Food/Drinks. */}
      <ul className={`mt-3 ${twoCol ? "sm:grid sm:grid-cols-2 sm:gap-x-14" : ""}`}>
        {group.items.map((it) => (
          <ItemRow key={it.name} item={it} body={body} dot={dot} />
        ))}
      </ul>
    </div>
  );
}
