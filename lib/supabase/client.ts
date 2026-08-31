import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import { getSupabaseAnonKey, getSupabaseUrl } from "./env"

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

// Memoized as a module-level singleton to avoid duplicate GoTrueClient instances.
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return browserClient
}
