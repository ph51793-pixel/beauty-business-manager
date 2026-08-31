import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type Customer = Tables<"customers">
export type CustomerTransaction = Pick<
  Tables<"transactions">,
  "id" | "service_name" | "amount" | "transaction_date" | "payment_method"
>

export async function getCustomers(search?: string): Promise<Customer[]> {
  const supabase = await createClient()
  let query = supabase.from("customers").select("*").order("name", { ascending: true })

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data
}

export async function getCustomerHistory(id: string): Promise<{
  transactions: CustomerTransaction[]
  total: number
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("id, service_name, amount, transaction_date, payment_method")
    .eq("customer_id", id)
    .eq("type", "income")
    .order("transaction_date", { ascending: false })

  if (error) throw error

  const transactions = data ?? []
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

  return { transactions, total }
}
