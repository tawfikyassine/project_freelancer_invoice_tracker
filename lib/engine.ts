/**
 * Core business logic for InvoiceFlow — freelancer invoice tracker.
 * Handles invoice number generation, status calculations, and financial summaries.
 */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  user_id: string
  client_name: string
  client_email?: string
  invoice_number: string
  amount: number
  currency: string
  status: InvoiceStatus
  due_date?: string
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceSummary {
  total: number
  paid: number
  pending: number
  overdue: number
  paidCount: number
  sentCount: number
  overdueCount: number
  draftCount: number
}

/**
 * Generates a unique invoice number in the format INV-YYYYMM-XXXX
 */
export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthInvoices = existingInvoices.filter((inv) =>
    inv.invoice_number.includes(`INV-${yearMonth}`)
  )
  const seq = String(monthInvoices.length + 1).padStart(4, '0')
  return `INV-${yearMonth}-${seq}`
}

/**
 * Computes whether an invoice is overdue given its due_date and status.
 */
export function computeStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === 'paid' || invoice.status === 'draft') {
    return invoice.status
  }
  if (invoice.due_date) {
    const due = new Date(invoice.due_date)
    if (due < new Date()) return 'overdue'
  }
  return invoice.status
}

/**
 * Calculates financial summary across all invoices.
 */
export function calculateSummary(invoices: Invoice[]): InvoiceSummary {
  const summary: InvoiceSummary = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    paidCount: 0,
    sentCount: 0,
    overdueCount: 0,
    draftCount: 0,
  }

  for (const inv of invoices) {
    const status = computeStatus(inv)
    summary.total += inv.amount

    if (status === 'paid') {
      summary.paid += inv.amount
      summary.paidCount++
    } else if (status === 'overdue') {
      summary.overdue += inv.amount
      summary.overdueCount++
    } else if (status === 'sent') {
      summary.pending += inv.amount
      summary.sentCount++
    } else if (status === 'draft') {
      summary.draftCount++
    }
  }

  return summary
}

/**
 * Formats a currency amount for display.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Returns a human-readable relative date (e.g. "Due in 3 days", "Overdue by 5 days").
 */
export function getDueDateLabel(dueDate: string): { label: string; urgent: boolean } {
  const due = new Date(dueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, urgent: true }
  } else if (diffDays === 0) {
    return { label: 'Due today', urgent: true }
  } else if (diffDays <= 7) {
    return { label: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, urgent: true }
  } else {
    return { label: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, urgent: false }
  }
}

export const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-800' },
  sent: { label: 'Sent', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  paid: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-900/30' },
}
