"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client"
import { createClient as createSupabaseAuthClient } from "@supabase/supabase-js"
import {
  Activity,
  ArrowUpLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  Command,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type AdminView = "Overview" | "Users" | "Email follow-up" | "Settings"

export type AdminUser = {
  id: string
  name: string
  email: string
  whatsapp: string
  country: string
  course: string
  registeredAt: string
  sex: string
  employmentStatus: string
  hasLaptop: string
  motivation: string
  status: "New" | "Contacted" | "Enrolled"
}

type ApplicationRow = {
  id: string
  full_name: string
  email: string
  whatsapp_number: string
  country: string
  course: string
  created_at: string
  sex: string
  employment_status: string
  has_laptop: string
  motivation: string
  status: string
}

function mapApplication(row: ApplicationRow): AdminUser {
  const status = row.status.toLowerCase()
  return {
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
    status: status === "enrolled" ? "Enrolled" : status === "contacted" ? "Contacted" : "New",
  }
}

function getLagosMonthKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  return `${year}-${month}`
}

const courseCategoryColors = [
  { name: "Development & cloud", color: "#65a30d" },
  { name: "Security", color: "#84cc16" },
  { name: "Design", color: "#a3e635" },
  { name: "Data & AI", color: "#d9f99d" },
]

const navItems: { view: AdminView; icon: typeof LayoutDashboard }[] = [
  { view: "Overview", icon: LayoutDashboard },
  { view: "Users", icon: Users },
  { view: "Email follow-up", icon: Mail },
  { view: "Settings", icon: Settings2 },
]

function formatNigeriaTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
    hour12: true,
  }).format(new Date(value))
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
}

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  const styles = {
    New: "bg-lime-100 text-lime-800",
    Contacted: "bg-sky-100 text-sky-800",
    Enrolled: "bg-emerald-100 text-emerald-800",
  }

  return <span className={`inline-flex px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}>{status}</span>
}

export function AdminDashboard({
  initialUsers,
  adminName,
  adminEmail,
  adminRole,
  adminId,
  adminPhone,
}: {
  initialUsers: AdminUser[]
  adminName: string
  adminEmail: string
  adminRole: string
  adminId: string
  adminPhone: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [realtimeStatus, setRealtimeStatus] = useState<"Connecting" | "Live" | "Offline">("Connecting")
  const [profileName, setProfileName] = useState(adminName)
  const [profilePhone, setProfilePhone] = useState(adminPhone)
  const [activeView, setActiveView] = useState<AdminView>("Overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false)
  const [signOutPending, setSignOutPending] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordChangePending, setPasswordChangePending] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const refreshApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, full_name, email, whatsapp_number, country, course, created_at, sex, employment_status, has_laptop, motivation, status")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Failed to refresh applications:", error.code)
        setRealtimeStatus("Offline")
        return
      }
      setUsers((data ?? []).map((row) => mapApplication(row as ApplicationRow)))
      setRealtimeStatus("Live")
    }

    const channel = supabase
      .channel("admin-applications-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        void refreshApplications()
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("Live")
          void refreshApplications()
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setRealtimeStatus("Offline")
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) =>
      [user.name, user.email, user.whatsapp, user.country, user.course, user.id]
        .some((value) => value.toLowerCase().includes(query)),
    )
  }, [search, users])

  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.has(user.id))
  const activeNav = navItems.find((item) => item.view === activeView)
  const ActiveIcon = activeNav?.icon ?? LayoutDashboard

  const registrationTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setDate(1)
      date.setHours(12, 0, 0, 0)
      date.setMonth(date.getMonth() - (5 - index))
      const label = new Intl.DateTimeFormat("en-NG", { month: "short", timeZone: "Africa/Lagos" }).format(date)
      const key = getLagosMonthKey(date)
      return { month: label, key, registrations: 0 }
    })

    users.forEach((user) => {
      const bucket = months.find((month) => month.key === getLagosMonthKey(new Date(user.registeredAt)))
      if (bucket) bucket.registrations += 1
    })
    return months
  }, [users])

  const coursePerformance = useMemo(() => {
    const counts = new Map<string, number>()
    users.forEach((user) => counts.set(user.course, (counts.get(user.course) ?? 0) + 1))
    return [...counts.entries()]
      .map(([course, count]) => ({ course, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5)
  }, [users])

  const courseMix = useMemo(() => {
    const counts = new Map(courseCategoryColors.map((category) => [category.name, 0]))
    users.forEach((user) => {
      const category = /cyber|hack/i.test(user.course)
        ? "Security"
        : /design|ui\/ux/i.test(user.course)
          ? "Design"
          : /data|ai/i.test(user.course)
            ? "Data & AI"
            : "Development & cloud"
      counts.set(category, (counts.get(category) ?? 0) + 1)
    })
    return courseCategoryColors.map((category) => ({
      ...category,
      value: users.length === 0 ? 0 : Math.round(((counts.get(category.name) ?? 0) / users.length) * 100),
    }))
  }, [users])

  const currentMonthKey = getLagosMonthKey(new Date())
  const newThisMonth = users.filter((user) => getLagosMonthKey(new Date(user.registeredAt)) === currentMonthKey).length
  const awaitingFollowUp = users.filter((user) => user.status === "New").length
  const metrics = [
    { label: "Total registrations", value: users.length.toLocaleString(), icon: Users, detail: "all-time applications" },
    { label: "New this month", value: newThisMonth.toLocaleString(), icon: UserPlus, detail: "registered this month" },
    { label: "Awaiting follow-up", value: awaitingFollowUp.toLocaleString(), icon: Clock3, detail: "status: new" },
        { label: "Programs active", value: "11", icon: Activity, detail: "currently accepting" },
  ]

  const showNotice = (message: string) => {
    setNotice(message)
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3600)
  }

  const selectUser = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateUserStatus = async (userId: string, status: AdminUser["status"]) => {
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase
      .from("applications")
      .update({ status: status.toLowerCase() })
      .eq("id", userId)

    if (error) {
      showNotice("Could not update the application status. Check your admin permissions.")
      return
    }

    setUsers((current) => current.map((user) => user.id === userId ? { ...user, status } : user))
    showNotice("Application status updated.")
  }

  const selectAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) filteredUsers.forEach((user) => next.delete(user.id))
      else filteredUsers.forEach((user) => next.add(user.id))
      return next
    })
  }

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showNotice(`${label} copied.`)
    } catch {
      showNotice("Clipboard access is unavailable in this browser.")
    }
  }

  const confirmSignOut = async () => {
    setSignOutPending(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signOut()
    setSignOutPending(false)
    if (error) {
      setSignOutConfirmOpen(false)
      showNotice("Could not sign out. Please try again.")
      return
    }
    window.location.assign("/academy-login")
  }

  const saveAdminProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase
      .from("admin_profiles")
      .update({ full_name: profileName.trim(), phone_number: profilePhone.trim() })
      .eq("user_id", adminId)

    if (error) {
      setSettingsSaved(false)
      showNotice("Could not save your profile. Check your admin access and try again.")
      return
    }

    setSettingsSaved(true)
    showNotice("Admin profile saved.")
  }

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      showNotice("New password and confirmation do not match.")
      return
    }
    if (newPassword.length < 12) {
      showNotice("Choose a new password with at least 12 characters.")
      return
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      showNotice("Password change is unavailable because Supabase is not configured.")
      return
    }

    setPasswordChangePending(true)
    const verificationClient = createSupabaseAuthClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } },
    )

    try {
      const { data, error } = await verificationClient.auth.signInWithPassword({
        email: adminEmail,
        password: currentPassword,
      })
      if (error || data.user?.id !== adminId) {
        showNotice("Current password is incorrect.")
        return
      }

      const { error: updateError } = await createBrowserSupabaseClient().auth.updateUser({ password: newPassword })
      if (updateError) {
        showNotice(`Could not change password: ${updateError.message}`)
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      showNotice("Password changed successfully.")
    } catch (error) {
      showNotice(error instanceof Error ? `Could not change password: ${error.message}` : "Could not change password. Please try again.")
    } finally {
      await verificationClient.auth.signOut()
      setPasswordChangePending(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="border border-[#e6e9e1] bg-white p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs text-[#6e7468]">{metric.label}</p>
                <Icon className="h-4 w-4 text-[#71825c]" />
              </div>
              <div className="mt-6 flex items-end justify-between gap-2">
                <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#1c211a]">{metric.value}</p>
              </div>
              <p className="mt-2 text-[11px] text-[#8a9084]">{metric.detail}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1.55fr_1fr]">
        <section className="border border-[#e6e9e1] bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#232820]">Registration activity</h2>
              <p className="mt-1 text-xs text-[#858b80]">Monthly applications · Last six months · Lagos time</p>
            </div>
            <button type="button" className="flex items-center gap-2 border border-[#e2e6dc] px-3 py-2 text-[11px] text-[#555d4f]">
              Last 6 months <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            {users.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-[#858b80]">Registration activity will appear here as applications arrive.</div> : <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="registration-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84a94d" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#84a94d" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf0e9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#858b80", fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#858b80", fontSize: 10 }} />
                <Tooltip cursor={{ stroke: "#b4c994", strokeDasharray: "3 3" }} contentStyle={{ border: "1px solid #e6e9e1", borderRadius: 0, fontSize: 12 }} />
                <Area type="monotone" dataKey="registrations" stroke="#658b32" strokeWidth={2.5} fill="url(#registration-fill)" activeDot={{ r: 5, fill: "#658b32", stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>}
          </div>
        </section>

        <section className="border border-[#e6e9e1] bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#232820]">Program interest</h2>
            <p className="mt-1 text-xs text-[#858b80]">Share of selected courses</p>
          </div>
          <div className="relative h-52">
            {users.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-[#858b80]">Course interest appears after registrations.</div> : <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={courseMix} dataKey="value" nameKey="name" innerRadius={59} outerRadius={83} paddingAngle={3} stroke="none">
                  {courseMix.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip contentStyle={{ border: "1px solid #e6e9e1", borderRadius: 0, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-[#232820]">{users.length}</span>
              <span className="text-[10px] text-[#858b80]">registrations</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#edf0e9] pt-4">
            {courseMix.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[11px] text-[#697064]">
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span><span className="ml-auto text-[#343a30]">{item.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1.55fr_1fr]">
        <section className="border border-[#e6e9e1] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#232820]">Most selected programs</h2>
              <p className="mt-1 text-xs text-[#858b80]">Registrations by course</p>
            </div>
            <button type="button" onClick={() => setActiveView("Users")} className="text-xs text-[#587c2c] hover:text-[#39551a]">View users</button>
          </div>
          <div className="h-56">
            {coursePerformance.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-[#858b80]">Course rankings will appear after registrations.</div> : <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance} layout="vertical" margin={{ top: 2, right: 10, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#edf0e9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#858b80", fontSize: 10 }} />
                <YAxis type="category" dataKey="course" width={90} axisLine={false} tickLine={false} tick={{ fill: "#697064", fontSize: 10 }} />
                <Tooltip cursor={{ fill: "#f6f8f3" }} contentStyle={{ border: "1px solid #e6e9e1", borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="count" fill="#789a49" radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>}
          </div>
        </section>

        <section className="border border-[#e6e9e1] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0e9] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#232820]">Latest registrations</h2>
              <p className="mt-1 text-xs text-[#858b80]">Most recent applicants · Lagos time</p>
            </div>
            <button type="button" onClick={() => setActiveView("Users")} aria-label="View all users" className="flex h-8 w-8 items-center justify-center text-[#6c7465] hover:bg-[#f4f6f0]"><ArrowUpRight className="h-4 w-4" /></button>
          </div>
          <div className="divide-y divide-[#edf0e9]">
            {users.slice(0, 5).map((user) => (
              <button key={user.id} type="button" onClick={() => setSelectedUser(user)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#fafbf8]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#edf2e7] text-[10px] font-semibold text-[#5f773e]">{initials(user.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-[#30362b]">{user.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#858b80]">{user.course}</span>
                </span>
                <span className="hidden text-[10px] text-[#858b80] sm:block">{formatNigeriaTime(user.registeredAt).split(",")[0]}</span>
              </button>
            ))}
            {users.length === 0 && <p className="px-5 py-8 text-xs text-[#858b80]">No registrations yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs text-[#77806e]">Directory</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#20251d]">Users</h2>
          <p className="mt-1 text-sm text-[#7a8174]">{users.length} applicants</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-56 items-center gap-2 border border-[#e1e5dc] bg-white px-3 text-[#687161] focus-within:border-[#98ae78]">
            <Search className="h-4 w-4" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, course" className="w-full border-0 bg-transparent text-xs text-[#282e24] outline-none placeholder:text-[#a1a69c]" />
          </label>
          <button type="button" onClick={() => setActiveView("Email follow-up")} className="inline-flex h-10 items-center gap-2 bg-[#547631] px-3 text-xs text-white hover:bg-[#3f5c24]"><Mail className="h-3.5 w-3.5" /> Follow up</button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[#dce7ce] bg-[#f4f8ed] px-4 py-3">
          <p className="text-xs text-[#465537]"><strong>{selectedIds.size}</strong> users selected</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setActiveView("Email follow-up")} className="inline-flex h-8 items-center gap-2 border border-[#cbd9b8] bg-white px-3 text-[11px] text-[#3f5b25]"><Mail className="h-3.5 w-3.5" /> Prepare email</button>
            <button type="button" onClick={() => setSelectedIds(new Set())} className="h-8 px-3 text-[11px] text-[#66705e] hover:text-[#232820]">Clear</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden border border-[#e2e6dd] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9ece5] px-4 py-3 text-[11px] text-[#7d8478] sm:px-5">
          <span>Applicant records</span>
          <button type="button" className="inline-flex items-center gap-2 hover:text-[#31382d]"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e9ece5] bg-[#fafbf8] text-[10px] uppercase tracking-[0.12em] text-[#7d8478]">
                <th className="w-10 px-4 py-3"><input aria-label="Select all visible users" type="checkbox" checked={allVisibleSelected} onChange={selectAllVisible} className="accent-[#63843a]" /></th>
                <th className="px-3 py-3 font-medium">Applicant</th>
                <th className="px-3 py-3 font-medium">WhatsApp</th>
                <th className="px-3 py-3 font-medium">Course</th>
                <th className="px-3 py-3 font-medium">Registered · Lagos</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0e9]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-[#fbfcf9]">
                  <td className="px-4 py-3.5"><input aria-label={`Select ${user.name}`} type="checkbox" checked={selectedIds.has(user.id)} onChange={() => selectUser(user.id)} className="accent-[#63843a]" /></td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#edf2e7] text-[10px] font-semibold text-[#5f773e]">{initials(user.name)}</span>
                      <span className="min-w-0"><span className="block text-xs font-medium text-[#30362b]">{user.name}</span><span className="mt-1 block text-[11px] text-[#838a7e]">{user.email}</span></span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs text-[#5e6658]">{user.whatsapp}</td>
                  <td className="px-3 py-3.5 text-xs text-[#46503f]">{user.course}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-[11px] text-[#687061]">{formatNigeriaTime(user.registeredAt)}</td>
                  <td className="px-3 py-3.5">{adminRole === "viewer" ? <StatusBadge status={user.status} /> : <select aria-label={`Update ${user.name} status`} value={user.status} onChange={(event) => void updateUserStatus(user.id, event.target.value as AdminUser["status"])} className="border border-transparent bg-transparent px-2 py-1 text-[10px] text-[#526047] outline-none hover:border-[#e2e6dd] focus:border-[#91a875]"><option>New</option><option>Contacted</option><option>Enrolled</option></select>}</td>
                  <td className="px-4 py-3.5 text-right"><button type="button" onClick={() => setSelectedUser(user)} className="border border-[#e2e6dd] px-3 py-1.5 text-[11px] text-[#4d5e3d] transition-colors hover:border-[#91a875] hover:bg-[#f5f8f0]">View</button></td>
                </tr>
              ))}
              {filteredUsers.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#81887b]">No applicants match that search.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#e9ece5] px-4 py-3 text-[10px] text-[#858b80] sm:px-5">
          <span>Showing {filteredUsers.length} of {users.length} applicants</span>
          <div className="flex gap-2"><button type="button" disabled className="border border-[#e6e9e1] px-2.5 py-1 opacity-50">Previous</button><button type="button" disabled className="border border-[#e6e9e1] px-2.5 py-1 opacity-50">Next</button></div>
        </div>
      </div>
    </div>
  )

  const renderEmailFollowUp = () => (
    <section className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center border border-[#e2e6dd] bg-white px-6 py-12 text-center sm:px-10">
      <span className="flex h-14 w-14 items-center justify-center border border-[#e2e6dd] bg-[#f7f9f4] text-[#547631]">
        <Mail aria-hidden="true" className="h-6 w-6" />
      </span>
      <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-[#71825c]">
        Coming soon
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#20251d]">
        Email follow-up
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#7a8174]">
        Applicant email follow-ups are being prepared and will be available soon. You can continue to review applicant registrations in the meantime.
      </p>
      <button
        type="button"
        onClick={() => setActiveView("Users")}
        className="mt-7 inline-flex h-10 items-center gap-2 bg-[#547631] px-4 text-xs text-white transition-colors hover:bg-[#3f5c24]"
      >
        <Users aria-hidden="true" className="h-3.5 w-3.5" />
        View applicants
      </button>
    </section>
  )

  const renderSettings = () => (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-xs text-[#77806e]">Workspace</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#20251d]">Settings</h2><p className="mt-1 text-sm text-[#7a8174]">Profile and access preferences.</p></div>
      <section className="border border-[#e2e6dd] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#edf0e9] pb-4"><Settings2 className="h-4 w-4 text-[#71825c]" /><div><h3 className="text-sm font-semibold text-[#30362b]">Admin profile</h3><p className="mt-1 text-xs text-[#858b80]">Saved to your Supabase admin profile. The sign-in email is fixed.</p></div></div>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveAdminProfile}>
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">Display name<input required value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-2 h-10 w-full border border-[#e2e6dd] px-3 text-sm normal-case tracking-normal text-[#343a30]" /></label>
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">Admin email<input type="email" value={adminEmail} readOnly aria-readonly="true" className="mt-2 h-10 w-full border border-[#e2e6dd] bg-[#f7f8f5] px-3 text-sm normal-case tracking-normal text-[#777f70]" /></label>
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">Phone number<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="mt-2 h-10 w-full border border-[#e2e6dd] px-3 text-sm normal-case tracking-normal text-[#343a30]" /></label>
          <div className="sm:col-span-2"><button type="submit" className="inline-flex h-10 items-center gap-2 bg-[#547631] px-4 text-xs text-white hover:bg-[#3f5c24]">{settingsSaved ? <Check className="h-3.5 w-3.5" /> : null} Save profile</button></div>
        </form>
      </section>
      <section className="border border-[#e2e6dd] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[#71825c]" /><div><h3 className="text-sm font-semibold text-[#30362b]">Security</h3><p className="mt-1 text-xs text-[#858b80]">Authentication and session controls</p></div></div>
        <form onSubmit={changePassword} className="mt-5 space-y-4 border-t border-[#edf0e9] pt-5">
          <div><h4 className="text-xs font-medium text-[#40473b]">Change password</h4><p className="mt-1 text-xs text-[#858b80]">Confirm your current password before choosing a new one.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70] sm:col-span-2">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 h-10 w-full border border-[#e2e6dd] px-3 text-sm normal-case tracking-normal text-[#343a30]" /></label>
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">New password<input required type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 h-10 w-full border border-[#e2e6dd] px-3 text-sm normal-case tracking-normal text-[#343a30]" /><span className="mt-1 block normal-case tracking-normal text-[#858b80]">Use at least 12 characters.</span></label>
            <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">Confirm new password<input required type="password" autoComplete="new-password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-10 w-full border border-[#e2e6dd] px-3 text-sm normal-case tracking-normal text-[#343a30]" /></label>
          </div>
          <button type="submit" disabled={passwordChangePending} className="inline-flex h-10 items-center gap-2 bg-[#547631] px-4 text-xs text-white hover:bg-[#3f5c24] disabled:cursor-not-allowed disabled:opacity-50">{passwordChangePending ? "Changing password..." : "Change password"}</button>
        </form>
        <div className="mt-5 flex flex-col justify-between gap-4 border-t border-[#edf0e9] pt-5 sm:flex-row sm:items-center"><div><p className="text-xs font-medium text-[#40473b]">Supabase Auth</p><p className="mt-1 text-xs text-[#858b80]">Signed in as {adminEmail}. Sign out of this secure session.</p></div><button type="button" onClick={() => setSignOutConfirmOpen(true)} className="h-9 border border-[#e2e6dd] px-3 text-xs text-[#5d6556] hover:bg-[#f7f9f4]">Sign out</button></div>
      </section>
    </div>
  )

  const renderActiveView = () => {
    if (activeView === "Users") return renderUsers()
    if (activeView === "Email follow-up") return renderEmailFollowUp()
    if (activeView === "Settings") return renderSettings()
    return renderOverview()
  }

  const renderUserDrawer = () => selectedUser && (
    <>
      <button type="button" aria-label="Close applicant details" onClick={() => setSelectedUser(null)} className="fixed inset-0 z-[70] bg-[#12160f]/35 backdrop-blur-[2px]" />
      <aside aria-label={`${selectedUser.name} applicant details`} className="fixed inset-y-0 right-0 z-[75] flex w-full max-w-xl flex-col border-l border-[#e2e6dd] bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between border-b border-[#e9ece5] px-5 py-5 sm:px-7">
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-[#7e8773]">Applicant details · {selectedUser.id}</p><h2 className="mt-2 text-xl font-semibold text-[#252b21]">{selectedUser.name}</h2><p className="mt-1 text-xs text-[#7c8376]">Registered {formatNigeriaTime(selectedUser.registeredAt)} WAT</p></div>
          <button type="button" aria-label="Close details" onClick={() => setSelectedUser(null)} className="flex h-9 w-9 items-center justify-center border border-[#e2e6dd] text-[#58604f] hover:bg-[#f5f7f2]"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={selectedUser.status} /><span className="border border-[#e5e9e1] px-2.5 py-1 text-[10px] text-[#757d6d]">{selectedUser.course}</span></div>
          <section><h3 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#899080]">Contact</h3><div className="divide-y divide-[#edf0e9] border-y border-[#edf0e9]">
            {[["Email", selectedUser.email], ["WhatsApp", selectedUser.whatsapp], ["Country", selectedUser.country]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-[10px] text-[#8a9084]">{label}</p><p className="mt-1 break-all text-xs text-[#3e4539]">{value}</p></div><button type="button" onClick={() => copyValue(label, value)} aria-label={`Copy ${label}`} className="flex h-8 w-8 shrink-0 items-center justify-center text-[#74806a] hover:bg-[#f3f6ee]"><Clipboard className="h-3.5 w-3.5" /></button></div>)}
          </div></section>
          <section><h3 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#899080]">Application</h3><dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#edf0e9] py-4">{[["Sex", selectedUser.sex], ["Employment", selectedUser.employmentStatus], ["Has laptop", selectedUser.hasLaptop], ["Course", selectedUser.course]].map(([label, value]) => <div key={label}><dt className="text-[10px] text-[#8a9084]">{label}</dt><dd className="mt-1 text-xs text-[#3e4539]">{value}</dd></div>)}</dl></section>
          <section><h3 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#899080]">Motivation</h3><p className="border-l-2 border-[#9ab578] bg-[#f7f9f4] px-4 py-3 text-sm leading-6 text-[#535b4c]">{selectedUser.motivation}</p></section>
        </div>
        <div className="flex gap-2 border-t border-[#e9ece5] p-5 sm:px-7"><button type="button" onClick={() => { setSelectedIds(new Set([selectedUser.id])); setSelectedUser(null); setActiveView("Email follow-up") }} className="inline-flex h-10 flex-1 items-center justify-center gap-2 bg-[#547631] px-3 text-xs text-white hover:bg-[#3f5c24]"><Mail className="h-3.5 w-3.5" /> Email follow-up</button><button type="button" onClick={() => setSelectedUser(null)} className="h-10 border border-[#e2e6dd] px-4 text-xs text-[#555d4f] hover:bg-[#f7f9f4]">Close</button></div>
      </aside>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f5f6f3] text-[#20251d]">
      {sidebarOpen && <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/30 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e4e8df] bg-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-[#edf0e9] px-5">
          <img src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png" alt="" className="h-10 w-10 object-contain" />
          <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#394331]">Tech Trailblazer</p><p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#8b9285]">Academy admin</p></div>
        </div>
        <div className="px-4 pt-6"><p className="px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-[#a0a69b]">Workspace</p>
          <nav aria-label="Admin navigation" className="mt-2 space-y-1">{navItems.map(({ view, icon: Icon }) => <button key={view} type="button" onClick={() => { setActiveView(view); setSidebarOpen(false) }} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${activeView === view ? "bg-[#edf3e5] font-medium text-[#46652a]" : "text-[#6c7466] hover:bg-[#f5f7f2] hover:text-[#2e3528]"}`}><Icon className="h-4 w-4" />{view}{view === "Users" && <span className="ml-auto text-[10px] text-[#8a9184]">{users.length.toLocaleString()}</span>}</button>)}</nav>
        </div>
        <div className="mt-auto border-t border-[#edf0e9] p-4"><div className="flex items-center gap-3 px-2 py-2"><span className="flex h-8 w-8 items-center justify-center bg-[#edf2e7] text-[10px] font-semibold text-[#5f773e]">{initials(adminName)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#343a30]">{adminName}</span><span className="mt-1 block truncate text-[10px] capitalize text-[#8a9084]">{adminRole}</span></span><MoreHorizontal className="h-4 w-4 text-[#90978b]" /></div></div>
      </aside>

      <div className="min-h-screen md:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e4e8df] bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center text-[#5e6658] hover:bg-[#f3f5f0] md:hidden"><Menu className="h-5 w-5" /></button>
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden text-[#969c91] sm:inline">Academy</span><span className="hidden text-[#c0c5bc] sm:inline">/</span>
              <span className="flex min-w-0 items-center gap-2 truncate font-medium text-[#343a30]"><ActiveIcon className="h-3.5 w-3.5 text-[#758368]" />{activeView}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className={`hidden items-center gap-2 border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] sm:inline-flex ${realtimeStatus === "Live" ? "border-[#dfe8d5] bg-[#f4f8ee] text-[#577735]" : "border-[#e7e3d2] bg-[#faf8ef] text-[#807447]"}`}>
              <span className={`h-1.5 w-1.5 ${realtimeStatus === "Live" ? "bg-[#78a341]" : "bg-[#bea94b]"}`} />
              {realtimeStatus === "Live" ? "Supabase live" : realtimeStatus === "Offline" ? "Live sync offline" : "Connecting"}
            </span>
            <button type="button" onClick={() => showNotice(realtimeStatus === "Live" ? "Live applicant updates are connected." : "Live updates are not connected.")} aria-label="Realtime connection status" className="flex h-9 w-9 items-center justify-center text-[#6c7466] hover:bg-[#f3f5f0]"><Bell className="h-4 w-4" /></button>
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 border-l border-[#e8ebe5] pl-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#eaf0e2] text-[10px] font-semibold text-[#547631]">{initials(adminName)}</span>
                <span className="hidden max-w-40 text-left sm:block"><span className="block truncate text-[11px] font-medium text-[#343a30]">{adminName}</span><span className="mt-0.5 block truncate text-[9px] capitalize text-[#8a9084]">{adminRole} · {adminEmail}</span></span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-[#858b80] sm:block" />
              </button>
              {profileOpen && <div className="absolute right-0 top-11 z-50 w-48 border border-[#e2e6dd] bg-white p-1 shadow-xl"><button type="button" onClick={() => { setActiveView("Settings"); setProfileOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-[#50584b] hover:bg-[#f5f7f2]"><Settings2 className="h-3.5 w-3.5" />Profile & security</button><button type="button" onClick={() => { setProfileOpen(false); setSignOutConfirmOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-[#50584b] hover:bg-[#f5f7f2]"><XCircle className="h-3.5 w-3.5" />Sign out</button></div>}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7a856d]">{new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeZone: "Africa/Lagos" }).format(new Date())} · Lagos (WAT)</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#20251d] sm:text-[1.75rem]">{activeView === "Overview" ? `Welcome back, ${adminName}` : activeView}</h1><p className="mt-1 text-xs text-[#81887b]">{activeView === "Overview" ? "Here’s what’s happening with your programs today." : `Manage ${activeView.toLowerCase()} for your academy.`}</p></div>
            <div className="flex items-center gap-2"><span className="inline-flex items-center gap-2 text-[10px] text-[#7d8478]"><span className={`h-2 w-2 ${realtimeStatus === "Live" ? "bg-[#89a85c]" : "bg-[#bea94b]"}`} />{realtimeStatus === "Live" ? "Live data" : "Connecting to data"}</span></div>
          </div>
          {renderActiveView()}
        </main>
      </div>

      {renderUserDrawer()}

      {signOutConfirmOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#12160f]/35 p-4 backdrop-blur-[2px]">
          <section role="dialog" aria-modal="true" aria-labelledby="sign-out-title" aria-describedby="sign-out-description" className="w-full max-w-md border border-[#e2e6dd] bg-white p-6 shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7e8773]">Confirm sign out</p>
            <h2 id="sign-out-title" className="mt-2 text-lg font-semibold text-[#252b21]">Are you sure you want to sign out?</h2>
            <p id="sign-out-description" className="mt-2 text-sm leading-6 text-[#737b6c]">You’ll need to sign in again to access the admin console.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={signOutPending} onClick={() => setSignOutConfirmOpen(false)} className="h-9 border border-[#e2e6dd] px-3 text-xs text-[#626a5b] disabled:opacity-50">Cancel</button>
              <button type="button" disabled={signOutPending} onClick={() => void confirmSignOut()} className="h-9 bg-[#547631] px-4 text-xs text-white hover:bg-[#3f5c24] disabled:opacity-50">{signOutPending ? "Signing out..." : "Sign out"}</button>
            </div>
          </section>
        </div>
      )}

      {notice && <div role="status" className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 border border-[#dfe4d8] bg-white px-4 py-3 text-xs text-[#41483b] shadow-xl"><span className="h-2 w-2 shrink-0 bg-[#83a551]" />{notice}</div>}
    </div>
  )
}