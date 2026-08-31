// Literal `process.env.NEXT_PUBLIC_X` access is required so Next.js can
// statically inline these values into Edge/browser bundles.

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Set it in .env.local."
    )
  }
  return url
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Set it in .env.local."
    )
  }
  return key
}
