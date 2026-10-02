import type { ReactNode, SVGProps } from "react";

/**
 * Icons from Figma "02 — Components" → "Icons" (node 6075:2501), 16px except the 12px arrow-*.
 * Generated with `scripts/figma-svgs/to-tsx.mjs` (#121212 becomes currentColor): colour them with `text-*`,
 * size them with `size-*`. `icon-sound-off` appears twice in Figma with the same SVG.
 */
const icons = {
  plus: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M8 2.99996V13M3.00008 8H13.0001" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  minus: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M3 8L13 8" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  close: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M13 3L3 13M3 3L13 13" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  check: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M14 4L6.4375 12L3 8.36364" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "chevron-left": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M9.5 12L5.5 8L9.5 4" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "chevron-right": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M6.5 12L10.5 8L6.5 4" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "chevron-up": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "chevron-down": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "arrow-left": {
    viewBox: "0 0 12 12",
    body: (
      <>
        <path d="M11 6H3M7 2L3 6L7 10" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "arrow-right": {
    viewBox: "0 0 12 12",
    body: (
      <>
        <path d="M1 6H9M5 10L9 6L5 2" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "arrow-up": {
    viewBox: "0 0 12 12",
    body: (
      <>
        <path d="M6 10V2M10 6L6 2L2 6" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "arrow-down": {
    viewBox: "0 0 12 12",
    body: (
      <>
        <path d="M6 2V10M2 6L6 10L10 6" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  "external-link": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M6.73077 4.53846H2.5V13H10.9615V8.76923M5.88462 9.61538L13.5 2M13.5 7.07692V2H8.42308"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  mail: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M1.49999 4.50004L8 8.66667L14.6385 4.50004M1.49999 2.66667H14.6667L14.5 13.5H1.49999V2.66667Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  upload: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M12.5 9V12H3.5V9M8 9V3M11.75 6.75L8 3L4.25 6.75"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  download: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M12.5 10V13H3.5V10M8 3V10M11.5 6.5L8 10L4.5 6.5"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  menu: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M0 8H16M0 3H16M0 13H16" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  globe: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667M14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333M14.6667 8H1.33333M8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8M8 14.6667C9.66752 12.8411 10.6152 10.472 10.6667 8C10.6152 5.52802 9.66752 3.1589 8 1.33333M8 14.6667C6.33248 12.8411 5.38483 10.472 5.33333 8C5.38483 5.52802 6.33248 3.1589 8 1.33333M1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  alert: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M8 4V8M8.00667 10V12M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  info: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M8.00001 12V8M8.00668 6V4M14.6667 8C14.6667 4.3181 11.6819 1.33334 8.00001 1.33334C4.31811 1.33334 1.33334 4.3181 1.33334 8C1.33334 11.6819 4.31811 14.6667 8.00001 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  pause: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path d="M5 3L5 13M11 3L11 13" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  play: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M4.66672 2.66666L11.3334 7.99999L4.66672 13.3333V2.66666Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  "skip-back": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M3.33333 12.6667V3.33333M12.6667 13.3333L6 8L12.6667 2.66667V13.3333Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  "skip-forward": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M12.6667 3.33333V12.6667M3.33333 2.66667L10 8L3.33333 13.3333V2.66667Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  maximize: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M5 1.50002H1.5V5.00002M14.5 5.00002V1.50002H11M11 14.5H14.5V11M1.5 11L1.49996 14.5H4.99998"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  minimize: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M5.5 2V5.5H2M14 5.5H10.5V2M10.5 14V10.5H14M2 10.5H5.5V14"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  "sound-on": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M12.7133 3.28667C13.9631 4.53685 14.6652 6.23224 14.6652 8C14.6652 9.76776 13.9631 11.4631 12.7133 12.7133M10.36 5.64C10.9849 6.26509 11.336 7.11279 11.336 7.99667C11.336 8.88055 10.9849 9.72824 10.36 10.3533M7.33333 3.33333L4 6H1.33333V10H4L7.33333 12.6667V3.33333Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  "sound-off": {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M15.3333 6L11.3333 10M11.3333 6L15.3333 10M7.33333 3.33333L4 6H1.33333V10H4L7.33333 12.6667V3.33333Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  help: {
    viewBox: "0 0 16 16",
    body: (
      <>
        <path
          d="M8.55833 11.7583C8.71944 11.5972 8.8 11.4 8.8 11.1667C8.8 10.9333 8.71944 10.7361 8.55833 10.575C8.39722 10.4139 8.2 10.3333 7.96667 10.3333C7.73333 10.3333 7.53611 10.4139 7.375 10.575C7.21389 10.7361 7.13333 10.9333 7.13333 11.1667C7.13333 11.4 7.21389 11.5972 7.375 11.7583C7.53611 11.9194 7.73333 12 7.96667 12C8.2 12 8.39722 11.9194 8.55833 11.7583ZM7.36667 9.43333H8.6C8.6 9.06667 8.64167 8.77778 8.725 8.56667C8.80833 8.35556 9.04444 8.06667 9.43333 7.7C9.72222 7.41111 9.95 7.13611 10.1167 6.875C10.2833 6.61389 10.3667 6.3 10.3667 5.93333C10.3667 5.31111 10.1389 4.83333 9.68333 4.5C9.22778 4.16667 8.68889 4 8.06667 4C7.43333 4 6.91944 4.16667 6.525 4.5C6.13056 4.83333 5.85556 5.23333 5.7 5.7L6.8 6.13333C6.85556 5.93333 6.98056 5.71667 7.175 5.48333C7.36944 5.25 7.66667 5.13333 8.06667 5.13333C8.42222 5.13333 8.68889 5.23056 8.86667 5.425C9.04444 5.61944 9.13333 5.83333 9.13333 6.06667C9.13333 6.28889 9.06667 6.49722 8.93333 6.69167C8.8 6.88611 8.63333 7.06667 8.43333 7.23333C7.94444 7.66667 7.64444 7.99444 7.53333 8.21667C7.42222 8.43889 7.36667 8.84444 7.36667 9.43333ZM8 14.6667C7.07778 14.6667 6.21111 14.4917 5.4 14.1417C4.58889 13.7917 3.88333 13.3167 3.28333 12.7167C2.68333 12.1167 2.20833 11.4111 1.85833 10.6C1.50833 9.78889 1.33333 8.92222 1.33333 8C1.33333 7.07778 1.50833 6.21111 1.85833 5.4C2.20833 4.58889 2.68333 3.88333 3.28333 3.28333C3.88333 2.68333 4.58889 2.20833 5.4 1.85833C6.21111 1.50833 7.07778 1.33333 8 1.33333C8.92222 1.33333 9.78889 1.50833 10.6 1.85833C11.4111 2.20833 12.1167 2.68333 12.7167 3.28333C13.3167 3.88333 13.7917 4.58889 14.1417 5.4C14.4917 6.21111 14.6667 7.07778 14.6667 8C14.6667 8.92222 14.4917 9.78889 14.1417 10.6C13.7917 11.4111 13.3167 12.1167 12.7167 12.7167C12.1167 13.3167 11.4111 13.7917 10.6 14.1417C9.78889 14.4917 8.92222 14.6667 8 14.6667ZM8 13.3333C9.48889 13.3333 10.75 12.8167 11.7833 11.7833C12.8167 10.75 13.3333 9.48889 13.3333 8C13.3333 6.51111 12.8167 5.25 11.7833 4.21667C10.75 3.18333 9.48889 2.66667 8 2.66667C6.51111 2.66667 5.25 3.18333 4.21667 4.21667C3.18333 5.25 2.66667 6.51111 2.66667 8C2.66667 9.48889 3.18333 10.75 4.21667 11.7833C5.25 12.8167 6.51111 13.3333 8 13.3333Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </>
    ),
  },
} satisfies Record<string, { viewBox: string; body: ReactNode }>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  /** Accessible name; without it the icon is decorative and hidden from assistive tech. */
  title?: string;
};

export function Icon({ name, title, className, ...props }: IconProps) {
  const { viewBox, body } = icons[name];
  const [, , width, height] = viewBox.split(" ");
  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
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
