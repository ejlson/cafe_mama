"use client";

import { useState } from "react";
import type { Group, Item } from "@/lib/menu-data";
import FullRule from "@/components/menu/FullRule";
import { usePreview } from "@/components/menu/MenuImagePreview";

function ItemRow({ item, body, dot }: { item: Item; body: string; dot: string }) {
  const hasDesc = Boolean(item.desc);
  const [expanded, setExpanded] = useState(false);
  const preview = usePreview();

  // Rows with a photo float it under the cursor on hover (fine pointers only
  // — the preview provider no-ops on touch).
  const hoverProps = item.img
    ? {
        onPointerEnter: () =>
          preview?.show({ img: item.img!, w: item.w, h: item.h, angle: item.angle }),
        onPointerLeave: () => preview?.hide(),
      }
    : {};

  return (
    <li className="py-1" {...hoverProps}>
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
            className="block font-arialblack text-sm uppercase leading-tight tracking-tight [text-wrap:balance]"
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

// Split a group title into two stacked lines so the blurb can sit beside it:
// break AFTER the "/" when there is one ("Sando/" + "Sandwiches"), otherwise
// at the last space ("All-Day" + "Breakfast", "Baked" + "Goods").
// Single-word titles ("Sides", "Coffee") stay on one line.
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
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
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
      {/* Header row — title stacked on two lines at the LEFT (split after the
          "/" or at the last space), the blurb filling the space to its RIGHT.
          Never wraps below: the two-line title keeps the left column narrow
          enough for the blurb on every viewport. */}
      <div className="flex items-start gap-x-4 sm:gap-x-8">
        <GroupTitle accent={accent} split={Boolean(group.blurb)}>
          {group.title}
        </GroupTitle>
        {group.blurb && (
          <p
            style={{ color: body }}
            className="min-w-0 flex-1 pt-1 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-70 sm:pt-1.5 sm:text-xs"
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
