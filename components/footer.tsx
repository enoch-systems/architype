"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpLeft, ArrowUpRight } from "lucide-react"

const footerLinks = [
  { label: "Return to Home", href: "/#top" },
  { label: "Courses", href: "#courses" },
  { label: "FAQ", href: "#faq" },
  { label: "Apply", href: "#apply" },
]

export function Footer() {
  const [socialNotice, setSocialNotice] = useState<string | null>(null)
  const [isFooterBottomVisible, setIsFooterBottomVisible] = useState(false)
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const footerBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
  }, [])

  useEffect(() => {
    const footerBottom = footerBottomRef.current
    if (!footerBottom) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterBottomVisible(entry.isIntersecting)
    }, { threshold: 0.1 })

    observer.observe(footerBottom)
    return () => observer.disconnect()
  }, [])

  const showComingSoon = (platform: string) => {
    setSocialNotice(`${platform} link coming soon.`)
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = setTimeout(() => setSocialNotice(null), 2800)
  }

  return (
    <footer className="border-t border-border px-6 py-14 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 gap-10 border-b border-border pb-10 md:grid-cols-12 md:items-center md:gap-8 md:pb-12">
        <div className="md:col-span-5">
          <Link href="/" className="flex w-fit items-center gap-3">
            <img
              src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
              alt="Tech Trailblazer Academy"
              className="h-16 w-16 object-contain"
            />
            <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-lime-700">
              Tech Trailblazer Academy
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-[1.75] text-muted-foreground">
            Empowering the next generation of tech professionals with industry-leading education.
          </p>
        </div>

        <div className="md:col-span-3 md:col-start-6">
          <p className="mb-4 text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
            Quick Links
          </p>
          <div className="flex max-w-xs flex-col border-t border-border/70">
            {footerLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center justify-between gap-4 border-b border-border/70 py-3 text-sm text-foreground/70 transition-colors duration-300 hover:text-lime-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-lime-700/50"
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 text-[9px] tracking-[0.12em] text-lime-700/70 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {link.label === "Return to Home" && <ArrowUpLeft aria-hidden="true" className="h-3.5 w-3.5" />}
                  {link.label}
                </span>
                {link.label !== "Return to Home" && (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 md:col-start-10">
          <p className="mb-4 text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
            Connect
          </p>
          <div className="flex items-center gap-2">
            {[
              { name: "TikTok", icon: "tiktok" },
              { name: "Facebook", icon: "facebook" },
              { name: "Instagram", icon: "instagram" },
            ].map((social) => (
              <button
                key={social.name}
                type="button"
                aria-label={`${social.name} link coming soon`}
                onClick={() => showComingSoon(social.name)}
                className="flex h-10 w-10 items-center justify-center border border-border text-foreground/70 transition-colors hover:border-lime-700 hover:bg-lime-50 hover:text-lime-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-700/40"
              >
                <img
                  src={`https://cdn.simpleicons.org/${social.icon}/65A30D`}
                  alt=""
                  className="h-4 w-4"
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Social links coming soon</p>
        </div>
      </div>

      <div ref={footerBottomRef} className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] tracking-[0.08em] text-muted-foreground/50">
          {"© 2026 Tech Trailblazer Academy. All rights reserved."}
        </p>
        <p className="text-[10px] tracking-[0.08em] text-muted-foreground/50">
          Paid programs · Career-focused skills
        </p>
      </div>

      {socialNotice && (
        <p
          role="status"
          className="fixed bottom-24 right-6 z-[60] border border-border bg-background px-4 py-3 text-sm text-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {socialNotice}
        </p>
      )}

      <a
        href="https://chat.whatsapp.com/CQwV51o9q4ZHp9kRXDM9qQ?s=cl&p=i&mlu=0"
        target="_blank"
        rel="noreferrer"
        aria-label="Open WhatsApp live support"
        style={{ bottom: isFooterBottomVisible ? "104px" : "24px" }}
        className="fixed right-6 z-50 inline-flex items-center gap-3 bg-emerald-600 px-4 py-3 text-sm text-white shadow-lg transition-[bottom,background-color] duration-300 ease-out hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <img
          src="https://cdn.simpleicons.org/whatsapp/FFFFFF"
          alt=""
          className="h-5 w-5"
        />
        <span>Live support</span>
      </a>
    </footer>
  )
}
