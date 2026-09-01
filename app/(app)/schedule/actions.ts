"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { appointmentSchema } from "@/lib/validations"
import { resolveCustomerId } from "@/app/(app)/actions"
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/lib/constants"

export type ActionState = { error?: string; success?: boolean } | undefined

type OverlapRow = {
  id: string
  start_time: string
  end_time: string
  customers: { name: string } | null
}

function revalidateSchedule() {
  revalidatePath("/schedule")
}

async function checkOverlap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<string | null> {
  let query = supabase
    .from("appointments")
    .select("id, start_time, end_time, customers(name)")
    .eq("user_id", userId)
    .eq("appointment_date", date)
    .neq("status", "cancelled")

  if (excludeId) query = query.neq("id", excludeId)

  const { data, error } = await query
  if (error) return null

  const rows = (data ?? []) as unknown as OverlapRow[]

  for (const row of rows) {
    const overlaps = startTime < row.end_time && endTime > row.start_time
    if (overlaps) {
      const name = row.customers?.name ?? "another appointment"
      return `This time overlaps with ${name} (${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)}).`
    }
  }
  return null
}

export async function createAppointmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
  }

  const { client_id, new_customer_name, start_time, end_time, appointment_date, ...rest } =
    parsed.data

  if (end_time <= start_time) {
    return { error: "End time must be after start time." }
  }

  if (!client_id && !new_customer_name?.trim()) {
    return { error: "Select or add a client." }
  }

  const conflict = await checkOverlap(supabase, user.id, appointment_date, start_time, end_time)
  if (conflict) return { error: conflict }

  const resolved = await resolveCustomerId(
    supabase,
    user.id,
    client_id ?? "",
    new_customer_name ?? ""
  )
  if (resolved.error) return { error: resolved.error }

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    client_id: resolved.id,
    service: rest.service,
    appointment_date,
    start_time,
    end_time,
    price: rest.price ?? null,
    notes: rest.notes || null,
  })

  if (error) return { error: "Could not save this appointment." }

  revalidateSchedule()
  return { success: true }
}

export async function updateAppointmentAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const parsed = appointmentSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." }
  }

  const { client_id, new_customer_name, start_time, end_time, appointment_date, status, ...rest } =
    parsed.data

  if (end_time <= start_time) {
    return { error: "End time must be after start time." }
  }

  if (!client_id && !new_customer_name?.trim()) {
    return { error: "Select or add a client." }
  }

  const conflict = await checkOverlap(
    supabase,
    user.id,
    appointment_date,
    start_time,
    end_time,
    id
  )
  if (conflict) return { error: conflict }

  const resolved = await resolveCustomerId(
    supabase,
    user.id,
    client_id ?? "",
    new_customer_name ?? ""
  )
  if (resolved.error) return { error: resolved.error }

  const { error } = await supabase
    .from("appointments")
    .update({
      client_id: resolved.id,
      service: rest.service,
      appointment_date,
      start_time,
      end_time,
      price: rest.price ?? null,
      notes: rest.notes || null,
      status: status ?? "scheduled",
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Could not update this appointment." }

  revalidateSchedule()
  return { success: true }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  if (!APPOINTMENT_STATUSES.includes(status)) return { error: "Invalid status." }

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Could not update status." }

  revalidateSchedule()
  return { success: true }
}

export async function deleteAppointmentAction(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in." }

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Could not delete this appointment." }

  revalidateSchedule()
  return { success: true }
}
