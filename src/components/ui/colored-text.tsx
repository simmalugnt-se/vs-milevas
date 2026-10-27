import { Fragment } from "react";
import { type ColoredRun, HEADING_COLORS } from "@/payload/utilities/colored-text";

/** A line of a colored heading: plain runs as text, colored runs in their color's class. */
export function ColoredRuns({ runs }: { runs: ColoredRun[] }) {
  return (
    <>
      {runs.map((run, index) =>
        run.color ? (
          <span key={index} className={HEADING_COLORS[run.color].className}>
            {run.text}
          </span>
        ) : (
          <Fragment key={index}>{run.text}</Fragment>
        ),
      )}
    </>
  );
}
