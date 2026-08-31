import { SettingsView } from "@/components/settings-view"
import { getCurrentUserAndProfile } from "@/lib/data/profile"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const data = await getCurrentUserAndProfile()

  return (
    <SettingsView
      email={data?.email ?? ""}
      businessName={data?.profile?.business_name ?? null}
      industry={data?.profile?.industry ?? "nail_salon"}
    />
  )
}
