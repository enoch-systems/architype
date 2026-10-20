import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminDashboard, type AdminUser } from "@/components/admin-dashboard"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Academy Operations | Tech Trailblazer Academy",
  robots: { index: false, follow: false },
}

export default async function AcademyOperationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role

  if (!user || !["owner", "admin", "viewer"].includes(role)) {
    redirect("/academy-login")
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, full_name, email, whatsapp_number, country, course, created_at, sex, employment_status, has_laptop, motivation, status")
    .order("created_at", { ascending: false })
    .range(0, 999)

  if (error) {
    console.error("Failed to load applications:", error.code)
  }

  const initialUsers: AdminUser[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp_number,
    country: row.country,
    course: row.course,
    registeredAt: row.created_at,
    sex: row.sex,
    employmentStatus: row.employment_status,
    hasLaptop: row.has_laptop,
    motivation: row.motivation,
    status: row.status === "enrolled" ? "Enrolled" : row.status === "contacted" ? "Contacted" : "New",
  }))

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("full_name, phone_number, role")
    .eq("user_id", user.id)
    .maybeSingle()

  const adminName = profile?.full_name || (typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name
    : user.email?.split("@")[0] ?? "Admin")

  return <AdminDashboard initialUsers={initialUsers} adminName={adminName} adminEmail={user.email ?? ""} adminRole={profile?.role ?? role} adminId={user.id} adminPhone={profile?.phone_number ?? ""} />
}