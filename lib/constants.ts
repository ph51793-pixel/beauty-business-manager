export const PAYMENT_METHODS = ["cash", "card", "zelle", "other"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  zelle: "Zelle",
  other: "Other",
}

export const EXPENSE_CATEGORIES = [
  "supplies",
  "rent",
  "utilities",
  "marketing",
  "equipment",
  "other",
] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: "Supplies",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  equipment: "Equipment",
  other: "Other",
}

export const INDUSTRIES = [
  "nail_salon",
  "hair_salon",
  "barber",
  "lash",
  "esthetician",
  "makeup_artist",
  "other",
] as const
export type Industry = (typeof INDUSTRIES)[number]

export const INDUSTRY_LABELS: Record<Industry, string> = {
  nail_salon: "Nail Salon",
  hair_salon: "Hair Salon",
  barber: "Barber",
  lash: "Lash Professional",
  esthetician: "Esthetician",
  makeup_artist: "Makeup Artist",
  other: "Other",
}
