'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "How long does it take to get paid?",
    answer: "On average, InvoiceFlow users get paid 14 days faster than traditional invoicing. If your client pays via Apple Pay or credit card, the funds are usually available in your connected bank account within 2-3 business days."
  },
  {
    question: "Do I need a Stripe account?",
    answer: "Yes, InvoiceFlow connects directly to your Stripe account. This means you own your customer data and funds route directly to you. We don't hold your money."
  },
  {
    question: "Can I customize my invoices?",
    answer: "Absolutely. You can add your logo, brand colors, custom payment terms, and personalized notes to every invoice you send."
  },
  {
    question: "What happens if a client doesn't pay?",
    answer: "InvoiceFlow automatically sends gentle, professional follow-up emails based on a schedule you define (e.g., 3 days before due, on due date, 3 days late) so you never have to play the bad guy."
  },
  {
    question: "Is there a limit on how many invoices I can send?",
    answer: "The Starter plan includes up to 50 active invoices per month, which is plenty for most freelancers. The Pro plan offers unlimited invoicing and priority support."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need to know about getting paid faster.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`border border-white/10 rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === i ? 'bg-white/[0.05]' : 'bg-[#13131a] hover:bg-white/[0.02]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-violet-400 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
