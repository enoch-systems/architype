import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { ProjectsSection } from "@/components/projects-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main id="top">
      <Navigation />
      <Hero />
      <ProjectsSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
