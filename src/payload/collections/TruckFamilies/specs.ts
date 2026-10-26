/**
 * The specifications a truck family can fill in, in the quote's order (Figma's Tekniska
 * specifikationer). An empty one is not shown. A model's value replaces the family's, and the lift
 * height's mast sets the build height.
 */
export const TRUCK_SPECS = [
  {
    name: "battery",
    label: "Batteri",
    description: 'På produktkortet efter lyftkapaciteten, inte i offerten. Exempel: "80 V 228 Ah".',
    onCard: true,
    inQuote: false,
  },
  { name: "turningRadius", label: "Vändradie", unit: "mm" },
  { name: "travelSpeed", label: "Körhastighet (lastad/olastad)", unit: "km/h" },
  { name: "batteryCapacity", label: "Batterikapacitet" },
  { name: "weight", label: "Vikt", unit: "kg" },
  { name: "buildHeight", label: "Truckens bygghöjd", unit: "mm" },
] as const satisfies ReadonlyArray<{
  name: string;
  label: string;
  unit?: string;
  description?: string;
  onCard?: boolean;
  inQuote?: boolean;
}>;

export type TruckSpecName = (typeof TRUCK_SPECS)[number]["name"];
