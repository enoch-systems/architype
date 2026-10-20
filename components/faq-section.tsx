"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const questions = [
  {
    question: "Are your courses self paced or live?",
    answer: "Our courses are live.",
  },
  {
    question: "Can I access the courses on my mobile device?",
    answer: "Yes, you can access the courses on your mobile device.",
  },
  {
    question: "Do you provide certification upon course completion?",
    answer: "Yes, certificates are provided upon course completion.",
  },
  {
    question: "Are there refund requests?",
    answer: "No, we do not offer refunds.",
  },
  {
    question: "What types of courses do you offer?",
    answer: "We offer tech skills designed for real-time job opportunities.",
  },
  {
    question: "Can I pay by installment?",
    answer: "No, installment payments are not available.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="mb-4 text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
            Student Support
          </p>
          <h2 className="text-3xl font-extralight leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-[2.75rem]">
            FREQUENTLY ASKED
            <br />
            QUESTIONS
          </h2>
          <p className="mt-5 text-sm leading-[1.75] text-muted-foreground">
            Everything you need to know
          </p>
        </div>

        <div className="border-t border-border">
          {questions.map(({ question, answer }, index) => {
            const isOpen = openIndex === index
            const answerId = `faq-answer-${index}`

            return (
              <div key={question} className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-base font-light text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/40 md:text-lg"
                >
                  {question}
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  id={answerId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden bg-muted/70 px-4 pt-4">
                    <p className="max-w-xl pb-5 pr-10 text-sm leading-[1.75] text-muted-foreground">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-20 flex flex-col justify-between gap-6 border-t border-border pt-7 md:flex-row md:items-center">
        <p className="max-w-xl text-sm leading-[1.75] text-muted-foreground">
          Want to connect with other learners and get updates? Join our WhatsApp group below.
        </p>
        <a
          href="https://chat.whatsapp.com/CQwV51o9q4ZHp9kRXDM9qQ?s=cl&p=i&mlu=0"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center border border-foreground/25 px-5 py-3 text-[11px] tracking-[0.18em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Join our WhatsApp Group
        </a>
      </div>
    </section>
  )
}