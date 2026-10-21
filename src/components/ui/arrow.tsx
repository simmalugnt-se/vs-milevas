import type { ReactNode, SVGProps } from "react";

/**
 * Arrows from Figma "02 — Components" → "Arrows" (node 8389:5810), size=L, the only size: 64px on
 * the long side and cropped to the shape (`back` 64 × 40, `up-down` 40 × 64, `halfup` 48 × 64), plus
 * `halfup-s` (24 × 32), a narrower halfup drawn separately for truck-column (8539:7382).
 * Generated with `scripts/figma-svgs/to-tsx.mjs` (#121212 becomes currentColor). Names follow Figma
 * (`arrow-up&forward` → `up-forward`).
 */
const arrows = {
  round: {
    viewBox: "0 0 64 64",
    body: (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.0661 0C33.3011 0 40.2318 2.13674 44.7616 6.37411C49.3153 10.6338 51.7795 16.7506 51.7795 24.1232L51.7777 37.9964C54.6381 36.3129 58.1057 34.7826 60.2446 33.933L64 32.442V44.8643L62.9607 45.6875C60.4843 47.6505 57.6287 50.5162 55.108 53.5902C52.5673 56.6886 50.5161 59.8189 49.5045 62.2866L48.8063 63.9884H40.8777L40.1795 62.2866C39.1679 59.8189 37.1166 56.6886 34.5759 53.5902C32.0552 50.5162 29.1996 47.6505 26.7232 45.6875L25.6839 44.8643V32.442L29.4393 33.933C31.5878 34.7864 35.077 36.3264 37.9446 38.0187L37.9464 23.0875C37.9464 19.8696 36.9754 17.61 35.3384 16.1232C33.6627 14.6013 30.2791 13.5304 26 13.5304C22.0012 13.5304 18.3259 14.5026 16.5634 15.9696C14.8716 17.378 13.833 19.4984 13.833 22.5616V64H0V22.5107L0.00446429 22.4348C0.394229 15.3746 3.18935 9.6824 7.78839 5.78304C12.3517 1.91415 19.3276 2.90613e-05 26.0661 0Z"
          fill="currentColor"
        />
      </>
    ),
  },
  back: {
    viewBox: "0 0 64 40",
    body: (
      <>
        <path
          d="M19.4286 0.571428C13.3333 8.19048 6.85714 13.3333 0 16V24C6.85714 26.6667 13.3333 31.8095 19.4286 39.4286H32L25.1429 26.8571H64V13.1429H25.1429L32 0.571428H19.4286Z"
          fill="currentColor"
        />
      </>
    ),
  },
  "up-forward": {
    viewBox: "0 0 64 40",
    body: (
      <>
        <path
          d="M44.5714 0.571533C50.6667 8.19058 57.1429 13.3334 64 16.0001V24.0001C57.1429 26.6668 50.6667 31.8096 44.5714 39.4287H32L38.8571 26.8572H0V13.143H38.8571L32 0.571533H44.5714Z"
          fill="currentColor"
        />
      </>
    ),
  },
  "up-down": {
    viewBox: "0 0 40 64",
    body: (
      <>
        <path
          d="M24 0C26.6667 5.14286 31.8095 10 39.4286 14.5714V24L26.8571 18.8571V45.1429L39.4286 40V49.4286C31.8095 54 26.6667 58.8571 24 64H16C13.3333 58.8571 8.19048 54 0.571428 49.4286V40L13.1429 45.1429V18.8571L0.571428 24V14.5714C8.19048 10 13.3333 5.14286 16 0H24Z"
          fill="currentColor"
        />
      </>
    ),
  },
  halfup: {
    viewBox: "0 0 48 64",
    body: (
      <>
        <path
          d="M48 5.81464C44.9252 12.7376 43.9472 21.1843 45.0653 31.1533L35.8408 40.2917L31.6472 26.1682L23.2623 34.4759L23.2611 34.4748L18.0761 39.6125C15.2012 42.4606 14.2312 45.0531 14.2311 47.552V64H-4.76837e-07V47.552C8.21955e-05 40.6521 2.98324 34.6286 8.01428 29.6445L21.5841 16.1991L7.32867 12.0457L16.5532 2.90732C26.6159 4.01496 35.1413 3.04595 42.1294 0L48 5.81464Z"
          fill="currentColor"
        />
      </>
    ),
  },
  "halfup-s": {
    viewBox: "0 0 24 32",
    body: (
      <>
        <path
          d="M24 2.90732C22.4626 6.36878 21.9736 10.5921 22.5326 15.5766L17.9204 20.1459L15.8236 13.0841L11.6311 17.238L11.6306 17.2374L9.03807 19.8062C7.60059 21.2303 7.11561 22.5266 7.11557 23.776V32H-4.76837e-07V23.776C4.08593e-05 20.3261 1.49162 17.3143 4.00714 14.8223L10.7921 8.09953L3.66433 6.02287L8.2766 1.45366C13.308 2.00748 17.5707 1.52297 21.0647 0L24 2.90732Z"
          fill="currentColor"
        />
      </>
    ),
  },
} satisfies Record<string, { viewBox: string; body: ReactNode }>;

export type ArrowName = keyof typeof arrows;
export const arrowNames = Object.keys(arrows) as ArrowName[];

type ArrowProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: ArrowName;
  /** Accessible name; without it the arrow is decorative and hidden from assistive tech. */
  title?: string;
};

export function Arrow({ name, title, className, ...props }: ArrowProps) {
  const { viewBox, body } = arrows[name];
  const [, , width, height] = viewBox.split(" ");
  return (
    <svg
      viewBox={viewBox}
      width={`${Number(width) / 16}rem`}
      height={`${Number(height) / 16}rem`}
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={`shrink-0 ${className ?? ""}`}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}
