import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { verifyWebhookSignature, LSWebhookBody } from '@/lib/lemonsqueezy'

// Variant IDs mapping (update these with actual numeric IDs from LS dashboard)
const VARIANT_TO_CREDITS: Record<string | number, number> = {
  // Plan names as fallback
  'Starter': 4,
  'Growth Pro': 10,
  'Ad Scale': 30,
  // Numeric variant IDs (preferred)
  // '555123': 4, 
  // '555124': 10,
  // '555222': 30,
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = (await headers()).get('x-signature') || ''
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || ''

    // 1. Verify Signature
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.error('LS Webhook Error: Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: LSWebhookBody = JSON.parse(rawBody)
    const eventName = payload.meta.event_name
    const attributes = payload.data.attributes
    const userEmail = attributes.user_email
    const variantId = attributes.variant_id
    const variantName = attributes.variant_name

    console.log(`LS Webhook Received: ${eventName} for ${userEmail} (${variantName})`)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    // 2. Handle Events
    if (eventName === 'order_created' || eventName === 'subscription_payment_success') {
      const creditsToAdd = VARIANT_TO_CREDITS[variantId] || VARIANT_TO_CREDITS[variantName] || 0
      
      if (creditsToAdd > 0) {
        // Find user by email (most reliable in LS order_created)
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id, credits')
          .eq('email', userEmail)
          .single()

        if (profile) {
          // Add credits atomically via RPC
          await supabase.rpc('increment_credits', { 
            p_user_id: profile.id, 
            p_amount: creditsToAdd 
          })

          // Update LS IDs if this was an initial order
          await supabase
            .from('profiles')
            .update({
               lemon_squeezy_customer_id: String(attributes.customer_id),
               variant_id: String(variantId)
            })
            .eq('id', profile.id)

          console.log(`Added ${creditsToAdd} credits to ${userEmail}`)
        }
      }
    }

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const subscriptionId = payload.data.id
      const status = attributes.status
      
      await supabase
        .from('profiles')
        .update({
          subscription_id: subscriptionId,
          subscription_status: status,
          variant_id: String(variantId)
        })
        .eq('email', userEmail)
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      await supabase
        .from('profiles')
        .update({
          subscription_status: attributes.status
        })
        .eq('email', userEmail)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('LS Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
