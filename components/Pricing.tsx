'use client'

import { CheckCircle2, Zap, Crown } from 'lucide-react'

interface PricingProps {
  userId?: string
}

const starterFeatures = [
  'Up to 10 invoices/month',
  'Basic invoice templates',
  'PDF export',
  'Payment status tracking',
  'Email notifications',
]

const proFeatures = [
  'Unlimited invoices',
  'Premium invoice templates',
  'PDF + CSV export',
  'Advanced analytics',
  'Auto payment reminders',
  'Client portal',
  'Priority support',
]

export default function Pricing({ userId }: PricingProps) {
  const starterUrl = process.env.NEXT_PUBLIC_STRIPE_STARTER_LINK || '#'
  const proUrl = process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '#'

  function buildUrl(base: string) {
    if (userId) {
      return `${base}?client_reference_id=${userId}`
    }
    return base
  }

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-gray-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Starter Plan */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Starter</span>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">$9</span>
                <span className="text-gray-500 mb-2">/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Perfect for solo freelancers</p>
            </div>

            <a
              href={buildUrl(starterUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-semibold py-3 rounded-xl mb-8 transition-all duration-200"
            >
              Get Starter
            </a>

            <ul className="space-y-3">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl p-8 shadow-xl shadow-violet-500/10">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-5 h-5 text-violet-400" />
              <span className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Pro</span>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">$29</span>
                <span className="text-gray-400 mb-2">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">For serious freelancers &amp; agencies</p>
            </div>

            <a
              href={buildUrl(proUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl mb-8 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all duration-200"
            >
              Get Pro
            </a>

            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free tier note */}
        <p className="text-center text-sm text-gray-600 mt-8">
          ✦ Free plan includes 3 invoices/month — no credit card needed
        </p>
      </div>
    </section>
  )
}
