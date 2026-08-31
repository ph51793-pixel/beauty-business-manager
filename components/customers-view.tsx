"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, ChevronRight, UserRound } from "lucide-react"
import { CustomerFormSheet } from "./customer-form-sheet"
import type { Customer } from "@/lib/data/customers"

export function CustomersView({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [addOpen, setAddOpen] = useState(false)

  function handleSearch(value: string) {
    setQuery(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("q", value)
    else params.delete("q")
    router.replace(`/customers?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Customers</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search customers"
          className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-base outline-none focus:border-brand"
        />
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
          <UserRound className="mx-auto h-8 w-8 text-ink-muted" />
          <p className="mt-2 text-sm text-ink-muted">
            {query ? "No customers match your search." : "No customers yet. Add your first one."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
          {customers.map((c, i) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className={`flex items-center justify-between px-4 py-3.5 active:bg-brand-light ${
                i !== 0 ? "border-t border-line" : ""
              }`}
            >
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                {c.phone && <p className="text-sm text-ink-muted">{c.phone}</p>}
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </Link>
          ))}
        </div>
      )}

      {addOpen && <CustomerFormSheet onClose={() => setAddOpen(false)} />}
    </div>
  )
}
