import { TransactionsView } from "@/components/transactions-view"
import { getTransactions } from "@/lib/data/transactions"
import { getCustomers } from "@/lib/data/customers"

export const dynamic = "force-dynamic"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; from?: string; to?: string }
}) {
  const [transactions, customers] = await Promise.all([
    getTransactions({
      search: searchParams.q,
      type: searchParams.type === "income" || searchParams.type === "expense" ? searchParams.type : undefined,
      from: searchParams.from,
      to: searchParams.to,
    }),
    getCustomers(),
  ])

  return <TransactionsView transactions={transactions} customers={customers} />
}
