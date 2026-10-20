"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const allowedRoles = new Set(["owner", "admin", "viewer"])

export default function AcademyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState("")
  const [factorId, setFactorId] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [requiresTotp, setRequiresTotp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) throw new Error("Email or password is incorrect.")

      const role = data.user.app_metadata?.role
      if (typeof role !== "string" || !allowedRoles.has(role)) {
        await supabase.auth.signOut()
        throw new Error("This account does not have admin access.")
      }

      const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (assuranceError) throw assuranceError

      if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
        if (factorsError) throw factorsError

        const factor = factors.totp.find((item) => item.status === "verified")
        if (!factor) throw new Error("No verified authenticator is enrolled for this account.")

        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
        if (challengeError) throw challengeError

        setFactorId(factor.id)
        setChallengeId(challenge.id)
        setRequiresTotp(true)
        return
      }

      router.replace("/academy-ops-console")
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTotpVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: code.replace(/\s/g, "") })
      if (error) throw new Error("That authenticator code is invalid or expired.")
      router.replace("/academy-ops-console")
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify the authenticator code.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f5f6f3] text-[#20251d] lg:grid-cols-[1.04fr_0.96fr]">
      <div aria-hidden="true" className="absolute inset-0 lg:hidden">
        <img
          src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792448813/pxqifrfez5a7wcyw5nb3.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#10160d]/55 backdrop-blur-[2px]" />
      </div>

      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex xl:px-16">
        <img
          src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792448813/pxqifrfez5a7wcyw5nb3.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#11170e]/75 via-[#182014]/50 to-[#11170e]/70" />
        <a href="/" aria-label="Tech Trailblazer Academy home" className="relative flex w-fit items-center gap-3">
          <img
            src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
            alt=""
            className="h-12 w-12 object-contain"
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/90">
            Tech Trailblazer Academy
          </span>
        </a>
        <div className="relative mb-8 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-lime-200/80">Academy operations</p>
          <h2 className="mt-5 text-4xl font-extralight leading-[1.12] tracking-[-0.035em] xl:text-5xl">
            Build the future.
            <br />
            <span className="text-lime-200">Lead the way.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            A secure workspace for managing applications and supporting the next generation of tech talent.
          </p>
          <div className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/55">
            <span className="h-px w-10 bg-lime-200/70" />
            Secure administrator access
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,12,0.35)] backdrop-blur-xl sm:p-10 lg:border-[#e7ebe3] lg:bg-white">
          <a href="/" aria-label="Tech Trailblazer Academy home" className="flex w-fit items-center gap-3 lg:hidden">
            <img
              src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
              alt=""
              className="h-11 w-11 object-contain"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#40552d]">
              Tech Trailblazer Academy
            </span>
          </a>

          <div className="mt-8 flex h-11 w-11 items-center justify-center border border-[#e5e9e1] bg-[#f7f9f4] text-[#59783a] lg:mt-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.24em] text-[#728064]">
            Secure workspace
          </p>
          <h1 className="mt-3 text-[2rem] font-light leading-tight tracking-[-0.04em] text-[#20251d] sm:text-4xl">
            {requiresTotp ? "Verify your identity" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#70786a]">
            {requiresTotp
              ? "Enter the current six-digit code from your authenticator app."
              : "Sign in to your Tech Trailblazer Academy admin workspace."}
          </p>

          {requiresTotp ? (
            <form onSubmit={handleTotpVerification} className="mt-8 space-y-5">
              <label className="block text-xs font-medium text-[#485142]">
                Authenticator code
                <input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-2 h-12 w-full border border-[#dfe4da] bg-white px-4 text-center text-lg tracking-[0.4em] text-[#343a30] outline-none transition-colors placeholder:text-[#c3c9bd] focus:border-[#78984f] focus:ring-2 focus:ring-[#78984f]/15"
                />
              </label>
              {errorMessage && <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-800">{errorMessage}</p>}
              <button type="submit" disabled={isLoading || code.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 bg-[#547631] text-xs font-medium tracking-wide text-white transition-colors hover:bg-[#3f5c24] disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Verify and continue
                {!isLoading && <ArrowUpRight className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={() => { setRequiresTotp(false); setCode(""); setErrorMessage(null) }} className="w-full py-2 text-xs text-[#66705e] transition-colors hover:text-[#30362b]">
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="mt-8 space-y-5">
              <label className="block text-xs font-medium text-[#485142]">
                Admin email
                <input
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-12 w-full border border-[#dfe4da] bg-white px-4 text-sm text-[#343a30] outline-none transition-colors placeholder:text-[#a1a89a] focus:border-[#78984f] focus:ring-2 focus:ring-[#78984f]/15"
                />
              </label>
              <label className="block text-xs font-medium text-[#485142]">
                Password
                <span className="mt-2 flex h-12 border border-[#dfe4da] bg-white transition-colors focus-within:border-[#78984f] focus-within:ring-2 focus-within:ring-[#78984f]/15">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#343a30] outline-none placeholder:text-[#a1a89a]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="flex w-12 shrink-0 items-center justify-center text-[#77816f] transition-colors hover:text-[#40552d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#78984f]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
              {errorMessage && <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-800">{errorMessage}</p>}
              <button type="submit" disabled={isLoading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 bg-[#547631] text-xs font-medium tracking-wide text-white transition-colors hover:bg-[#3f5c24] disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Sign in securely
                {!isLoading && <ArrowUpRight className="h-3.5 w-3.5" />}
              </button>
            </form>
          )}

          <p className="mt-8 border-t border-[#edf0e9] pt-5 text-[11px] leading-5 text-[#858c7d]">
            Access is limited to accounts explicitly assigned an academy admin role.
          </p>
        </div>
      </section>
    </main>
  )
}