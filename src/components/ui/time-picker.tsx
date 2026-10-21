"use client";

import { type ReactNode, useId, useState } from "react";
import { Icon } from "./icon";

export type TimePickerDay = {
  /** Shown in the calendar's heading, e.g. "Idag 12 oktober". */
  label: string;
  times: string[];
};

type TimePickerProps = {
  /** The form field the chosen day and time are sent as, e.g. "Idag 12 oktober 10:30". */
  name: string;
  days: TimePickerDay[];
  /** Shown before a time is chosen, in `ui-primary` like the chosen time (Figma has no empty look). */
  placeholder: ReactNode;
  defaultValue?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Start open (the kitchensink uses it). */
  defaultOpen?: boolean;
};

/**
 * The calendar in form-alternative from Figma "02 — Components" → "Form" (`calendar-close`
 * 9207:25835, `calendar-open` 9207:25710): a box on `bg-fill` with the choice and a chevron; open,
 * the day in Label S with arrows to the previous and next day, and its times four to a row in
 * boxes with a 1px border drawn inside. As in Figma, the calendar is 4px narrower than the box on
 * the right. Figma has no look for a chosen time, so the times look the same and the chosen one
 * shows in the box's text; the arrows look the same on the first and last day, but do nothing.
 */
export function TimePicker({
  name,
  days,
  placeholder,
  defaultValue = "",
  previousLabel = "Föregående dag",
  nextLabel = "Nästa dag",
  defaultOpen = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [dayIndex, setDayIndex] = useState(0);
  const [value, setValue] = useState(defaultValue);
  const panelId = useId();
  const day = days[dayIndex];

  return (
    <div className="flex flex-col gap-(--spacing-md) rounded-sm bg-bg-fill px-(--spacing-sm) py-(--spacing-md) text-text-xs">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-(--spacing-2xs) text-left text-ui-primary"
      >
        <span className="flex-1">{value || placeholder}</span>
        {/* Closed, the 16px chevron takes 12px of the row so the box is Figma's 60px; open, 16px. */}
        <Icon
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          className={open ? "" : "-my-(--spacing-4xs)"}
        />
      </button>
      {open && day ? (
        <div id={panelId} className="flex flex-col gap-(--spacing-sm) pr-(--spacing-3xs)">
          <div className="flex items-center gap-(--spacing-2xs)">
            <p className="flex-1 text-label-s text-ui-primary">{day.label}</p>
            <button
              type="button"
              aria-label={previousLabel}
              disabled={dayIndex === 0}
              onClick={() => setDayIndex((index) => index - 1)}
              className="text-ui-primary"
            >
              <Icon name="arrow-right-s" className="rotate-180" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              disabled={dayIndex === days.length - 1}
              onClick={() => setDayIndex((index) => index + 1)}
              className="text-ui-primary"
            >
              <Icon name="arrow-right-s" />
            </button>
          </div>
          <ul className="grid grid-cols-4 gap-(--spacing-3xs)">
            {day.times.map((time) => {
              const option = `${day.label} ${time}`;
              return (
                <li key={time}>
                  <button
                    type="button"
                    aria-pressed={value === option}
                    onClick={() => setValue(option)}
                    className="flex w-full justify-center rounded-sm px-(--spacing-sm) py-(--spacing-2xs) whitespace-nowrap text-ui-tertiary ring-1 ring-border-primary ring-inset"
                  >
                    {time}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
