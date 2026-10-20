const { loadEnvConfig } = require("@next/env")
const { createClient } = require("@supabase/supabase-js")

loadEnvConfig(process.cwd())

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
    ["ADMIN_EMAIL", email],
    ["ADMIN_PASSWORD", password],
  ].filter(([, value]) => !value).map(([key]) => key)

  if (missing.length > 0) {
    console.error(`Missing required environment values: ${missing.join(", ")}`)
    process.exitCode = 1
    return
  }

  if (password.length < 16) {
    console.error("Choose a new password at least 16 characters long. The password was not saved or logged.")
    process.exitCode = 1
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) throw listError

  const existingUser = users.users.find((user) => user.email?.toLowerCase() === email)
  let userId
  let action

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existingUser.app_metadata, role: "owner" },
    })
    if (error) throw error
    userId = data.user.id
    action = "updated"
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "owner" },
      user_metadata: { full_name: "Academy Admin" },
    })
    if (error) throw error
    userId = data.user.id
    action = "created"
  }

  const { error: profileError } = await supabase.from("admin_profiles").upsert({
    user_id: userId,
    email,
    full_name: "Academy Admin",
    phone_number: "",
    role: "owner",
  }, { onConflict: "user_id" })

  if (profileError) throw profileError

  console.log(`Primary admin account ${action}; owner profile configured for ${email}.`)
  console.log("Password was not written to a file or printed. Sign in at /academy-login.")
}

main().catch((error) => {
  console.error(`Admin setup failed: ${error.message}`)
  process.exitCode = 1
})