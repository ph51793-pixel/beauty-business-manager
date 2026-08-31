"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { X, Search, Plus, UserRound } from "lucide-react"
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type ExpenseCategory,
  type PaymentMethod,
} from "@/lib/constants"
import { todayIsoDate } from "@/lib/format"
import { addTransactionAction, updateTransactionAction, type ActionState } from "@/app/(app)/actions"
import type { Customer } from "@/lib/data/customers"
import type { TransactionWithCustomer } from "@/lib/data/transactions"

function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-paper text-ink-muted active:bg-line/50"
      }`}
    >
      {children}
    </button>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  )
}

export function QuickAddSheet({
  customers,
  onClose,
  editTransaction,
  defaultType = "income",
}: {
  customers: Customer[]
  onClose: () => void
  editTransaction?: TransactionWithCustomer
  defaultType?: "income" | "expense"
}) {
  const isEdit = Boolean(editTransaction)
  const [type, setType] = useState<"income" | "expense">(
    editTransaction?.type === "expense" ? "expense" : editTransaction ? "income" : defaultType
  )

  const boundAction = isEdit
    ? updateTransactionAction.bind(null, editTransaction!.id)
    : addTransactionAction
  const [state, formAction] = useFormState<ActionState, FormData>(boundAction, undefined)

  const [customerQuery, setCustomerQuery] = useState(editTransaction?.customers?.name ?? "")
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    editTransaction?.customer_id ?? ""
  )
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (editTransaction?.payment_method as PaymentMethod) ?? "cash"
  )
  const [category, setCategory] = useState<ExpenseCategory>(
    (editTransaction?.category as ExpenseCategory) ?? "supplies"
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCustomerList(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return customers.slice(0, 6)
    return customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [customers, customerQuery])

  const exactMatch = customers.some(
    (c) => c.name.toLowerCase() === customerQuery.trim().toLowerCase()
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-sheet sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {isEdit ? "Edit record" : "Add record"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted active:bg-line/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isEdit && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <SegmentedButton active={type === "income"} onClick={() => setType("income")}>
              + Service (Income)
            </SegmentedButton>
            <SegmentedButton active={type === "expense"} onClick={() => setType("expense")}>
              − Expense
            </SegmentedButton>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="type" value={type} />

          {type === "income" ? (
            <div ref={containerRef} className="relative">
              <label htmlFor="customer" className="mb-1.5 block text-sm font-medium text-ink">
                Customer
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  id="customer"
                  type="text"
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value)
                    setSelectedCustomerId("")
                    setShowCustomerList(true)
                  }}
                  onFocus={() => setShowCustomerList(true)}
                  placeholder="Search or add a customer"
                  autoComplete="off"
                  className="w-full rounded-xl border border-line bg-paper py-3 pl-10 pr-4 text-base outline-none focus:border-brand"
                />
              </div>
              <input type="hidden" name="customer_id" value={selectedCustomerId} />
              <input
                type="hidden"
                name="new_customer_name"
                value={selectedCustomerId ? "" : customerQuery}
              />

              {showCustomerList && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(c.id)
                        setCustomerQuery(c.name)
                        setShowCustomerList(false)
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-brand-light"
                    >
                      <UserRound className="h-4 w-4 text-ink-muted" />
                      {c.name}
                    </button>
                  ))}
                  {customerQuery.trim() && !exactMatch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId("")
                        setShowCustomerList(false)
                      }}
                      className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm font-medium text-brand hover:bg-brand-light"
                    >
                      <Plus className="h-4 w-4" />
                      Add &quot;{customerQuery.trim()}&quot; as new customer
                    </button>
                  )}
                  {!customerQuery.trim() && filteredCustomers.length === 0 && (
                    <p className="px-4 py-2.5 text-sm text-ink-muted">No customers yet</p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {type === "income" ? (
            <div>
              <label htmlFor="service_name" className="mb-1.5 block text-sm font-medium text-ink">
                Service
              </label>
              <input
                id="service_name"
                name="service_name"
                type="text"
                required
                defaultValue={editTransaction?.service_name ?? ""}
                placeholder="e.g. Gel manicure"
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>
          ) : (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Category</span>
              <input type="hidden" name="category" value={category} />
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SegmentedButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                    {EXPENSE_CATEGORY_LABELS[cat]}
                  </SegmentedButton>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-ink">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  required
                  defaultValue={editTransaction?.amount ?? ""}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-line bg-paper py-3 pl-7 pr-4 text-base outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="transaction_date" className="mb-1.5 block text-sm font-medium text-ink">
                Date
              </label>
              <input
                id="transaction_date"
                name="transaction_date"
                type="date"
                required
                defaultValue={editTransaction?.transaction_date ?? todayIsoDate()}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
              />
            </div>
          </div>

          {type === "income" && (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Payment method</span>
              <input type="hidden" name="payment_method" value={paymentMethod} />
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <SegmentedButton key={pm} active={paymentMethod === pm} onClick={() => setPaymentMethod(pm)}>
                    {PAYMENT_METHOD_LABELS[pm]}
                  </SegmentedButton>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={editTransaction?.notes ?? ""}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-brand"
            />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton label={isEdit ? "Save changes" : type === "income" ? "Save service" : "Save expense"} />
        </form>
      </div>
    </div>
  )
}
