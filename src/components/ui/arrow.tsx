import type { ReactNode, SVGProps } from "react";

/**
 * Arrows from Figma "02 — Components" → "Arrows" (node 8389:5810), 64px (size=L, the only size).
 * Generated from the Figma SVGs with #121212 replaced by currentColor. Names follow Figma
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
    viewBox: "0 0 64 64",
    body: (
      <>
        <path
          d="M19.4286 12.5714C13.3333 20.1905 6.85714 25.3333 -2.86102e-06 28V36C6.85714 38.6667 13.3333 43.8095 19.4286 51.4286H32L25.1429 38.8571H64V25.1429H25.1429L32 12.5714H19.4286Z"
          fill="currentColor"
        />
      </>
    ),
  },
  "up-forward": {
    viewBox: "0 0 64 64",
    body: (
      <>
        <path
          d="M44.5714 12.5714C50.6667 20.1905 57.1429 25.3333 64 28V36C57.1429 38.6667 50.6667 43.8095 44.5714 51.4286H32L38.8571 38.8571H0V25.1429H38.8571L32 12.5714H44.5714Z"
          fill="currentColor"
        />
      </>
    ),
  },
  "up-down": {
    viewBox: "0 0 64 64",
    body: (
      <>
        <path
          d="M36 0C38.6667 5.14286 43.8095 10 51.4286 14.5714V24L38.8571 18.8571V45.1429L51.4286 40V49.4286C43.8095 54 38.6667 58.8571 36 64H28C25.3333 58.8571 20.1905 54 12.5714 49.4286V40L25.1429 45.1429V18.8571L12.5714 24V14.5714C20.1905 10 25.3333 5.14286 28 0H36Z"
          fill="currentColor"
        />
      </>
    ),
  },
  halfup: {
    viewBox: "0 0 64 64",
    body: (
      <>
        <path
          d="M56 5.81464C52.9252 12.7376 51.9472 21.1843 53.0653 31.1533L43.8408 40.2917L39.6472 26.1682L31.2623 34.4759L31.2611 34.4748L26.0761 39.6125C23.2012 42.4606 22.2312 45.0531 22.2311 47.552V64H8V47.552C8.00008 40.6521 10.9832 34.6286 16.0143 29.6445L29.5841 16.1991L15.3287 12.0457L24.5532 2.90732C34.6159 4.01496 43.1413 3.04595 50.1294 0L56 5.81464Z"
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
  return (
    <svg
      viewBox={viewBox}
      width={64}
      height={64}
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
