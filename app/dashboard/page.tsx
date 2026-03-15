'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign,
  LogOut,
} from 'lucide-react'
import {
  type Invoice,
  type InvoiceStatus,
  calculateSummary,
  formatCurrency,
  generateInvoiceNumber,
  STATUS_CONFIG,
  getDueDateLabel,
} from '@/lib/engine'
import { User } from '@supabase/supabase-js'

type ModalMode = 'create' | 'edit' | null

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // Form state
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    amount: '',
    currency: 'USD',
    status: 'draft' as InvoiceStatus,
    due_date: '',
    description: '',
    notes: '',
    payment_link: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUser(user)

      // Ensure user row exists — handles users who signed up before the DB trigger was installed
      await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email, plan: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

      // Fetch the current plan (may already be 'pro' if they upgraded)
      const { data: profile } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) setUserPlan(profile.plan)

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (invoicesData) setInvoices(invoicesData as Invoice[])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const summary = calculateSummary(invoices)

  const openCreateModal = () => {
    setForm({
      client_name: '',
      client_email: '',
      amount: '',
      currency: 'USD',
      status: 'draft',
      due_date: '',
      description: '',
      notes: '',
      payment_link: '',
    })
    setEditingInvoice(null)
    setModalMode('create')
  }

  const openEditModal = (inv: Invoice) => {
    setForm({
      client_name: inv.client_name,
      client_email: inv.client_email || '',
      amount: String(inv.amount),
      currency: inv.currency,
      status: inv.status,
      due_date: inv.due_date || '',
      description: inv.description || '',
      notes: inv.notes || '',
      payment_link: inv.payment_link || '',
    })
    setEditingInvoice(inv)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingInvoice(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (modalMode === 'create') {
      // Enforce subscription limits
      const isFree = userPlan === 'free'
      const isStarter = userPlan === 'starter'
      const isPro = userPlan === 'pro'
      
      const MAX_FREE = 3;
      const MAX_STARTER = 50;

      if (isFree && invoices.length >= MAX_FREE) {
        alert('You have reached the limit of 3 invoices on the Free plan. Please upgrade to create more.')
        return
      }

      if (isStarter && invoices.length >= MAX_STARTER) {
        alert('You have reached the limit of 50 invoices on the Starter plan. Please upgrade to Pro to create more.')
        return
      }

      const invoiceNumber = generateInvoiceNumber(invoices)
      const { data, error } = await supabase.from('invoices').insert({
        user_id: user.id,
        invoice_number: invoiceNumber,
        client_name: form.client_name,
        client_email: form.client_email || null,
        amount: parseFloat(form.amount),
        currency: form.currency,
        status: form.status,
        due_date: form.due_date || null,
        description: form.description || null,
        notes: form.notes || null,
        payment_link: form.payment_link || null,
      }).select().single()

      if (!error && data) {
        setInvoices((prev) => [data as Invoice, ...prev])
      }
    } else if (modalMode === 'edit' && editingInvoice) {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          client_name: form.client_name,
          client_email: form.client_email || null,
          amount: parseFloat(form.amount),
          currency: form.currency,
          status: form.status,
          due_date: form.due_date || null,
          description: form.description || null,
          notes: form.notes || null,
          payment_link: form.payment_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingInvoice.id)
        .select()
        .single()

      if (!error && data) {
        setInvoices((prev) => prev.map((inv) => (inv.id === editingInvoice.id ? (data as Invoice) : inv)))
      }
    }

    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return
    await supabase.from('invoices').delete().eq('id', id)
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  const isFree = userPlan === 'free'
  const isStarter = userPlan === 'starter'
  const isPro = userPlan === 'pro'
  
  const MAX_FREE = 3;
  const MAX_STARTER = 50;

  const atLimit = (isFree && invoices.length >= MAX_FREE) || (isStarter && invoices.length >= MAX_STARTER)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">InvoiceFlow</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            {userPlan === 'pro' && (
              <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full ml-2">
                PRO
              </span>
            )}
            {userPlan === 'starter' && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full ml-2">
                STARTER
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={atLimit ? undefined : openCreateModal}
              disabled={atLimit}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm ${
                atLimit 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
              }`}
            >
              <Plus className="w-4 h-4" /> {atLimit ? 'Limit Reached' : 'New Invoice'}
            </button>
            <form action="/dashboard/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Upgrade Banner for Limits */}
        {atLimit && !isPro && (
          <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-bold text-red-900 text-base">You've reached your plan limit</p>
                <p className="text-red-700 text-sm">
                  {isFree ? 'Free users can create up to 3 invoices.' : 'Starter users can create up to 50 invoices.'} 
                  {' '}Upgrade your plan to create more.
                </p>
              </div>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_STRIPE_PRO_LINK}?client_reference_id=${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              Upgrade Now
            </a>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={DollarSign}
            label="Total Earned"
            value={formatCurrency(summary.paid)}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
          />
          <SummaryCard
            icon={Clock}
            label="Pending"
            value={formatCurrency(summary.pending)}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
          />
          <SummaryCard
            icon={AlertCircle}
            label="Overdue"
            value={formatCurrency(summary.overdue)}
            iconColor="text-red-500"
            iconBg="bg-red-50"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Total Revenue"
            value={formatCurrency(summary.total)}
            iconColor="text-violet-500"
            iconBg="bg-violet-50"
          />
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Invoices</h2>
            <span className="text-sm text-gray-400">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-violet-400" />
              </div>
              <p className="font-semibold text-gray-900 mb-2">No invoices yet</p>
              <p className="text-sm text-gray-400 mb-6">Create your first invoice and get paid faster.</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Invoice #</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Client</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Amount</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Status</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Due Date</th>
                    <th className="text-right text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const cfg = STATUS_CONFIG[inv.status]
                    const dueDateInfo = inv.due_date ? getDueDateLabel(inv.due_date) : null
                    return (
                      <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600 font-semibold">{inv.invoice_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 text-sm">{inv.client_name}</p>
                          {inv.client_email && <p className="text-xs text-gray-400">{inv.client_email}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{formatCurrency(inv.amount, inv.currency)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {dueDateInfo ? (
                            <span className={`text-sm ${dueDateInfo.urgent ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              {dueDateInfo.label}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                const btn = e.currentTarget
                                const originalText = btn.innerText
                                navigator.clipboard.writeText(`${window.location.origin}/invoice/${inv.id}`)
                                btn.innerText = 'Copied!'
                                btn.classList.add('text-emerald-600', 'bg-emerald-50')
                                setTimeout(() => {
                                  btn.innerText = 'Copy Link'
                                  btn.classList.remove('text-emerald-600', 'bg-emerald-50')
                                }, 2000)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => {
                                if (isFree) {
                                  alert('Emailing invoices is a Starter & Pro feature. Please upgrade your plan.')
                                  return
                                }
                                const url = `${window.location.origin}/invoice/${inv.id}`
                                const subject = encodeURIComponent(`Invoice ${inv.invoice_number} from InvoiceFlow`)
                                const body = encodeURIComponent(`Hi ${inv.client_name || 'there'},\n\nHere is your invoice for ${formatCurrency(inv.amount, inv.currency)}.\n\nYou can view and pay it securely online here: ${url}\n\nThank you for your business!`)
                                window.location.href = `mailto:${inv.client_email || ''}?subject=${subject}&body=${body}`
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                            >
                              Send Email
                            </button>
                            <button
                              onClick={() => openEditModal(inv)}
                              className="text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upgrade banner for free users */}
        {userPlan === 'free' && (
          <div className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white text-lg">Upgrade to Pro</p>
              <p className="text-violet-200 text-sm">Unlimited invoices, reminders, analytics & more.</p>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_STRIPE_PRO_LINK}?client_reference_id=${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-white text-violet-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors shadow-lg"
            >
              Upgrade for $29/mo →
            </a>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Create Invoice' : 'Edit Invoice'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Client Name *</label>
                  <input
                    required
                    value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                    placeholder="Acme Corp"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Client Email</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
                    placeholder="client@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Amount *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="1,500.00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InvoiceStatus }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Stripe Payment Link URL
                    </label>
                    {!isPro && (
                      <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                        Pro Feature
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    disabled={!isPro}
                    value={form.payment_link}
                    onChange={(e) => setForm((f) => ({ ...f, payment_link: e.target.value }))}
                    placeholder={isPro ? "https://buy.stripe.com/..." : "Upgrade to Pro to accept online payments"}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Services rendered..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm"
                >
                  {modalMode === 'create' ? 'Create Invoice' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType
  label: string
  value: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  )
}
