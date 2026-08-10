export type PriceMode = "included" | "add" | "replaceBase";

export type SelectionState = Record<string, string[]>;

export type ConfiguratorCondition = {
  allOf: string[];
  anyOf: string[];
  noneOf: string[];
};

export type ConfiguratorSpecification = {
  label: string;
  value: string;
};

export type ConfiguratorOption = {
  key: string;
  label: string;
  description?: string;
  priceMode: PriceMode;
  price: number;
  defaultSelected: boolean;
  sku?: string;
  conditions: ConfiguratorCondition;
  specifications: ConfiguratorSpecification[];
};

export type ConfiguratorGroup = {
  key: string;
  label: string;
  description?: string;
  selectionMode: "single" | "multiple";
  required: boolean;
  options: ConfiguratorOption[];
};

export type ConfiguratorStep = {
  key: string;
  label: string;
  heading: string;
  description?: string;
  groups: ConfiguratorGroup[];
};

export type ConfiguratorFamily = {
  key: string;
  name: string;
  description?: string;
  basePrice: number;
  sku?: string;
  deliveryTime: string;
  warranty: string;
  image?: { alt: string; url: string };
  brochure?: { title: string; url: string };
  steps: ConfiguratorStep[];
};

export type FinancingMethod = {
  key: string;
  label: string;
  description?: string;
  kind: "purchase" | "monthly";
  months?: number;
  monthlyFactor?: number;
  serviceAgreementEligible: boolean;
};

export type ServiceAgreement = {
  label: string;
  description?: string;
  annualPrice: number;
};

export type ConfiguratorCatalog = {
  families: ConfiguratorFamily[];
  financingMethods: FinancingMethod[];
  serviceAgreement?: ServiceAgreement;
  quoteValidityDays: number;
};

export type QuoteLine = {
  key: string;
  label: string;
  price: number;
  kind: "base" | "option" | "service";
};

export type ConfiguratorQuote = {
  familyKey: string;
  familyName: string;
  sku?: string;
  selections: SelectionState;
  selectedOptions: Array<{
    groupKey: string;
    optionKey: string;
    label: string;
    price: number;
    priceMode: PriceMode;
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

export type ConfiguratorRequestSnapshot = {
  createdAt: string;
  locale: string;
  quote: ConfiguratorQuote;
};
