import { notFound } from "next/navigation"
import { CustomerDetailView } from "@/components/customer-detail-view"
import { getCustomer, getCustomerHistory } from "@/lib/data/customers"

export const dynamic = "force-dynamic"

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id)
  if (!customer) notFound()

  const { transactions, total } = await getCustomerHistory(params.id)

  return <CustomerDetailView customer={customer} transactions={transactions} total={total} />
}
