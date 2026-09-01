import { z } from "zod"
import { APPOINTMENT_STATUSES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "./constants"

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type CustomerInput = z.infer<typeof customerSchema>

const baseTransactionFields = {
  amount: z.coerce.number().positive("Amount must be greater than $0"),
  transaction_date: z.string().min(1, "Date is required"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
}

export const incomeSchema = z.object({
  type: z.literal("income"),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  new_customer_name: z.string().trim().max(120).optional().or(z.literal("")),
  service_name: z.string().trim().min(1, "Service is required").max(200),
  payment_method: z.enum(PAYMENT_METHODS),
  ...baseTransactionFields,
})

export const expenseSchema = z.object({
  type: z.literal("expense"),
  category: z.enum(EXPENSE_CATEGORIES),
  ...baseTransactionFields,
})

export const transactionSchema = z.discriminatedUnion("type", [incomeSchema, expenseSchema])

export type TransactionInput = z.infer<typeof transactionSchema>

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

export const appointmentSchema = z.object({
  client_id: z.string().uuid().optional().or(z.literal("")),
  new_customer_name: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.string().trim().min(1, "Service is required").max(200),
  appointment_date: z.string().min(1, "Date is required"),
  start_time: z.string().regex(timePattern, "Invalid start time"),
  end_time: z.string().regex(timePattern, "Invalid end time"),
  price: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v > 0), {
      message: "Price must be greater than $0",
    }),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
