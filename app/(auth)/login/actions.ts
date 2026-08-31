"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type AuthActionState = { error?: string } | undefined

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard")

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Invalid email or password." }
  }

  redirect(redirectTo || "/dashboard")
}
