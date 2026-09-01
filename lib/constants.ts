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

export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled", "no_show"] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
}

export const APPOINTMENT_STATUS_STYLES: Record<
  AppointmentStatus,
  { badge: string; card: string; dot: string }
> = {
  scheduled: {
    badge: "bg-line text-ink",
    card: "bg-brand text-ink",
    dot: "bg-brand",
  },
  completed: {
    badge: "bg-success-light text-success",
    card: "bg-success-light border border-success/30 text-ink",
    dot: "bg-success",
  },
  cancelled: {
    badge: "bg-line text-ink-muted",
    card: "bg-line/50 border border-line text-ink-muted line-through",
    dot: "bg-ink-muted",
  },
  no_show: {
    badge: "bg-danger-light text-danger",
    card: "bg-danger-light border border-danger/30 text-ink",
    dot: "bg-danger",
  },
}

export const SERVICE_SUGGESTIONS = [
  "Manicure",
  "Pedicure",
  "Gel",
  "Acrylic",
  "Nail Art",
  "Refill",
  "Other",
]

export const BUSINESS_HOURS_START = 8
export const BUSINESS_HOURS_END = 20
