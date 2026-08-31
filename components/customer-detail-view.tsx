"use client"

import { useState } from "react"
import { Phone, Mail, Pencil, StickyNote } from "lucide-react"
import { CustomerFormSheet } from "./customer-form-sheet"
import { formatCurrency, formatDate } from "@/lib/format"
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants"
import type { Customer } from "@/lib/data/customers"
import type { CustomerTransaction } from "@/lib/data/customers"

export function CustomerDetailView({
  customer,
  transactions,
  total,
}: {
  customer: Customer
  transactions: CustomerTransaction[]
  total: number
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold text-ink">{customer.name}</h1>
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-full p-2 text-ink-muted active:bg-line/50"
            aria-label="Edit customer"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-muted">
          {customer.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </span>
          )}
          {customer.notes && (
            <span className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" /> {customer.notes}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <p className="text-sm font-medium text-ink-muted">Total spent</p>
        <p className="mt-1 text-3xl font-bold text-success">{formatCurrency(total)}</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-muted">Service history</h2>
        {transactions.length === 0 ? (
          <div className="rounded-2xl bg-surface p-6 text-center shadow-card">
            <p className="text-sm text-ink-muted">No services recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            {transactions.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i !== 0 ? "border-t border-line" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-ink">{t.service_name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(t.transaction_date)}
                    {t.payment_method &&
                      ` · ${PAYMENT_METHOD_LABELS[t.payment_method as PaymentMethod]}`}
                  </p>
                </div>
                <span className="font-semibold text-success">{formatCurrency(Number(t.amount))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editOpen && <CustomerFormSheet customer={customer} onClose={() => setEditOpen(false)} />}
    </div>
  )
}
