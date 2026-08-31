import { AppShell } from "@/components/app-shell"
import { getCustomers } from "@/lib/data/customers"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const customers = await getCustomers()

  return <AppShell customers={customers}>{children}</AppShell>
}
