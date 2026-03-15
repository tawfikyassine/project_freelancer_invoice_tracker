import { CheckCircle2, Send, CreditCard, PieChart } from 'lucide-react'

const steps = [
  {
    icon: CheckCircle2,
    title: '1. Create your invoice',
    description: 'Add your client details, line items, and terms in a clean, intuitive editor. No accounting degree required.'
  },
  {
    icon: Send,
    title: '2. Send professional links',
    description: 'Stop sending PDF attachments. Send a secure, mobile-friendly payment link that looks amazing on any device.'
  },
  {
    icon: CreditCard,
    title: '3. Get paid instantly',
    description: 'Clients pay via Apple Pay, Google Pay, or credit card. Funds route directly to your connected bank account.'
  },
  {
    icon: PieChart,
    title: '4. Track automatically',
    description: 'Your dashboard automatically updates when paid. Overdue? We send the polite follow-up email for you.'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-white/[0.02] border-y border-white/[0.05]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            From draft to paid in minutes
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Traditional invoicing software is bloated and confusing. We built a streamlined workflow specifically for independent creative professionals, developers, and consultants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-violet-500/20 to-transparent" />
              )}
              
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 relative z-10">
                <step.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
