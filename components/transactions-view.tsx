"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Pencil, Trash2, Receipt } from "lucide-react"
import { QuickAddSheet } from "./quick-add-sheet"
import { deleteTransactionAction } from "@/app/(app)/actions"
import { formatCurrency, formatDate } from "@/lib/format"
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/lib/constants"
import type { Customer } from "@/lib/data/customers"
import type { TransactionWithCustomer } from "@/lib/data/transactions"

export function TransactionsView({
  transactions,
  customers,
}: {
  transactions: TransactionWithCustomer[]
  customers: Customer[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [editing, setEditing] = useState<TransactionWithCustomer | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const type = searchParams.get("type") ?? ""

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`/transactions?${params.toString()}`)
  }

  function handleDelete(id: string) {
    setDeleteError(null)
    setDeletingId(id)
  }

  function confirmDelete() {
    if (!deletingId) return
    const id = deletingId
    startTransition(async () => {
      const result = await deleteTransactionAction(id)
      if (result?.error) {
        setDeleteError(result.error)
      } else {
        setDeletingId(null)
        setDeleteError(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">Transactions</h1>
        <p className="text-sm text-ink-muted">Every service and expense you&apos;ve logged.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            updateParam("q", e.target.value)
          }}
          placeholder="Search by customer, service, category…"
          className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-base outline-none focus:border-brand"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: "", label: "All" },
          { value: "income", label: "Income" },
          { value: "expense", label: "Expenses" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("type", opt.value)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              type === opt.value
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <input
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value)}
          className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted"
          aria-label="From date"
        />
        <input
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value)}
          className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted"
          aria-label="To date"
        />
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl bg-surface p-8 text-center shadow-card">
          <Receipt className="mx-auto h-8 w-8 text-ink-muted" />
          <p className="mt-2 text-sm text-ink-muted">No transactions match these filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
          {transactions.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                i !== 0 ? "border-t border-line" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {t.type === "income" ? t.customers?.name ?? "Walk-in" : "Expense"}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {formatDate(t.transaction_date)} ·{" "}
                  {t.type === "income"
                    ? t.service_name
                    : EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory]}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`font-semibold ${t.type === "income" ? "text-success" : "text-danger"}`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(Number(t.amount))}
                </span>
                <button
                  onClick={() => setEditing(t)}
                  className="rounded-full p-1.5 text-ink-muted active:bg-line/50"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={isPending}
                  className="rounded-full p-1.5 text-ink-muted active:bg-line/50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <QuickAddSheet
          customers={customers}
          editTransaction={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            aria-label="Cancel"
            onClick={() => setDeletingId(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 shadow-sheet">
            <p className="text-base font-medium text-ink">Delete this record?</p>
            <p className="mt-1 text-sm text-ink-muted">This can&apos;t be undone.</p>
            {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
