"use client"

import { ArrowUpRight, Check, LoaderCircle, X } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const courses = [
  { title: "Cybersecurity", description: "Protect systems and networks through digital security practices." },
  { title: "UI/UX Design", description: "Design intuitive digital products, apps, and websites." },
  { title: "Cloud Computing", description: "Build and manage cloud-based services and infrastructure." },
  { title: "Web Development", description: "Create responsive and interactive websites." },
  { title: "Data Analysis", description: "Turn raw information into useful insights and reports." },
  { title: "AI Video Creation", description: "Create and edit video content with AI-powered tools." },
  { title: "AI Automation", description: "Use AI tools and workflows to automate repetitive tasks." },
  { title: "AI Agent Development", description: "Build AI agents that can handle tasks and workflows." },
  { title: "Backend Development", description: "Develop APIs, databases, and server-side systems." },
  { title: "Frontend Development", description: "Create responsive interfaces with modern web technologies." },
  { title: "Ethical Hacking", description: "Test systems with authorized security techniques." },
]

type ApplicationReceipt = {
  fullName: string
  email: string
  whatsapp: string
  sex: string
  country: string
  course: string
  employmentStatus: string
  hasLaptop: string
  motivation: string
}

const requiredFieldLabels: Record<string, string> = {
  fullName: "your full name",
  email: "your email address",
  whatsapp: "your WhatsApp number",
  sex: "your sex",
  country: "your country",
  course: "a course",
  employmentStatus: "your employment status",
  hasLaptop: "whether you have a laptop",
  motivation: "why you want to learn this skill",
}

