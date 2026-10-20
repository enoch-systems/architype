"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, LoaderCircle, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const allowedRoles = new Set(["owner", "admin", "viewer"])

export default function AcademyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f3] px-4 py-10 text-[#20251d]">
      <section className="w-full max-w-md border border-[#e2e6dd] bg-white p-6 shadow-sm sm:p-9">
        <a href="/" aria-label="Tech Trailblazer Academy home" className="flex w-fit items-center gap-3">
          <img
            src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
            alt=""
            className="h-12 w-12 object-contain"
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-lime-700">
            Tech Trailblazer Academy
          </span>
        </a>

        <div className="mt-10 flex h-10 w-10 items-center justify-center border border-[#e5e9e1] bg-[#f8faf5] text-[#59783a]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#7f8874]">Secure workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {requiresTotp ? "Verify your identity" : "Admin sign in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#737b6d]">
          {requiresTotp
            ? "Enter the current six-digit code from your authenticator app."
            : "Sign in with your authorized Tech Trailblazer Academy account."}
        </p>

        {requiresTotp ? (
          <form onSubmit={handleTotpVerification} className="mt-8 space-y-5">
            <label className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">
              Authenticator code
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-2 h-12 w-full border border-[#e2e6dd] bg-white px-3 text-center text-lg tracking-[0.35em] text-[#343a30] outline-none focus:border-[#78984f]"
              />
            </label>
            {errorMessage && <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-800">{errorMessage}</p>}
            <button type="submit" disabled={isLoading || code.length !== 6} className="flex h-11 w-full items-center justify-center gap-2 bg-[#547631] text-xs font-medium text-white transition-colors hover:bg-[#3f5c24] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Verify and continue
              {!isLoading && <ArrowUpRight className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => { setRequiresTotp(false); setCode(""); setErrorMessage(null) }} className="w-full py-2 text-xs text-[#66705e] hover:text-[#30362b]">
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="mt-8 space-y-5">
            <label className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">
              Admin email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full border border-[#e2e6dd] bg-white px-3 text-sm normal-case tracking-normal text-[#343a30] outline-none focus:border-[#78984f]"
              />
            </label>
            <label className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#777f70]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full border border-[#e2e6dd] bg-white px-3 text-sm normal-case tracking-normal text-[#343a30] outline-none focus:border-[#78984f]"
              />
            </label>
            {errorMessage && <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-800">{errorMessage}</p>}
            <button type="submit" disabled={isLoading} className="flex h-11 w-full items-center justify-center gap-2 bg-[#547631] text-xs font-medium text-white transition-colors hover:bg-[#3f5c24] disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Continue securely
              {!isLoading && <ArrowUpRight className="h-3.5 w-3.5" />}
            </button>
          </form>
        )}

        <p className="mt-8 border-t border-[#edf0e9] pt-5 text-[11px] leading-5 text-[#8a9084]">
          Access is limited to accounts explicitly assigned an academy admin role.
        </p>
      </section>
    </main>
  )
}