import Link from "next/link"
import { formatCurrency } from "@/lib/format"

export function StatCard({
  label,
  revenue,
  expenses,
  net,
  transactionCount,
  href,
}: {
  label: string
  revenue: number
  expenses: number
  net: number
  transactionCount?: number
  href?: string
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(net)}</p>
      <p className="mt-0.5 text-xs text-ink-muted">net</p>
      <div className="mt-4 flex gap-4 border-t border-line pt-3 text-sm">
        <div>
          <span className="block text-ink-muted">Revenue</span>
          <span className="font-semibold text-success">{formatCurrency(revenue)}</span>
        </div>
        <div>
          <span className="block text-ink-muted">Expenses</span>
          <span className="font-semibold text-danger">{formatCurrency(expenses)}</span>
        </div>
        {transactionCount !== undefined && (
          <div>
            <span className="block text-ink-muted">Transactions</span>
            <span className="font-semibold text-ink">{transactionCount}</span>
          </div>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl bg-surface p-5 shadow-card transition active:scale-[0.99] active:bg-brand-light/40"
      >
        {content}
      </Link>
    )
  }

  return <div className="rounded-2xl bg-surface p-5 shadow-card">{content}</div>
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  )
}
