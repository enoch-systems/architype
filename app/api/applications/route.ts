import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const allowedCountries = new Set([
  "Nigeria",
  "South Africa",
  "Egypt",
  "Kenya",
  "Morocco",
  "Ethiopia",
  "Algeria",
])

const allowedCourses = new Set([
  "Cybersecurity",
  "UI/UX Design",
  "Cloud Computing",
  "Web Development",
  "Data Analysis",
  "AI Video Creation",
  "AI Automation",
  "AI Agent Development",
  "Backend Development",
  "Frontend Development",
  "Ethical Hacking",
])

const allowedEmploymentStatuses = new Set(["Employed", "Unemployed", "Student", "Freelancer"])

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    const parsed: unknown = await request.json()
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid application details." }, { status: 400 })
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid application details." }, { status: 400 })
  }

  const read = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim() : ""
  const fullName = read("fullName")
  const email = read("email").toLowerCase()
  const whatsappNumber = read("whatsapp")
  const sex = read("sex")
  const country = read("country")
  const course = read("course")
  const employmentStatus = read("employmentStatus")
  const hasLaptop = read("hasLaptop")
  const motivation = read("motivation")

  if (fullName.length < 2 || fullName.length > 160) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 })
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  if (whatsappNumber.length < 7 || whatsappNumber.length > 32) {
    return NextResponse.json({ error: "Enter a valid WhatsApp number." }, { status: 400 })
  }
  if (sex !== "Male" && sex !== "Female") {
    return NextResponse.json({ error: "Select your sex." }, { status: 400 })
  }
  if (!allowedCountries.has(country)) {
    return NextResponse.json({ error: "Select a supported country." }, { status: 400 })
  }
  if (!allowedCourses.has(course)) {
    return NextResponse.json({ error: "Select a valid course." }, { status: 400 })
  }
  if (!allowedEmploymentStatuses.has(employmentStatus)) {
    return NextResponse.json({ error: "Select your employment status." }, { status: 400 })
  }
  if (hasLaptop !== "Yes" && hasLaptop !== "No") {
    return NextResponse.json({ error: "Select whether you have a laptop." }, { status: 400 })
  }
  if (motivation.length < 10 || motivation.length > 5000) {
    return NextResponse.json({ error: "Tell us a little more about why you want to learn this skill." }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("applications")
      .insert({
        full_name: fullName,
        email,
        whatsapp_number: whatsappNumber,
        sex,
        country,
        course,
        employment_status: employmentStatus,
        has_laptop: hasLaptop,
        motivation,
      })

    if (error) {
      console.error("Application insert failed:", error.code)
      return NextResponse.json({ error: "We could not save your application. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Application submission service failed:", error instanceof Error ? error.name : "UnknownError")
    return NextResponse.json(
      { error: "Application submission is temporarily unavailable. Please try again." },
      { status: 503 },
    )
  }

  return NextResponse.json({ submitted: true }, { status: 201 })
}