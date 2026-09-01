import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type AppointmentWithClient = Tables<"appointments"> & {
  customers: Pick<Tables<"customers">, "id" | "name"> | null
}

export async function getAppointmentsInRange(
  from: string,
  to: string
): Promise<AppointmentWithClient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, customers(id, name)")
    .gte("appointment_date", from)
    .lte("appointment_date", to)
    .order("appointment_date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as AppointmentWithClient[]
}

export async function getAppointment(id: string): Promise<AppointmentWithClient | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, customers(id, name)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as AppointmentWithClient | null
}
