"use client";

import { type HTMLAttributes, type ReactNode, useState } from "react";
import { TruckColumn } from "@/components/ui/truck-column";

type Column = {
  id: string;
  heading: ReactNode;
  label: string;
  href: string;
  rel?: string;
  target?: "_blank";
  rows: { label: ReactNode; value: ReactNode }[];
  attributes?: HTMLAttributes<HTMLAnchorElement>;
};

type MilevasHeroProps = {
  heading: ReactNode;
  columns: Column[];
  activeColumn?: number;
  id?: string;
};

/** Five viewport-height columns on desktop; a snap list on touch screens. */
export function MilevasHero({ heading, columns, activeColumn = 3, id }: MilevasHeroProps) {
  const initial = Math.max(0, Math.min(columns.length - 1, activeColumn - 1));
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? initial;
  return (
    <section id={id} className="relative bg-bg-inv-fill">
      <h1 className="sr-only">{heading}</h1>
      <ul
        className="flex aspect-[375/520] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] tablet:aspect-[800/600] desktop-s:aspect-auto desktop-s:h-svh desktop-s:overflow-visible"
        onMouseLeave={() => setHovered(null)}
      >
        {columns.map((column, index) => (
          <li
            key={column.id}
            className="h-full w-[85%] shrink-0 snap-start tablet:w-[55%] desktop-s:w-0 desktop-s:flex-1"
          >
            <TruckColumn
              {...column.attributes}
              aria-label={column.label}
              href={column.href}
              rel={column.rel}
              target={column.target}
              heading={column.heading}
              rows={column.rows}
              data-state={index === active ? "active" : undefined}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              className="min-w-0 [&_span]:break-words"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
