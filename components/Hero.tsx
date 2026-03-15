import { ArrowRight, CheckCircle2, Zap, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { label: 'Freelancers Paid', value: '12,400+' },
  { label: 'Invoices Sent', value: '$4.2M' },
  { label: 'Avg. Payment Time', value: '3 days' },
]

const features = [
  { icon: Zap, title: 'Instant Invoices', desc: 'Create professional invoices in under 60 seconds.' },
  { icon: Shield, title: 'Auto Reminders', desc: 'Automatic follow-ups so you never chase a payment again.' },
  { icon: TrendingUp, title: 'Revenue Insights', desc: 'See what you\'ve earned, what\'s pending, and what\'s overdue.' },
]

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Invoice tracking for independent professionals
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
          Stop chasing
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            payments.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          InvoiceFlow lets freelancers create beautiful invoices, track payment status in real-time,
          and get paid faster — all in one clean dashboard.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all duration-200 group"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#pricing"
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors py-4 px-6"
          >
            View pricing →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-violet-500/20 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mt-12 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No credit card required · Free plan available · Cancel anytime</span>
        </div>
      </div>
    </section>
  )
}
