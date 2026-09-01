"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { customerSchema, expenseSchema, incomeSchema } from "@/lib/validations"
import { INDUSTRIES, type Industry } from "@/lib/constants"

export type ActionState = { error?: string; success?: boolean } | undefined

function revalidateAll() {
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
  revalidatePath("/customers")
}

export async function resolveCustomerId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  customerId: string,
  newCustomerName: string
): Promise<{ id: string | null; error?: string }> {
  if (customerId) return { id: customerId }

  const name = newCustomerName.trim()
  if (!name) return { id: null }

  const { data, error } = await supabase
    .from("customers")
    .insert({ user_id: userId, name })
    .select("id")
    .single()

  if (error) return { id: null, error: "Could not create customer." }
  return { id: data.id }
}

export async function addTransactionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const type = String(formData.get("type") ?? "")
  const raw = Object.fromEntries(formData.entries())

  if (type === "income") {
    const parsed = incomeSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
    }
    const { customer_id, new_customer_name, ...rest } = parsed.data

    if (!customer_id && !new_customer_name?.trim()) {
      return { error: "Select or add a customer." }
    }

    const resolved = await resolveCustomerId(
      supabase,
      user.id,
      customer_id ?? "",
      new_customer_name ?? ""
    )
    if (resolved.error) return { error: resolved.error }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "income",
      customer_id: resolved.id,
      service_name: rest.service_name,
      payment_method: rest.payment_method,
      amount: rest.amount,
      transaction_date: rest.transaction_date,
      notes: rest.notes || null,
    })
    if (error) return { error: "Could not save this service." }
  } else {
    const parsed = expenseSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
    }
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "expense",
      category: parsed.data.category,
      amount: parsed.data.amount,
      transaction_date: parsed.data.transaction_date,
      notes: parsed.data.notes || null,
    })
    if (error) return { error: "Could not save this expense." }
  }

  revalidateAll()
  return { success: true }
}

export async function updateTransactionAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const type = String(formData.get("type") ?? "")
  const raw = Object.fromEntries(formData.entries())

  if (type === "income") {
    const parsed = incomeSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
    }
    const { customer_id, new_customer_name, ...rest } = parsed.data

    if (!customer_id && !new_customer_name?.trim()) {
      return { error: "Select or add a customer." }
    }

    const resolved = await resolveCustomerId(
      supabase,
      user.id,
      customer_id ?? "",
      new_customer_name ?? ""
    )
    if (resolved.error) return { error: resolved.error }

    const { error } = await supabase
      .from("transactions")
      .update({
        type: "income",
        customer_id: resolved.id,
        category: null,
        service_name: rest.service_name,
        payment_method: rest.payment_method,
        amount: rest.amount,
        transaction_date: rest.transaction_date,
        notes: rest.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
    if (error) return { error: "Could not update this service." }
  } else {
    const parsed = expenseSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
    }
    const { error } = await supabase
      .from("transactions")
      .update({
        type: "expense",
        customer_id: null,
        service_name: null,
        payment_method: null,
        category: parsed.data.category,
        amount: parsed.data.amount,
        transaction_date: parsed.data.transaction_date,
        notes: parsed.data.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
    if (error) return { error: "Could not update this expense." }
  }

  revalidateAll()
  return { success: true }
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { error: "Could not delete this record." }
  revalidateAll()
  return { success: true }
}

export async function addCustomerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const parsed = customerSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
  }

  const { error } = await supabase.from("customers").insert({
    user_id: user.id,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    notes: parsed.data.notes || null,
  })
  if (error) return { error: "Could not save this customer." }

  revalidatePath("/customers")
  return { success: true }
}

export async function updateCustomerAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const parsed = customerSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { error: "Could not update this customer." }

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function updateBusinessProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const businessName = String(formData.get("businessName") ?? "").trim()
  const industry = String(formData.get("industry") ?? "")

  if (!INDUSTRIES.includes(industry as Industry)) {
    return { error: "Invalid industry." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ business_name: businessName || null, industry })
    .eq("id", user.id)
  if (error) return { error: "Could not update your profile." }

  revalidatePath("/settings")
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
