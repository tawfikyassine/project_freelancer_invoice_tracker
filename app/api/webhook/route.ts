import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { client_reference_id: string; customer: string }
    const userId = session.client_reference_id
    const customerId = session.customer

    if (userId) {
      const { error } = await supabase
        .from('users')
        .update({ plan: 'pro', stripe_customer_id: customerId })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user plan:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
