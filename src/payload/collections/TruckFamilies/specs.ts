/**
 * The specifications the quote lists (Figma's Tekniska specifikationer), in its order, and where
 * each comes from: the travel speed is the family's, the weight and turning radius the variant's,
 * the battery capacity the battery's and the build height the mast's. `battery` is the default
 * battery's capacity on the product card. An empty one is not shown.
 */
export const TRUCK_SPECS = [
  { name: "battery", label: "Batteri", onCard: true, inQuote: false },
  { name: "turningRadius", label: "Vändradie", unit: "mm" },
  { name: "travelSpeed", label: "Körhastighet (lastad/olastad)", unit: "km/h" },
  { name: "batteryCapacity", label: "Batterikapacitet" },
  { name: "weight", label: "Vikt", unit: "kg" },
  { name: "buildHeight", label: "Truckens bygghöjd", unit: "mm" },
] as const satisfies ReadonlyArray<{
  name: string;
  label: string;
  unit?: string;
  onCard?: boolean;
  inQuote?: boolean;
}>;

export type TruckSpecName = (typeof TRUCK_SPECS)[number]["name"];
