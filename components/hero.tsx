"use client"

import { useEffect, useRef, useState } from "react"

const heroSlides = [
  "https://res.cloudinary.com/djdbcoyot/image/upload/v1792448813/pxqifrfez5a7wcyw5nb3.jpg",
  "https://res.cloudinary.com/djdbcoyot/image/upload/v1792448812/xvtxahpupak7rhv6g2jp.jpg",
]

export function Hero() {
  const [visible, setVisible] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" ref={ref} className="relative h-screen flex flex-col justify-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroSlides.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Architectural hero background"
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[2500ms] ease-in-out md:hidden ${
              visible && index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
            }`}
          />
        ))}

        <div
          className={`absolute inset-0 hidden overflow-hidden transition-opacity duration-1000 md:block ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="hero-image-track flex h-full w-[200%]">
            {[...heroSlides, ...heroSlides, ...heroSlides].map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt="Architectural project"
              className="h-full w-1/6 flex-none object-cover"
            />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-foreground/65 via-foreground/35 to-foreground/20" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-16 md:px-12 lg:px-20 md:pb-20">
        <div className="max-w-5xl">
          <div
            className={`overflow-hidden mb-6 transition-all duration-1000 delay-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-background/50">
              Paid tech programs · Career-ready training
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-[clamp(2.25rem,6vw,5.5rem)] font-extralight leading-[1.05] tracking-[-0.03em] text-background text-balance">
              Your future
              <br className="hidden md:block" />
              in tech <span className="text-lime-300">starts</span> here
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-[1.75] text-background/65 md:text-base">
              Build practical skills through focused training in technology and digital careers.
            </p>
          </div>
        </div>

        <div
          className={`mt-16 md:mt-20 flex items-center gap-6 transition-all duration-1000 delay-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-12 h-px bg-background/30" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-background/40">
            Explore the courses
          </span>
        </div>
      </div>
    </section>
  )
}
