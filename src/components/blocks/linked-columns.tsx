"use client";

import { type ReactNode, useEffect, useRef } from "react";

/** The prototype's `cubic-bezier(0.82, 0, 0.22, 1)`, as y for x. */
function ease(x: number) {
  const [x1, y1, x2, y2] = [0.82, 0, 0.22, 1];
  const at = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 24; step++) {
    const t = (low + high) / 2;
    if (at(t, x1, x2) < x) low = t;
    else high = t;
  }
  return at((low + high) / 2, y1, y2);
}

type LinkedColumnsProps = {
  /** The hero's columns, and the following block's. */
  from: number;
  to: number;
  /** The two blocks; the second one's scroll moves the lines. */
  children: ReactNode;
};

/**
 * The lines between the hero's columns and the next block's, as in Figma's start-page prototype
 * ("05 — Pages" → "prototyp (ish) startsida", MacBook Air 109 → 110): one layer of lines stays on
 * the screen while the blocks scroll, and moves from the hero's columns to the next block's as
 * that block comes into view, eased with the prototype's `cubic-bezier(0.82, 0, 0.22, 1)`. The
 * lines then leave with the second block. A line with no place in the second block goes to the
 * right edge. From Desktop S; below it each block keeps its own lines. The blocks hide theirs
 * with `group-data-[linked]/linked:`.
 */
export function LinkedColumns({ from, to, children }: LinkedColumnsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const next = element?.children[1];
    if (!element || !next) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = 1 - next.getBoundingClientRect().top / window.innerHeight;
      element.style.setProperty("--lines", String(ease(Math.min(1, Math.max(0, progress)))));
    };
    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  // Each line is a column's right edge, first in the hero, then in the next block.
  const lines = Array.from({ length: from - 1 }, (_, index) => ({
    start: ((index + 1) * 100) / from,
    end: (Math.min(index + 1, to) * 100) / to,
  }));

  return (
    <div ref={ref} data-linked className="group/linked relative">
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] hidden desktop-s:block"
      >
        <div className="sticky top-0 h-svh mode-dark">
          {lines.map((line, index) => (
            <span
              key={index}
              className="absolute inset-y-0 w-(--stroke-width) -translate-x-full bg-ui-brand"
              style={{
                left: `calc(${line.start}% + ${line.end - line.start}% * var(--lines, 0))`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
