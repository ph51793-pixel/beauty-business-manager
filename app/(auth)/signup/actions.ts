"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type SignUpActionState = { error?: string; needsEmailConfirmation?: boolean } | undefined

export async function signUpAction(
  _prevState: SignUpActionState,
  formData: FormData
): Promise<SignUpActionState> {
  const businessName = String(formData.get("businessName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: businessName || null } },
  })

  if (error) {
    return { error: error.message.includes("already registered") ? "An account with this email already exists." : "Could not create your account. Try again." }
  }

  if (businessName && data.user) {
    await supabase.from("profiles").update({ business_name: businessName }).eq("id", data.user.id)
  }

  if (!data.session) {
    return { needsEmailConfirmation: true }
  }

  redirect("/dashboard")
}
