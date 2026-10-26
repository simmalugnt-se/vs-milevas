"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Icon } from "@/components/ui/icon";
import { TruckColumn } from "@/components/ui/truck-column";

type Column = {
  id: string;
  /** The truck type, on the label by the truck (Figma Make: "Elektriska motviktstruckar"). */
  name: string;
  /** Figma: "Bygg din Truck:". */
  heading: ReactNode;
  label: string;
  href: string;
  rel?: string;
  target?: "_blank";
  rows: { label: ReactNode; value: ReactNode }[];
  /** The truck, e.g. a `next/image` with `fill`, `object-contain` and `object-bottom`. */
  image?: ReactNode;
  attributes?: HTMLAttributes<HTMLAnchorElement>;
};

type MilevasHeroProps = {
  /** The page's h1, white in the intro (Figma: "Bygg din baoli"). */
  heading: ReactNode;
  /** The yellow line after it (Figma: "På typ 30 sekunder"). */
  highlight?: ReactNode;
  /** Under the heading (Figma: "Välj trucktyp för att börja"). */
  prompt?: ReactNode;
  columns: Column[];
  /** The column the intro stops on, from 1. */
  activeColumn?: number;
  id?: string;
};

/**
 * Hero from Figma "04 — Blocks" (8539:7103), moving as its Figma Make prototype ("Recreate
 * interactive hero section"). Figma draws two states per width: Start, the heading and prompt on
 * Dark, and Collumns, truck-columns with one active (five in Figma; the site uses six, so that the
 * text block's four can follow, see `LinkedColumns`). The prototype goes from one to the other:
 *
 * 1. The heading, the yellow highlight and the prompt show over the empty columns for 1.2s.
 * 2. Desktop S and L: a point sweeps from the first column to the last in 0.85s and the trucks
 *    follow it, each clipped by its own column, so the point shows a different truck in every
 *    column. They then glide to the centre of `activeColumn`.
 * 3. Two seconds later the lines rise out of view one after the other (0.5s, 0.12s apart) and the
 *    active column turns yellow with its heading and prices.
 * Tablet and Mobile take the steps in another order, so the text never lies over the columns:
 * after 1.2s the text rises out, then the first column, yellow, is revealed from the right with
 * its truck, name and prices (0.6s, the navigation's curve), and the list nudges a third of a
 * column and back (0.7s each way) to show that it scrolls. The prototype scrolls to the end and
 * back with the text still shown.
 *
 * Then, from Desktop S, the trucks follow the pointer with a lag, the column under it is active
 * (8px in from its edges), and the truck name follows the pointer on a label instead of the
 * cursor; leaving the hero sends each truck back to the centre of its column and no column is
 * active. Below Desktop S the columns scroll and snap, the trucks, names, prices and hint stay put
 * on the screen while the columns slide under them, and the column in view is active. With reduced
 * motion the intro is skipped and the trucks jump to the pointer.
 */
