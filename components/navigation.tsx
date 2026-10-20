"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpLeft, ArrowUpRight, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Return to Home", href: "/#top" },
  { label: "Courses", href: "#courses" },
  { label: "FAQ", href: "#faq" },
  { label: "Apply", href: "#apply" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 60)
      setHidden(currentY > lastScrollY && currentY > 400)
      setLastScrollY(currentY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        disabled={!isOpen}
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ease-in-out md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          hidden && !isOpen ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"}`}
      >
        <nav className="flex items-center justify-between px-6 py-3 sm:py-5 md:px-12 lg:px-20">
        <Link
          href="/"
          aria-label="Tech Trailblazer Academy home"
          className={`flex min-w-0 items-center gap-3 text-[10px] font-medium tracking-[0.16em] uppercase transition-colors duration-500 sm:text-xs ${
            scrolled ? "text-foreground" : "text-background"
          }`}
        >
          <img
            src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
            alt=""
            className="h-20 w-20 shrink-0 object-contain sm:h-16 sm:w-16"
          />
          <span className={`max-w-[10rem] leading-tight sm:max-w-none ${scrolled ? "text-lime-700" : "text-lime-300"}`}>
            Tech Trailblazer Academy
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[11px] tracking-[0.15em] uppercase transition-colors duration-500 hover:opacity-100 ${
                scrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-background/60 hover:text-background"
              }`}
            >
              {link.label === "Return to Home" && <ArrowUpLeft aria-hidden="true" className="mr-1 inline h-3 w-3" />}
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden transition-colors duration-500 ${
            scrolled || isOpen ? "text-foreground" : "text-background"
          }`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      </header>

      <div
        id="mobile-menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false)
        }}
        className={`fixed inset-0 z-[45] flex items-center justify-center px-6 transition-opacity duration-500 ease-in-out md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className={`max-h-[calc(100dvh-3rem)] w-full max-w-sm overflow-y-auto border border-border/70 bg-background/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-7 ${
            isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.92] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/djdbcoyot/image/upload/v1792461169/ts7byne6svvjsif1pfua.png"
                alt=""
                className="h-24 w-24 object-contain sm:h-20 sm:w-20"
              />
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-lime-700 sm:text-[10px]">
                  Tech Trailblazer
                </p>
                <p className="mt-1 text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
                  Academy · Navigation
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center border border-border/70 text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col py-3">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between border-b border-border/70 px-2 py-4 text-lg font-light tracking-tight text-foreground transition-colors duration-300 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:text-xl"
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.15em] text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {link.label === "Return to Home" && <ArrowUpLeft aria-hidden="true" className="h-4 w-4" />}
                  {link.label}
                </span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted-foreground/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
