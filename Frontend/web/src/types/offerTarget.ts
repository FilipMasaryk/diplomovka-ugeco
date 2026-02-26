export const OfferTarget = {
  MAN: "man",
  WOMAN: "woman",
  CHILD: "child",
  FAMILY: "family",
  COUPLE: "couple",
  FRIENDS: "friends",
  ANIMAL: "animal",
} as const;

export type OfferTarget = (typeof OfferTarget)[keyof typeof OfferTarget];
