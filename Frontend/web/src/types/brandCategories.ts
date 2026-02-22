export const BrandCategory = {
  APPS_AND_TECH: "apps_and_technology",
  AUTO_MOTO: "auto_moto",
  TRAVELLING: "travelling",
  HOME_AND_GARDEN: "home_and_garden",
  ELECTRONICS: "electronics",
  GAMES: "games",
  MUSIC_AND_DANCE: "music_and_dance",
  FOOD_AND_DRINKS: "food_and_drinks",
  BOOKS: "books",
  COSMETICS: "cosmetics",
  FASHION: "fashion",
  FAMILY_AND_KIDS: "family_and_kids",
  SERVICES: "services",
  SPORT: "sport",
  EXPERIENCES: "experiences",
  HEALTH: "health",
  ANIMALS: "animals",
  LIFESTYLE: "lifestyle",
} as const;

export type BrandCategory = (typeof BrandCategory)[keyof typeof BrandCategory];
