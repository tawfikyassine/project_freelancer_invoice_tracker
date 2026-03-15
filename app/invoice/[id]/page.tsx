import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, STATUS_CONFIG, getDueDateLabel, type Invoice } from '@/lib/engine'
import { FileText, Printer, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Use the secure RPC function to fetch the specific invoice by ID bypassing RLS for listing
  const { data: invoices, error } = await supabase.rpc('get_invoice_by_id', {
    invoice_id: id
  })

  if (error || !invoices || invoices.length === 0) {
    notFound()
  }

  const invoice = invoices[0] as Invoice
  const cfg = STATUS_CONFIG[invoice.status]
  const dueDateInfo = invoice.due_date ? getDueDateLabel(invoice.due_date) : null

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-violet-500/30">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action bar for the client */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg.replace('bg-', 'bg-').replace('/10', '')} ${cfg.color.replace('text-', 'bg-')}`} />
            <span className="font-medium text-gray-700">
              Invoice is <span className="font-bold">{cfg.label}</span>
            </span>
          </div>
          <button
            title="Press Cmd+P or Ctrl+P to print or save as PDF"
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" /> Save PDF
          </button>
        </div>

        {/* The Invoice Document */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-600 to-indigo-600" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6 text-violet-600">
                <FileText className="w-8 h-8" />
                <span className="text-2xl font-black tracking-tight text-gray-900">INVOICE</span>
              </div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Billed To</p>
              <h2 className="text-xl font-bold text-gray-900">{invoice.client_name}</h2>
              {invoice.client_email && (
                <p className="text-gray-500">{invoice.client_email}</p>
              )}
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Invoice Number</p>
              <p className="font-mono font-medium text-gray-900 mb-6">#{invoice.invoice_number}</p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p className="text-gray-500">Issued On:</p>
                <p className="font-medium text-gray-900">{new Date(invoice.created_at).toLocaleDateString()}</p>
                
                {invoice.due_date && (
                  <>
                    <p className="text-gray-500">Due Date:</p>
                    <p className={`font-medium ${dueDateInfo?.urgent ? 'text-red-500' : 'text-gray-900'}`}>
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Line Items / Description */}
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {invoice.description || 'Services rendered'}
            </p>
          </div>

          {/* Total */}
          <div className="flex justify-end p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-12">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Amount Due</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {formatCurrency(invoice.amount, invoice.currency)}
              </p>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-12 border-l-4 border-violet-100 pl-4 py-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Additional Notes</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Footer badge */}
          <div className="pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-sm print:hidden">
            <ShieldCheck className="w-4 h-4" />
            <span>Securely powered by <span className="font-semibold text-gray-900">InvoiceFlow</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
