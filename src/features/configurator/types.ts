/** A choice's options, keyed by choice: `{ model: ["kbet-18"], battery: ["large-li-ion"] }`. */
export type SelectionState = Record<string, string[]>;

/** A specification from `TRUCK_SPECS`: how a value is named, ordered and shown. */
export type ConfiguratorSpec = {
  key: string;
  label: string;
  unit?: string;
  sortOrder: number;
  /** Shown on the product card after the lift capacity (Figma: the battery). */
  onCard: boolean;
  /** Listed under Tekniska specifikationer in the quote. */
  inQuote: boolean;
};

/** A value for a specification type, by its key. */
export type SpecValue = {
  spec: string;
  value: string;
};

/** A specification as the quote shows it: the type's label and the value with its unit. */
export type ConfiguratorSpecification = {
  label: string;
  value: string;
};

/**
 * Figma's step types (`9264:6653`): `grid` six to a box, two per row (type 1); `stack` under each
 * other (type 2); `images` with a photo, two per row (type 3); `imageRows` with a photo on the right
 * (type 4); `prices` title and price only (type 5).
 */
export type ChoiceDisplay = "grid" | "stack" | "images" | "imageRows" | "prices";

export type ConfiguratorOption = {
  key: string;
  label: string;
  description?: string;
  image?: { alt: string; url: string };
  /** Added to the model's price; 0 is "Ingår". The model choice's options carry the model price. */
  price: number;
  default: boolean;
  sku?: string;
  specs: SpecValue[];
  /**
   * Shown only for these options of other steps, by step key: `{ model: ["…"] }` shows a battery
   * only with those lift capacities. A step left out, or one after this, sets no condition.
   */
  availableFor?: Record<string, string[]>;
};

/** One step of the configurator: one set of options. */
export type ConfiguratorChoice = {
  key: string;
  label: string;
  /** Note under the step, followed by a "Kontakta oss" link. */
  help?: string;
  selectionMode: "single" | "multiple";
  required: boolean;
  /** The step type; without it the content decides (see `choiceDisplay`). */
  display?: ChoiceDisplay;
  options: ConfiguratorOption[];
};

export type ConfiguratorModel = {
  key: string;
  label: string;
  /** Under the label in the model step, as in Figma. */
  sku?: string;
  price: number;
  capacityKg?: number;
  image?: { alt: string; url: string };
  default: boolean;
  specs: SpecValue[];
};

export type ConfiguratorFamily = {
  id?: string;
  key: string;
  name: string;
  /** For the quote's heading: "Elektrisk motviktstruck". */
  singularName: string;
  description?: string;
  /** Off for a family without variants: no models or choices, and it links to `contactLink`. */
  configurable: boolean;
  /** Where the family's cards and links go when it is not configurable. */
  contactLink?: { href: string; rel?: string; target?: "_blank" };
  deliveryTime: string;
  warranty: string;
  /** The family's one image: heroes, menus, cards and the configurator crop it as they need. */
  image?: { alt: string; url: string };
  brochure?: { title: string; url: string };
  specs: SpecValue[];
  /** The variants' step, always first: its name from the settings ("Lyftkapacitet"). */
  modelChoice: { label: string };
  models: ConfiguratorModel[];
  choices: ConfiguratorChoice[];
};

export type FinancingMethod = {
  key: string;
  label: string;
  description?: string;
  kind: "purchase" | "monthly";
  /** The term in months: the default in the catalogue, the chosen one in a quote. */
  months?: number;
  /** The terms to choose from with Figma's "Avtalslängd" slider, shortest first. */
  terms?: number[];
  /** "Restvärde": the share of the total price left at the end, e.g. 10. */
  residualPercent?: number;
  serviceAgreementEligible: boolean;
};

export type ServiceAgreement = {
  label: string;
  description?: string;
  annualPrice: number;
};

/** One step of the thank-you page's "Vad händer nu?". */
export type NextStep = {
  heading: string;
  text?: string;
};

export type ConfiguratorCatalog = {
  families: ConfiguratorFamily[];
  specs: ConfiguratorSpec[];
  financingMethods: FinancingMethod[];
  serviceAgreement?: ServiceAgreement;
  quoteValidityDays: number;
  /** Under the warranty in the quote's price box. */
  warrantyNote?: string;
  nextSteps: NextStep[];
};

export type QuoteLine = {
  key: string;
  label: string;
  price: number;
  kind: "base" | "option" | "service";
};

export type ConfiguratorQuote = {
  /** False for a call request sent before every step was chosen. */
  complete: boolean;
  familyKey: string;
  familyName: string;
  /** The family in singular, for the quote's heading. */
  familySingularName?: string;
  modelKey?: string;
  sku?: string;
  selections: SelectionState;
  selectedOptions: Array<{
    /** The choice's key; `model` for the model. */
    groupKey: string;
    optionKey: string;
    label: string;
    price: number;
  }>;
  lines: QuoteLine[];
  specifications: ConfiguratorSpecification[];
  totalPrice: number;
  financing: FinancingMethod;
  financingPrice: number;
  serviceAgreement?: ServiceAgreement;
  deliveryTime: string;
  warranty: string;
  quoteValidityDays: number;
};

export type ConfiguratorActionState = {
  ok: boolean;
  reference?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  formValues?: {
    company: string;
    organizationNumber: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    callPreference: "asap" | "specific";
    preferredTime: string;
  };
};

/** "Skicka kopia till mig": the address and how it went. */
export type QuoteCopyState = {
  ok: boolean;
  email?: string;
  message?: string;
};

export type ConfiguratorRequestSnapshot = {
  createdAt: string;
  locale: string;
  quote: ConfiguratorQuote;
  /** The signed-in dealer who sent it, with the discount the dealer prices were counted with. */
  dealer?: { id: string; email: string; company: string; discountPercent: number };
};