/** A media query's match, false on the server. */
function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function MilevasHero({
  heading,
  highlight,
  prompt,
  columns,
  activeColumn = 3,
  id,
}: MilevasHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const desktop = useMedia("(min-width: 64rem)");
  // With reduced motion the intro is skipped.
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  // intro: the heading only; moving: the sweep or the scroll; settling: the trucks gliding to
  // the active column on Desktop; done: the columns are in use.
  const [introPhase, setPhase] = useState<"intro" | "moving" | "settling" | "done">("intro");
  const [introText, setText] = useState<"shown" | "leaving" | "gone">("shown");
  const phase = reduced ? "done" : introPhase;
  const text = reduced ? "gone" : introText;
  const [active, setActive] = useState<number | null>(null);
  const [pointerIn, setPointerIn] = useState(false);
  const [hint, setHint] = useState(true);

  const settleIndex = Math.max(0, Math.min(columns.length - 1, activeColumn - 1));

  // The text leaves two seconds after the trucks have moved, and is gone 0.74s later.
  useEffect(() => {
    if (text !== "leaving") return;
    const timer = window.setTimeout(() => setText("gone"), 740);
    return () => window.clearTimeout(timer);
  }, [text]);

  // Desktop S and L: the trucks follow a point (the sweep, then the pointer) in a frame loop.
  useEffect(() => {
    const section = sectionRef.current;
    const items = itemRefs.current.slice(0, columns.length);
    if (!desktop || !section || items.some((item) => !item)) return;
    const reduce = reduced;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const lerp = (from: number, to: number, amount: number) =>
      reduce ? to : from + (to - from) * amount;

    type Point = { x: number; y: number };
    let cols: { left: number; width: number }[] = [];
    let height = 0;
    const measure = () => {
      cols = items.map((item) => ({ left: item?.offsetLeft ?? 0, width: item?.offsetWidth ?? 0 }));
      height = section.offsetHeight;
      section.style.setProperty("--hero-width", `${section.offsetWidth}px`);
      section.style.setProperty("--hero-height", `${height}px`);
    };
    const home = (index: number): Point => ({
      x: cols[index].left + cols[index].width / 2,
      y: height / 2,
    });
    const place = (index: number, point: Point) => {
      items[index]?.style.setProperty("--tx", `${point.x - cols[index].left}px`);
      items[index]?.style.setProperty("--ty", `${point.y}px`);
    };
    const placeAll = (point: Point) => cols.forEach((_, index) => place(index, point));
    const clear = () =>
      items.forEach((item) => {
        item?.style.removeProperty("--tx");
        item?.style.removeProperty("--ty");
      });

    // The active column moves only when the point is 8px inside another one.
    let current: number | null = null;
    const follow = (x: number) => {
      const next = cols.findIndex((col) => x >= col.left + 8 && x <= col.left + col.width - 8);
      if (next !== -1 && next !== current) {
        current = next;
        setActive(next);
      }
    };

    let mode: "wait" | "sweep" | "glide" | "follow" | "rest" | "return" | "idle" = "wait";
    let point: Point = { x: 0, y: 0 };
    let target: Point = { x: 0, y: 0 };
    let pointer: Point | null = null;
    // Whether the pointer counts as in: not during the intro.
    let inside = false;
    // The intro runs to its end whatever the pointer does: the sweep, the trucks gliding to the
    // active column and the text leaving. Then a pointer already in the hero takes over.
    let intro = true;
    let introGlided = false;
    let introTimed = false;
    let each: Point[] = [];
    let started = 0;
    let settling = true;
    let frame = 0;
    const timers: number[] = [];

    const release = () => {
      if (!intro || !introGlided || !introTimed) return;
      intro = false;
      if (!pointer) return;
      inside = true;
      setPointerIn(true);
      each = cols.map(() => ({ ...point }));
      target = pointer;
      mode = "glide";
    };

    const tick = (now: number) => {
      if (mode === "sweep") {
        const t = Math.min((now - started) / 850, 1);
        const from = cols[0].left + 20;
        const to = cols[cols.length - 1].left + cols[cols.length - 1].width - 20;
        point = {
          x: lerp(point.x, from + ease(t) * (to - from), 0.35),
          y: lerp(point.y, height / 2, 0.35),
        };
        placeAll(point);
        follow(point.x);
        if (t >= 1) {
          each = cols.map(() => ({ ...point }));
          target = home(settleIndex);
          mode = "glide";
          setPhase("settling");
          timers.push(window.setTimeout(() => setText("leaving"), 2000));
          // The text is gone 0.74s after it starts leaving.
          timers.push(
            window.setTimeout(() => {
              introTimed = true;
              release();
            }, 2740),
          );
        }
      } else if (mode === "glide" || mode === "return") {
        let settled = true;
        each = each.map((at, index) => {
          const to = mode === "return" ? home(index) : target;
          const next = { x: lerp(at.x, to.x, 0.05), y: lerp(at.y, to.y, 0.05) };
          if (Math.abs(next.x - to.x) > 1 || Math.abs(next.y - to.y) > 1) settled = false;
          place(index, next);
          return next;
        });
        if (mode === "glide") follow(target.x);
        if (settled && mode === "return") {
          clear();
          mode = "idle";
        } else if (settled) {
          point = { ...target };
          mode = pointer && !intro ? "follow" : "rest";
          if (settling) {
            settling = false;
            setPhase("done");
            introGlided = true;
            release();
          }
        }
      } else if (mode === "follow" && pointer) {
        point = { x: lerp(point.x, pointer.x, 0.09), y: lerp(point.y, pointer.y, 0.09) };
        placeAll(point);
        follow(point.x);
      }
      frame = window.requestAnimationFrame(tick);
    };

    const toLocal = (event: PointerEvent): Point => {
      const rect = section.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const at = toLocal(event);
      section.style.setProperty("--cx", `${at.x}px`);
      section.style.setProperty("--cy", `${at.y}px`);
      pointer = at;
      if (intro) return;
      if (mode === "glide") target = at;
      if (inside) return;
      inside = true;
      setPointerIn(true);
      // From rest the trucks start from their own columns and glide to the pointer.
      if (mode === "rest" || mode === "idle" || mode === "return") {
        each = cols.map((_, index) => home(index));
        target = at;
        mode = "glide";
      }
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = null;
      inside = false;
      setPointerIn(false);
      if (intro) return;
      current = null;
      setActive(null);
      // Gliding, each truck goes back from where it is; following, they share the point.
      if (mode === "follow" || mode === "glide") {
        if (mode === "follow") each = cols.map(() => ({ ...point }));
        mode = "return";
      } else {
        clear();
        mode = "idle";
      }
    };
    // In follow, moving into another column puts the trucks at the pointer at once.
    const onColumn = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || mode !== "follow" || !pointer) return;
      point = toLocal(event);
      placeAll(point);
      follow(point.x);
    };

    measure();
    window.addEventListener("resize", measure);
    // Linked to the next block, the columns change width as the page scrolls.
    window.addEventListener("scroll", measure, { passive: true });
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    items.forEach((item) => item?.addEventListener("pointerenter", onColumn));
    frame = window.requestAnimationFrame(tick);
    if (reduce) {
      settling = false;
      intro = false;
      mode = "idle";
    } else {
      timers.push(
        window.setTimeout(() => {
          measure();
          point = { x: cols[0].left, y: height / 2 };
          placeAll(point);
          started = performance.now();
          mode = "sweep";
          setPhase("moving");
        }, 1200),
      );
    }
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      items.forEach((item) => item?.removeEventListener("pointerenter", onColumn));
      clear();
    };
  }, [desktop, reduced, columns.length, settleIndex]);

  // Tablet and Mobile: the columns scroll under the trucks, which keep their place on the screen.
  useEffect(() => {
    const list = listRef.current;
    const items = itemRefs.current.slice(0, columns.length);
    if (desktop || !list || items.some((item) => !item)) return;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    let frame = 0;
    let queued = 0;
    const timers: number[] = [];
    const sync = () => {
      queued = 0;
      const width = items[0]?.offsetWidth || 1;
      const left = list.scrollLeft;
      items.forEach((item, index) =>
        item?.style.setProperty("--shift", `${left - index * width}px`),
      );
      setActive(Math.max(0, Math.min(items.length - 1, Math.round(left / width))));
      setHint(left < width * 0.12);
    };
    const onScroll = () => {
      if (!queued) queued = window.requestAnimationFrame(sync);
    };
    const scrollTo = (from: number, to: number, duration: number, done?: () => void) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        list.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) frame = window.requestAnimationFrame(step);
        else done?.();
      };
      frame = window.requestAnimationFrame(step);
    };

    sync();
    list.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (!reduced) {
      // The text leaves first; the first column is revealed once it has gone (0.74s), and the
      // list nudges as soon as it is (0.6s).
      timers.push(
        window.setTimeout(() => setText("leaving"), 1200),
        window.setTimeout(() => setPhase("moving"), 1200 + 740),
        window.setTimeout(
          () => {
            const nudge = (items[0]?.offsetWidth ?? 0) / 3;
            scrollTo(0, nudge, 700, () =>
              timers.push(
                window.setTimeout(() => scrollTo(nudge, 0, 700, () => setPhase("done")), 150),
              ),
            );
          },
          1200 + 740 + 600,
        ),
      );
    }
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(queued);
      timers.forEach((timer) => window.clearTimeout(timer));
      list.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      items.forEach((item) => item?.style.removeProperty("--shift"));
    };
  }, [desktop, reduced, columns.length]);

  const shown = phase !== "intro";
  // Yellow once the text has gone on Desktop, and from the reveal below it.
  const lit = desktop ? text === "gone" || phase === "done" : shown;
  // Below Desktop S the first column is hidden until the intro reveals it from the right.
  const reveal =
    phase === "intro"
      ? "max-desktop-s:[clip-path:inset(0_0_0_100%)]"
      : phase === "moving"
        ? "max-desktop-s:[clip-path:inset(0)] max-desktop-s:transition-[clip-path] max-desktop-s:duration-[600ms] max-desktop-s:ease-[cubic-bezier(0.9,0,0.17,1.01)]"
        : "";
  // The columns snap and take the pointer once the intro is over.
  const settled = text === "gone" && phase === "done";
  const leaving = text === "leaving";
  // Each line rises out of its mask; below Desktop S the heading wraps, so it rises as one.
  const rise = "duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";
  const name = active === null ? undefined : columns[active]?.name;

  // From Desktop S the columns share the width. Linked to a block with two fewer columns
  // (`LinkedColumns`, which sets `--lines` from 0 to 1 as it scrolls in), the first and last
  // shrink to nothing and the others grow to that block's columns, with the lines.
  const columnWidth = (index: number) => {
    const share = 100 / columns.length;
    const end =
      columns.length < 3
        ? share
        : index === 0 || index === columns.length - 1
          ? 0
          : 100 / (columns.length - 2);
    return `calc(${share}% + ${end - share}% * var(--lines, 0))`;
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative h-svh min-h-[37.5rem] overflow-hidden mode-dark bg-bg-fill desktop-s:cursor-none"
    >
      <ul
        ref={listRef}
        className={`flex h-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] desktop-s:overflow-hidden ${
          settled ? "snap-x snap-mandatory" : "pointer-events-none"
        }`}
      >
        {columns.map((column, index) => (
          <li
            key={column.id}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            // Yellow: the navigation turns Light over it.
            data-navigation={lit && active === index ? "light" : undefined}
            className={`h-full w-[79.73%] shrink-0 snap-start snap-always tablet:w-[62.28%] desktop-s:w-(--column-width) ${
              index === 0 ? reveal : ""
            }`}
            style={{ "--column-width": columnWidth(index) } as CSSProperties}
          >
            <TruckColumn
              {...column.attributes}
              controlled
              aria-label={column.label}
              href={column.href}
              rel={column.rel}
              target={column.target}
              heading={column.heading}
              rows={column.rows}
              scrollLabel={!desktop && index === 0 && settled && hint ? "Skrolla" : undefined}
              data-state={lit && active === index ? "active" : undefined}
              contentClassName="max-desktop-s:translate-x-(--shift) desktop-s:group-data-[state=active]/column:animate-[hero-info-in_380ms_cubic-bezier(0.23,1,0.32,1)_both]"
              className="min-w-0 desktop-s:cursor-none desktop-s:group-data-[linked]/linked:border-transparent [&_span]:break-words"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute top-[clamp(9.875rem,27.25svh,16.375rem)] left-[calc(50%_+_var(--shift,0px))] h-[min(32.5svh,20rem)] w-[min(74.67vw,26.875rem)] -translate-x-1/2 desktop-s:top-[var(--ty,50%)] desktop-s:left-[var(--tx,50%)] desktop-s:size-[26.25rem] desktop-s:translate-y-[calc(-100%_+_11.875rem)] ${
                  shown ? "" : "opacity-0"
                }`}
              >
                {column.image}
              </span>
              <span
                aria-hidden
                className={`pointer-events-none absolute top-[clamp(25.625rem,59.875svh,36.875rem)] left-[calc(50%_+_var(--shift,0px))] flex max-w-[calc(100%_-_2rem)] -translate-x-1/2 items-center gap-(--spacing-xs) rounded-sm mode-dark bg-bg-fill p-(--spacing-xs) text-label-s whitespace-nowrap text-ui-primary desktop-s:hidden ${
                  shown ? "" : "opacity-0"
                }`}
              >
                {column.name}
                <Icon name="arrow-right" />
              </span>
            </TruckColumn>
          </li>
        ))}
        {/* Lets the last column scroll to the start. */}
        <li aria-hidden className="w-[20.27%] shrink-0 tablet:w-[37.72%] desktop-s:hidden" />
      </ul>

      {/* Desktop S and L: the truck name under the pointer, kept inside the hero near its bottom. */}
      {desktop && pointerIn && name ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute top-0 left-0 z-20 mt-[12.5rem] ml-[0.875rem] translate-x-[min(var(--cx),calc(var(--hero-width,100vw)-100%-1.75rem))] translate-y-[min(var(--cy),calc(var(--hero-height,100svh)-100%-13.25rem))] ${
            phase === "done"
              ? "transition-[translate] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
              : ""
          }`}
        >
          <div className="flex items-center gap-(--spacing-xs) rounded-sm bg-bg-fill p-(--spacing-xs) text-label-s whitespace-nowrap text-ui-primary ring-(length:--stroke-width) ring-ui-brand">
            <span className="grid">
              {columns.map((column) => (
                <span key={column.id} className="invisible col-start-1 row-start-1">
                  {column.name}
                </span>
              ))}
              <span
                key={name}
                className="col-start-1 row-start-1 animate-[hero-fade-in_130ms_ease]"
              >
                {name}
              </span>
            </span>
            <Icon name="arrow-up-right" />
          </div>
        </div>
      ) : null}

      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center px-(--spacing-md) ${
          text === "gone" ? "sr-only" : ""
        }`}
      >
        <div className="flex flex-col items-start gap-(--spacing-lg)">
          <h1 className="overflow-hidden text-display-l uppercase text-ui-primary desktop-s:overflow-visible">
            <span
              className={`block max-desktop-s:transition-[translate] ${rise} ${leaving ? "max-desktop-s:-translate-y-[120%]" : ""}`}
            >
              <span className="desktop-s:block desktop-s:overflow-hidden">
                <span
                  className={`desktop-s:block desktop-s:transition-[translate] ${rise} ${leaving ? "desktop-s:-translate-y-[120%]" : ""}`}
                >
                  {heading}
                </span>
              </span>{" "}
              {highlight ? (
                <span className="desktop-s:block desktop-s:overflow-hidden">
                  <span
                    className={`text-ui-brand desktop-s:block desktop-s:transition-[translate] desktop-s:delay-[120ms] ${rise} ${leaving ? "desktop-s:-translate-y-[120%]" : ""}`}
                  >
                    {highlight}
                  </span>
                </span>
              ) : null}
            </span>
          </h1>
          {prompt ? (
            <p className="overflow-hidden">
              <span
                className={`flex items-center gap-(--spacing-2xs) py-(--spacing-2xs) text-label-s text-ui-primary transition-[translate] delay-[120ms] desktop-s:delay-[240ms] ${rise} ${leaving ? "-translate-y-[120%]" : ""}`}
              >
                {prompt}
                <Icon name="arrow-right-down" />
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
