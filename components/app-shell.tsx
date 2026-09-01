"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CalendarDays, Receipt, Settings, Plus } from "lucide-react"
import { QuickAddSheet } from "./quick-add-sheet"
import type { Customer } from "@/lib/data/customers"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppShell({
  customers,
  children,
}: {
  customers: Customer[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-30 hidden border-b border-line bg-paper/95 backdrop-blur md:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-base font-semibold text-ink">Beauty Business Manager</span>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-brand-light text-brand" : "text-ink-muted hover:bg-line/50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pt-4 md:px-6 md:pt-6">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden">
        <div className="relative mx-auto flex max-w-md items-center justify-around px-2 pb-1 pt-2">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}

          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add Service"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-card active:scale-95"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>

          {NAV_ITEMS.slice(2).map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </nav>

      {addOpen && (
        <QuickAddSheet customers={customers} onClose={() => setAddOpen(false)} />
      )}
    </div>
  )
}

function NavLink({
  item,
  active,
}: {
  item: (typeof NAV_ITEMS)[number]
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
        active ? "text-brand" : "text-ink-muted"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      {item.label}
    </Link>
  )
}
