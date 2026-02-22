export const Countries = {
  SK: "SK",
  CZ: "CZ",
  PL: "PL",
  DE: "DE",
  HU: "HU",
  AT: "AT",
} as const;

export type BrandCategory = (typeof Countries)[keyof typeof Countries];
