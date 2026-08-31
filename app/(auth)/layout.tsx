import { Sparkles } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="mb-8 flex items-center gap-2 text-brand">
        <Sparkles className="h-6 w-6" strokeWidth={2.5} />
        <span className="text-lg font-semibold text-ink">Beauty Business Manager</span>
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">{children}</div>
    </div>
  )
}
