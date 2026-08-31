import { CustomersView } from "@/components/customers-view"
import { getCustomers } from "@/lib/data/customers"

export const dynamic = "force-dynamic"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const customers = await getCustomers(searchParams.q)

  return <CustomersView customers={customers} />
}
