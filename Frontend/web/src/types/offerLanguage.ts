export const OfferLanguage = {
  SK: "sk",
  EN: "en",
  CZ: "cz",
  PL: "pl",
  DE: "de",
  HU: "hu",
  IT: "it",
  ES: "es",
} as const;

export type OfferLanguage = (typeof OfferLanguage)[keyof typeof OfferLanguage];
