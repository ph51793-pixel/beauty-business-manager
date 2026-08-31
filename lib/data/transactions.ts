import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type TransactionWithCustomer = Tables<"transactions"> & {
  customers: Pick<Tables<"customers">, "id" | "name"> | null
}

export type TransactionFilters = {
  type?: "income" | "expense"
  from?: string
  to?: string
  search?: string
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionWithCustomer[]> {
  const supabase = await createClient()
  let query = supabase
    .from("transactions")
    .select("*, customers(id, name)")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.type) query = query.eq("type", filters.type)
  if (filters.from) query = query.gte("transaction_date", filters.from)
  if (filters.to) query = query.lte("transaction_date", filters.to)

  const { data, error } = await query
  if (error) throw error

  let rows = (data ?? []) as unknown as TransactionWithCustomer[]

  if (filters.search && filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase()
    rows = rows.filter((row) => {
      const haystack = [
        row.customers?.name,
        row.service_name,
        row.category,
        row.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(needle)
    })
  }

  return rows
}

export async function getTransaction(id: string): Promise<TransactionWithCustomer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("*, customers(id, name)")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data as unknown as TransactionWithCustomer | null
}
