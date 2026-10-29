import type { ServiceHourlyRates } from "./service-rates";
import type { ModelStep } from "./steps";

/** A choice's options, keyed by choice: `{ model: ["kbet-18"], battery: ["large-li-ion"] }`. */
export type SelectionState = Record<string, string[]>;

/** A specification: a heading and its value, as the quote lists it ("Vikt", "3 293 kg"). */
export type SpecValue = {
  label: string;
  value: string;
};

export type ConfiguratorSpecification = SpecValue;

/** A photo: what the site needs to show it. */
export type ConfiguratorImage = { alt: string; url: string };

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
  image?: ConfiguratorImage;
  /** Added to the model's price; 0 is "Ingår". */
  price: number;
  /** In a step from the models' fields, the default model's value. */
  default: boolean;
  specs: SpecValue[];
  /** In a group, the models that have it; none: every model. */
  models?: string[];
};

/**
 * One step of the configurator: a heading and its options. A step from the models' fields
 * (`modelStep`) offers the values the models have; a group (a battery, a cab, extras) its own
 * options, some of which only some models have.
 */
export type ConfiguratorChoice = {
  key: string;
  label: string;
  /** For a step from the models' fields: which. */
  modelStep?: ModelStep;
  /** Note under the step, followed by a "Kontakta oss" link. */
  help?: string;
  selectionMode: "single" | "multiple";
  required: boolean;
  /** A group's "Kolumner": automatic, one or two (see `choiceDisplay`). */
  columns?: "auto" | "one" | "two";
  /** The step type; without it the columns and the content decide (see `choiceDisplay`). */
  display?: ChoiceDisplay;
  options: ConfiguratorOption[];
};

export type ConfiguratorModel = {
  key: string;
  /** The model's name, "KBET 15 G1". */
  label: string;
  sku?: string;
  series?: string;
  capacityKg?: number;
  wheels?: string;
  description?: string;
  price: number;
  image?: ConfiguratorImage;
  brochure?: { title: string; url: string };
  specs: SpecValue[];
  /** Its photo with an option chosen, as with a cab: the option's key and the photo. */
  optionImages?: Array<{ option: string; image: ConfiguratorImage }>;
  /** Its truck type's service price per drive hour for its lift capacity, for a rental. */
  serviceHourlyRates?: ServiceHourlyRates;
};

export type ConfiguratorFamily = {
  id?: string;
  key: string;
  name: string;
  /** For the quote's heading: "Elektrisk motviktstruck". */
  singularName: string;
  description?: string;
  /** Off for a family without published models; it is then not shown on the site. */
  configurable: boolean;
  deliveryTime: string;
  warranty: string;
  /** The family's main image: heroes, menus, cards, and the configurator until a model has one. */
  image?: ConfiguratorImage;
  brochure?: { title: string; url: string };
  /** After the lift capacity on the product card ("80 V 228 Ah"). */
  cardSpec?: string;
  specs: SpecValue[];
  /** The model the configuration starts at; without it the cheapest. */
  defaultModel?: string;
  models: ConfiguratorModel[];
  /** The groups of equipment and extras. */
  choices: ConfiguratorChoice[];
  /**
   * "Steg i konfiguratorn": the steps' keys in order, a model field's (`capacity`, `wheels`,
   * `series`, `model`) or a group's.
   */
  order: string[];
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
  /** Yearly interest in percent, 5.95; none is no interest. */
  interestRate?: number;
  /** "Restvärde" by term: the share of the total price left at the end, the first that fits. */
  residualValues?: Array<{ minMonths: number; maxMonths: number; percent: number }>;
  /** "Restvärde" for the terms `residualValues` leaves out, e.g. 10. */
  residualPercent?: number;
  /**
   * A rental (VS Truck's long-term rental): the month's cost adds service for the drive hours a
   * year and insurance, and the customer sees no residual value.
   */
  rental?: { driveHoursPerYear: number; insurancePercent: number };
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
  /** The model's name, "KBE 18 Li G1". */
  modelName?: string;
  sku?: string;
  selections: SelectionState;
  selectedOptions: Array<{
    /** The step's key. */
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
