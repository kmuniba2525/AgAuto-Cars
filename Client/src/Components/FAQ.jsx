import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Modern, minimal FAQ accordion — single item open at a time, no heavy
// card borders or shadows, just a quiet divider rhythm so it stays clean
// next to the rest of the Home page sections.
//
// Add matching keys to your en/pt (etc) translation JSON, e.g.:
//   "faq": {
//     "title": "Frequently Asked Questions",
//     "subtitle": "Everything you need to know before you order.",
//     "q1": "Which countries do you ship to?",
//     "a1": "We currently ship to Sweden, Norway, Finland, and Denmark...",
//     "q2": "...", "a2": "...",
//     "q3": "...", "a3": "...",
//     "q4": "...", "a4": "...",
//     "q5": "...", "a5": "..."
//   }

const FAQ_KEYS = ['1', '2', '3', '4', '5']

const FAQ = () => {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0) // first item open by default; use null to start all closed

  const items = FAQ_KEYS.map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }))

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i))

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-10">

      {/* Heading — same eyebrow + title pattern as BestSeller */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-primary"></span>

          <p className="uppercase text-xs tracking-[3px] font-semibold text-primary">
            FAQ
          </p>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          {t('faq.title')}
        </h2>

        <p className="text-sm sm:text-base text-gray-500 mt-2">{t('faq.subtitle')}</p>
      </div>

      <div className="max-w-3xl divide-y divide-gray-200 border-t border-b border-gray-200">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 text-left group"
              >
                <span
                  className={`text-sm sm:text-base lg:text-lg font-medium leading-snug transition-colors ${
                    isOpen ? 'text-blue-600' : 'text-blue-600 group-hover:text-blue-700'
                  }`}
                >
                  {item.question}
                </span>

                {/* Plus rotates into a cross — no separate icon set needed */}
                <span className="relative shrink-0 w-5 h-5">
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-lg sm:text-xl leading-none transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-accent' : 'text-gray-400'
                    }`}
                  >
                    +
                  </span>
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm sm:text-base text-gray-600 leading-6 sm:leading-7 pb-4 sm:pb-5 pr-4 sm:pr-8">{item.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FAQ