function CourseCard({
  course,
  index,
  onApply,
}: {
  course: (typeof courses)[number]
  index: number
  onApply: (courseTitle: string) => void
}) {
  const { ref, isVisible } = useScrollReveal(0.1)

  return (
    <div
      ref={ref}
      className={`group flex min-h-[250px] flex-col bg-background p-6 transition-all duration-700 md:p-8 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${(index % 2) * 150}ms` }}
    >
      <div className="mb-8 flex items-start justify-between">
        <span className="text-[11px] tracking-[0.15em] text-muted-foreground/50 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
          Paid Program
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-medium tracking-tight text-foreground md:text-xl">
          {course.title}
        </h3>
        <p className="max-w-sm text-sm leading-[1.75] text-muted-foreground">
          {course.description}
        </p>
        <button
          type="button"
          onClick={() => onApply(course.title)}
          className="group/link mt-auto inline-flex w-fit items-center gap-2 border border-foreground/20 px-3 py-2 text-[11px] tracking-[0.15em] uppercase text-lime-700 transition-colors hover:border-foreground/60 hover:bg-foreground hover:text-lime-400"
        >
          Apply Now
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </button>
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const { ref, isVisible } = useScrollReveal(0.05)
  const [pendingCourse, setPendingCourse] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const confirmationRef = useRef<HTMLDialogElement>(null)
  const receiptRef = useRef<HTMLDialogElement>(null)
  const successRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const dialog = confirmationRef.current
    if (!dialog) return

    if (pendingCourse && !dialog.open) {
      dialog.showModal()
    } else if (!pendingCourse && dialog.open) {
      dialog.close()
    }
  }, [pendingCourse])

  useEffect(() => {
    const dialog = receiptRef.current
    if (!dialog) return

    if (receipt && !dialog.open) {
      dialog.showModal()
    } else if (!receipt && dialog.open) {
      dialog.close()
    }
  }, [receipt])

  useEffect(() => {
    const dialog = successRef.current
    if (!dialog) return

    if (submitted && !dialog.open) {
      dialog.showModal()
    } else if (!submitted && dialog.open) {
      dialog.close()
    }
  }, [submitted])

  useEffect(() => () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
  }, [])

  const showWarning = (message: string) => {
    setWarningMessage(message)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    warningTimerRef.current = setTimeout(() => setWarningMessage(null), 3800)
  }

  const handleApplicationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isProcessing) return

    const form = event.currentTarget
    const invalidField = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]"),
    ).find((field) => !field.checkValidity() || !field.value.trim())

    if (invalidField) {
      const message = invalidField.name === "email" && invalidField.validity.typeMismatch
        ? "Please enter a valid email address."
        : invalidField.name === "whatsapp" && invalidField.validity.patternMismatch
          ? "Please enter a valid WhatsApp number."
          : `Please fill in ${requiredFieldLabels[invalidField.name] ?? "the required fields"}.`

      showWarning(message)
      invalidField.scrollIntoView({ behavior: "smooth", block: "center" })
      invalidField.focus({ preventScroll: true })
      return
    }

    const formData = new FormData(form)
    const read = (name: string) => String(formData.get(name) ?? "").trim()
    const application: ApplicationReceipt = {
      fullName: read("fullName"),
      email: read("email"),
      whatsapp: `${read("countryCode")} ${read("whatsapp")}`,
      sex: read("sex"),
      country: read("country"),
      course: read("course"),
      employmentStatus: read("employmentStatus"),
      hasLaptop: read("hasLaptop"),
      motivation: read("motivation"),
    }
    setWarningMessage(null)
    setSubmitError(null)
    setSubmitted(false)
    setReceipt(application)
  }

  const editApplication = () => {
    if (isProcessing) return
    setReceipt(null)
    setSubmitError(null)
    window.requestAnimationFrame(() => {
      document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" })
      document.getElementById("course-select")?.focus({ preventScroll: true })
    })
  }

  const discardApplication = () => {
    if (isProcessing) return
    formRef.current?.reset()
    setSelectedCourse("")
    setReceipt(null)
    setSubmitError(null)
    setSubmitted(false)
  }

  const confirmApplication = async () => {
    if (!receipt || isProcessing) return

    setSubmitError(null)
    setIsProcessing(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receipt),
      })
      const result: unknown = await response.json().catch(() => null)
      const errorMessage = typeof result === "object" && result !== null && "error" in result &&
        typeof result.error === "string"
        ? result.error
        : "Your application could not be saved. Please try again."
      if (!response.ok) throw new Error(errorMessage)
      if (typeof result !== "object" || result === null || !("submitted" in result) || result.submitted !== true) {
        throw new Error("We could not confirm that your application was saved. Please try again.")
      }

      setReceipt(null)
      setSubmitError(null)
      formRef.current?.reset()
      setSelectedCourse("")
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your application could not be saved. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const proceedToRegistration = () => {
    if (!pendingCourse) return

    setSelectedCourse(pendingCourse)
    setPendingCourse(null)
    window.requestAnimationFrame(() => {
      document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" })
      document.getElementById("course-select")?.focus({ preventScroll: true })
    })
  }

  return (
    <section id="courses" className="px-6 py-28 md:px-12 lg:px-20 md:py-36">
      <div
        ref={ref}
        className={`flex flex-col md:flex-row md:items-end justify-between mb-20 pb-6 border-b border-border transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Paid Tech Programs
          </p>
          <h2 className="text-3xl md:text-[2.75rem] font-extralight tracking-tight text-foreground">
            Explore Our Courses
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-[1.75] text-muted-foreground">
            Explore paid technology and digital courses with practical, career-focused training to help you prepare for your next step in tech.
          </p>
        </div>
        <span className="text-[11px] tracking-[0.15em] text-muted-foreground/50 mt-4 md:mt-0">
          ({String(courses.length).padStart(2, "0")}) Programs
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course, index) => (
          <CourseCard
            key={course.title}
            course={course}
            index={index}
            onApply={setPendingCourse}
          />
        ))}
      </div>

      <dialog
        ref={confirmationRef}
        aria-labelledby="apply-confirmation-title"
        onCancel={(event) => {
          event.preventDefault()
          setPendingCourse(null)
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPendingCourse(null)
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-border bg-background p-7 text-foreground shadow-2xl backdrop:bg-black/60 md:p-10"
      >
        <p className="mb-4 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          Application Confirmation
        </p>
        <h2 id="apply-confirmation-title" className="text-2xl font-light leading-snug tracking-tight md:text-3xl">
          Are you sure you want to apply for {pendingCourse}?
        </h2>
        <p className="mt-4 text-sm leading-[1.75] text-muted-foreground">
          Proceed to the registration form with this course selected, or discard and keep browsing.
        </p>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => setPendingCourse(null)}
            className="border border-foreground/20 px-4 py-3 text-[11px] tracking-[0.16em] uppercase text-foreground/75 transition-colors hover:border-foreground/60"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={proceedToRegistration}
            className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-3 text-[11px] tracking-[0.16em] uppercase text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Proceed
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </dialog>

      <section id="apply" className="scroll-mt-24 -mx-6 mt-28 bg-foreground px-6 py-20 text-background md:-mx-12 md:px-12 md:py-28 lg:-mx-20 lg:px-20">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="mb-5 text-[11px] tracking-[0.3em] uppercase text-background/45">
              Registration
            </p>
            <h2 className="text-3xl font-extralight leading-[1.15] tracking-tight text-balance md:text-4xl lg:text-[2.75rem]">
              READY TO START YOUR<br className="hidden sm:block" /> <span className="text-lime-300">JOURNEY?</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.75] text-background/60">
              Fill out the form below and we&apos;ll get you enrolled in no time.
            </p>
          </div>

          <form
            id="apply-form"
            ref={formRef}
            noValidate
            className="space-y-12"
            onSubmit={handleApplicationSubmit}
          >
            <fieldset className="space-y-7">
              <legend className="mb-7 w-full border-b border-background/15 pb-4 text-[11px] tracking-[0.25em] uppercase text-background/45">
                Personal Information
              </legend>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Full Name <span aria-hidden="true">*</span>
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent px-0 py-3 text-base normal-case tracking-normal text-background outline-none transition-colors placeholder:text-background/30 focus:border-background md:text-sm"
                />
              </label>
            </fieldset>

            <fieldset className="grid gap-x-8 gap-y-7 md:grid-cols-2">
              <legend className="mb-7 w-full border-b border-background/15 pb-4 text-[11px] tracking-[0.25em] uppercase text-background/45">
                Contact Details
              </legend>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Email Address <span aria-hidden="true">*</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent px-0 py-3 text-base normal-case tracking-normal text-background outline-none transition-colors placeholder:text-background/30 focus:border-background md:text-sm"
                />
              </label>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                WhatsApp Number <span aria-hidden="true">*</span>
                <span className="mt-2 flex items-center gap-3 border-b border-background/20 focus-within:border-background">
                  <select
                    name="countryCode"
                    aria-label="Country dialing code"
                    defaultValue="+234"
                    className="max-w-28 bg-transparent py-3 text-base tracking-normal text-background outline-none md:text-sm"
                  >
                    <option value="+234" className="bg-foreground">+234</option>
                    <option value="+27" className="bg-foreground">+27</option>
                    <option value="+20" className="bg-foreground">+20</option>
                    <option value="+254" className="bg-foreground">+254</option>
                    <option value="+212" className="bg-foreground">+212</option>
                    <option value="+251" className="bg-foreground">+251</option>
                    <option value="+213" className="bg-foreground">+213</option>
                  </select>
                  <input
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel-national"
                    pattern="[0-9](?:[0-9]| |\\(|\\)|-){6,}"
                    title="Enter at least seven digits, using only numbers, spaces, parentheses, or hyphens."
                    required
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none placeholder:text-background/30 md:text-sm"
                  />
                </span>
              </label>
            </fieldset>

            <fieldset className="grid gap-x-8 gap-y-7 md:grid-cols-2">
              <legend className="mb-7 w-full border-b border-background/15 pb-4 text-[11px] tracking-[0.25em] uppercase text-background/45">
                Demographics
              </legend>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Sex <span aria-hidden="true">*</span>
                <select name="sex" required defaultValue="" className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none focus:border-background md:text-sm">
                  <option value="" disabled className="bg-foreground">Select your sex</option>
                  <option className="bg-foreground">Male</option>
                  <option className="bg-foreground">Female</option>
                </select>
              </label>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Country <span aria-hidden="true">*</span>
                <select name="country" required defaultValue="" className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none focus:border-background md:text-sm">
                  <option value="" disabled className="bg-foreground">Select country</option>
                  <option className="bg-foreground">Nigeria</option>
                  <option className="bg-foreground">South Africa</option>
                  <option className="bg-foreground">Egypt</option>
                  <option className="bg-foreground">Kenya</option>
                  <option className="bg-foreground">Morocco</option>
                  <option className="bg-foreground">Ethiopia</option>
                  <option className="bg-foreground">Algeria</option>
                </select>
              </label>
            </fieldset>

            <fieldset className="grid gap-x-8 gap-y-7 md:grid-cols-2">
              <legend className="mb-7 w-full border-b border-background/15 pb-4 text-[11px] tracking-[0.25em] uppercase text-background/45">
                Course Selection
              </legend>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55 md:col-span-2">
                Course Applying For <span aria-hidden="true">*</span>
                <select id="course-select" name="course" required value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none focus:border-background md:text-sm">
                  <option value="" disabled className="bg-foreground">Select course</option>
                  {courses.map((course) => (
                    <option key={course.title} className="bg-foreground">
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Employment Status <span aria-hidden="true">*</span>
                <select name="employmentStatus" required defaultValue="" className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none focus:border-background md:text-sm">
                  <option value="" disabled className="bg-foreground">Select status</option>
                  <option className="bg-foreground">Employed</option>
                  <option className="bg-foreground">Unemployed</option>
                  <option className="bg-foreground">Student</option>
                  <option className="bg-foreground">Freelancer</option>
                </select>
              </label>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Do You Have a Laptop? <span aria-hidden="true">*</span>
                <select name="hasLaptop" required defaultValue="" className="mt-2 block w-full border-0 border-b border-background/20 bg-transparent py-3 text-base normal-case tracking-normal text-background outline-none focus:border-background md:text-sm">
                  <option value="" disabled className="bg-foreground">Select option</option>
                  <option className="bg-foreground">Yes</option>
                  <option className="bg-foreground">No</option>
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend className="mb-7 w-full border-b border-background/15 pb-4 text-[11px] tracking-[0.25em] uppercase text-background/45">
                Motivation
              </legend>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-background/55">
                Why Do You Want to Learn This Skill? <span aria-hidden="true">*</span>
                <textarea
                  name="motivation"
                  rows={4}
                  required
                  className="mt-2 block w-full resize-y border-0 border-b border-background/20 bg-transparent px-0 py-3 text-base normal-case leading-[1.75] tracking-normal text-background outline-none transition-colors placeholder:text-background/30 focus:border-background md:text-sm"
                />
              </label>
            </fieldset>

            <div className="flex flex-col items-start gap-6 border-t border-background/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-[1.75] text-background/45">
                Please review your details carefully before submitting.
              </p>
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-3 border border-background/30 px-6 py-4 text-[11px] tracking-[0.2em] uppercase text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Submit Application
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {warningMessage && (
        <div
          role="alert"
          className="fixed left-1/2 top-24 z-[110] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 border border-background/15 border-l-4 border-lime-400 bg-foreground px-5 py-4 text-background shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <span className="mt-0.5 h-2 w-2 shrink-0 bg-lime-400" />
          <p className="flex-1 text-sm leading-[1.6]">{warningMessage}</p>
          <button
            type="button"
            aria-label="Dismiss warning"
            onClick={() => setWarningMessage(null)}
            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center text-background/60 transition-colors hover:text-background"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}

      <dialog
        ref={receiptRef}
        aria-labelledby="application-receipt-title"
        onCancel={(event) => {
          event.preventDefault()
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60"
      >
        {receipt && (
          <div className="p-6 sm:p-9">
            <div className="flex items-start justify-between gap-6 border-b border-border pb-6">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-lime-700">
                  Application Review · Draft
                </p>
                <h2 id="application-receipt-title" className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
                  Review your details
                </h2>
                <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">
                  Check everything before confirming your application.
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                aria-label="Close review"
                onClick={() => setReceipt(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:bg-muted"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            {submitError && (
              <p role="alert" className="mt-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {submitError}
              </p>
            )}

            <dl className="mt-5 divide-y divide-border">
              {[
                ["Full name", receipt.fullName],
                ["Email address", receipt.email],
                ["WhatsApp number", receipt.whatsapp],
                ["Sex", receipt.sex],
                ["Country", receipt.country],
                ["Course", receipt.course],
                ["Employment status", receipt.employmentStatus],
                ["Has a laptop", receipt.hasLaptop],
                ["Motivation", receipt.motivation],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-5">
                  <dt className="text-[10px] tracking-[0.17em] uppercase text-muted-foreground">{label}</dt>
                  <dd className="break-words text-sm leading-[1.65] text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={isProcessing}
                onClick={discardApplication}
                className="w-full border border-foreground/20 px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-foreground/70 transition-colors hover:border-foreground/50 sm:w-auto"
              >
                Discard
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={editApplication}
                  className="w-full border border-foreground/20 px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-foreground/75 transition-colors hover:border-foreground/50 sm:w-auto"
                >
                  Edit application
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={confirmApplication}
                  aria-busy={isProcessing}
                  className="inline-flex w-full items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-background transition-colors hover:bg-transparent hover:text-foreground disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm &amp; submit
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <dialog
        ref={successRef}
        aria-labelledby="application-success-title"
        onCancel={(event) => event.preventDefault()}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md border border-border bg-background p-7 text-foreground shadow-2xl backdrop:bg-black/60 sm:p-9"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-lime-600 bg-lime-50 text-lime-700 animate-[submit-check-pop_650ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
            <Check aria-hidden="true" className="h-9 w-9" />
          </span>
          <p className="mt-7 text-[10px] tracking-[0.25em] uppercase text-lime-700">
            Application received
          </p>
          <h2 id="application-success-title" className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
            Application submitted successfully
          </h2>
          <p className="mt-4 text-sm leading-[1.75] text-muted-foreground">
            Your application has been saved and is now available to the academy admissions team. We&apos;ll contact you by WhatsApp or email with the next steps.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-8 w-full border border-foreground bg-foreground px-5 py-4 text-[11px] tracking-[0.2em] uppercase text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Close
          </button>
        </div>
      </dialog>
    </section>
  )
}
