"use client"

import { useEffect, useState } from "react"

const academyName = "Tech Trailblazer Academy"

export function BrandLoader() {
  const [typedName, setTypedName] = useState("")
  const [phase, setPhase] = useState<"start" | "intro" | "typing" | "exit">("start")
  const [isLeaving, setIsLeaving] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)

    let characterIndex = 0
    let typingTimer: ReturnType<typeof setInterval> | undefined
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let removeTimer: ReturnType<typeof setTimeout> | undefined
    const introFrame = requestAnimationFrame(() => setPhase("intro"))

    const typingStartTimer = setTimeout(() => {
      setPhase("typing")
      typingTimer = setInterval(() => {
        characterIndex += 1
        setTypedName(academyName.slice(0, characterIndex))

        if (characterIndex >= academyName.length) {
          if (typingTimer) clearInterval(typingTimer)
          exitTimer = setTimeout(() => {
            setPhase("exit")
            setIsLeaving(true)
          }, 450)
          removeTimer = setTimeout(() => setIsVisible(false), 1250)
        }
      }, 55)
    }, 900)

    return () => {
      cancelAnimationFrame(introFrame)
      clearTimeout(typingStartTimer)
      if (typingTimer) clearInterval(typingTimer)
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      role="status"
      aria-label="Loading Tech Trailblazer Academy"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${
        isLeaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="sr-only">Loading Tech Trailblazer Academy</span>
      <div
        aria-hidden="true"
        className={`flex flex-col items-center px-6 text-center transition-[transform,opacity] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === "intro" || phase === "typing"
            ? "scale-100 opacity-100"
            : "scale-[2.4] opacity-0"
        }`}
      >
        <img
          src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461502/ajb8rbgqtk4vveshiriw.jpg"
          alt=""
          className="mb-7 h-24 w-24 object-contain"
        />
        <p className="mb-3 text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
          Tech Skills Acquisition Bootcamp
        </p>
        <p className="min-h-7 text-lg font-medium tracking-[0.08em] text-lime-700 sm:text-xl">
          {typedName}
          {phase === "typing" && (
            <span className="ml-1 inline-block h-4 w-px animate-pulse bg-foreground align-middle" />
          )}
        </p>
      </div>
    </div>
  )
}