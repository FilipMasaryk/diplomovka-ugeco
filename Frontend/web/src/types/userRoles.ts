export const UserRole = {
  ADMIN: "admin",
  SUBADMIN: "subadmin",
  CREATOR: "creator",
  BRAND_MANAGER: "brand_manager",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
