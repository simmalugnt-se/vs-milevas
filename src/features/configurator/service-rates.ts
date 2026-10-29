/**
 * Long-term rental's service: a price per drive hour that falls as the hours a year rise, in VS
 * Truck's bands. A band holds the hours up to and including `maxHours`; the last has no end.
 */
export const DRIVE_HOUR_BANDS = [
  { key: "upTo600", label: "0–600 h", maxHours: 600 },
  { key: "upTo1200", label: "600–1 200 h", maxHours: 1200 },
  { key: "upTo2000", label: "1 200–2 000 h", maxHours: 2000 },
  { key: "upTo3000", label: "2 000–3 000 h", maxHours: 3000 },
  { key: "over3000", label: "3 000 h+", maxHours: Number.POSITIVE_INFINITY },
] as const;

export type DriveHourBand = (typeof DRIVE_HOUR_BANDS)[number]["key"];

/** Kronor per drive hour in each band. */
export type ServiceHourlyRates = Partial<Record<DriveHourBand, number>>;

/** The band a year's drive hours fall in. */
export function driveHourBand(hours: number): DriveHourBand {
  return (DRIVE_HOUR_BANDS.find((band) => hours <= band.maxHours) ?? DRIVE_HOUR_BANDS[4]).key;
}
