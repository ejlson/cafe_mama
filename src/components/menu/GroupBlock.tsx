"use client";

import { useState } from "react";
import type { Group, Item } from "@/lib/menu-data";
import FullRule from "@/components/menu/FullRule";

function ItemRow({ item, body, dot }: { item: Item; body: string; dot: string }) {
  const hasDesc = Boolean(item.desc);
  const [expanded, setExpanded] = useState(false);

  return (
    // A touch more row air on mobile — the stacked name + leader layout needs
    // it to read as distinct rows in the two-column grid.
    <li className="py-1.5 sm:py-1">
      {/* Name + price header.
          sm+  — single row: name on the left, dotted leader filling the gap,
                 price anchored to the right baseline.
          <sm  — the name gets the FULL column width (so it holds to 1–2
                 lines), and the price drops UNDERNEATH on its own row with a
                 continuous dotted leader running from the left edge until the
                 price lands on the right.
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

        {/* mobile stacked layout — name block, then leader row + price */}
        <span className="block w-full sm:hidden">
          <span
            style={{ color: body }}
            className="block font-arialblack text-[15px] uppercase leading-tight tracking-tight [text-wrap:balance]"
          >
            {item.name}
          </span>
          <span className="mt-0.5 flex w-full items-baseline">
            <span
              aria-hidden
              style={{ borderColor: dot }}
              className="mr-1.5 flex-1 translate-y-[-3px] border-b-2 border-dotted"
            />
            <span
              style={{ color: body }}
              className="shrink-0 font-arialblack text-[13px] leading-none"
            >
              {item.price}
            </span>
            {/* Expand chevron — subtle, indicates this row has more info.
                Rotates 45° when open. Hidden on rows without a desc. */}
            {hasDesc && (
              <span
                aria-hidden
                style={{ color: body }}
                className={`ml-1.5 inline-block shrink-0 text-[13px] leading-none opacity-60 transition-transform ${
                  expanded ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            )}
          </span>
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

// Split a group title into two stacked lines — MOBILE ONLY — so the blurb can
// sit beside it in the narrow column: break AFTER the "/" when there is one
// ("Sando/" + "Sandwiches"), otherwise at the last space ("All-Day" +
// "Breakfast", "Baked" + "Goods"). Single-word titles stay on one line.
// From sm: up the title renders as a single unbroken line.
function splitTitle(title: string): string[] {
  const slash = title.indexOf("/");
  if (slash > 0 && slash < title.length - 1)
    return [title.slice(0, slash + 1), title.slice(slash + 1)];
  const space = title.lastIndexOf(" ");
  if (space > 0) return [title.slice(0, space), title.slice(space + 1)];
  return [title];
}

function GroupTitle({
  children,
  accent,
  split,
}: {
  children: string;
  accent: string;
  split?: boolean;
}) {
  const lines = split ? splitTitle(children) : [children];
  return (
    <h3
      className="font-cheee min-w-0 shrink-0 text-3xl uppercase leading-[0.95] tracking-tight sm:text-6xl"
      style={{ color: accent }}
    >
      {split && lines.length > 1 ? (
        <>
          {/* mobile: two stacked lines */}
          <span className="sm:hidden">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </span>
          {/* desktop: one unbroken line */}
          <span className="hidden whitespace-nowrap sm:block">{children}</span>
        </>
      ) : (
        children
      )}
    </h3>
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
      {/* Header row — mobile: two-line title left, blurb beside it (nowrap
          keeps them side by side in the narrow column). sm+: single-line
          title with the blurb to its right; if a mid-size viewport can't fit
          both, the blurb (basis-64) wraps below rather than crushing. */}
      <div className="flex flex-nowrap items-start gap-x-4 gap-y-1 sm:flex-wrap sm:gap-x-8">
        <GroupTitle accent={accent} split={Boolean(group.blurb)}>
          {group.title}
        </GroupTitle>
        {group.blurb && (
          <p
            style={{ color: body }}
            className="min-w-0 flex-1 pt-1 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-70 sm:basis-64 sm:pt-1.5 sm:text-xs"
          >
            {group.blurb}
          </p>
        )}
      </div>
      {/* rule under the header + blurb */}
      <FullRule color={accent} className="mt-2" />
      {/* Two-column list on ALL screen sizes when the group is Food/Drinks —
          previously only kicked in at sm:. On mobile a single column was
          leaving the menu feeling long and empty; two cols pack the items
          into a scannable grid without pushing the type below legibility. */}
      <ul className={`mt-3 ${twoCol ? "grid grid-cols-2 gap-x-4 sm:gap-x-14" : ""}`}>
        {group.items.map((it) => (
          <ItemRow key={it.name} item={it} body={body} dot={dot} />
        ))}
      </ul>
    </div>
  );
}
