import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, LSWebhookBody } from '@/lib/lemonsqueezy'
import { headers } from 'next/headers'

// Variant IDs mapping (update these with actual numeric IDs from LS dashboard)
const VARIANT_TO_CREDITS: Record<string | number, number> = {
  // Plan names as fallback
  'Starter': 20,
  'Pro': 100,
  'Scale': 300,
  // Numeric variant IDs (preferred)
  // '555123': 4, 
  // '555124': 10,
  // '555222': 30,
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = (await headers()).get('x-signature') || ''
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
    
    if (!secret) {
      console.error('[Webhook/LS] Missing LEMON_SQUEEZY_WEBHOOK_SECRET')
      return new NextResponse('Internal configuration error', { status: 500 })
    }

    // 1. Verify Signature with timing-safe comparison
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.warn('[Webhook/LS] Invalid signature from:', req.headers.get('x-forwarded-for'))
      return new NextResponse('Invalid signature', { status:401 })
    }

    let payload: LSWebhookBody
    try {
      payload = JSON.parse(rawBody)
    } catch (e) {
      return new NextResponse('Malformed JSON', { status: 400 })
    }

    const eventName = payload.meta.event_name
    const attributes = payload.data.attributes
    const userEmail = attributes.user_email
    const variantId = String(attributes.variant_id)
    const variantName = attributes.variant_name

    // Service Role Client for administrative actions
    const supabase = await createClient() // createClient should use service role in webhooks

    console.log(`[Webhook/LS] Processing ${eventName} for ${userEmail}`)

    // 2. Handle Events
    if (eventName === 'order_created' || eventName === 'subscription_payment_success') {
      const creditsToAdd = VARIANT_TO_CREDITS[variantId] || VARIANT_TO_CREDITS[variantName] || 0
      
      if (creditsToAdd > 0) {
        // Find user by email
        const { data: profile, error: findError } = await (supabase
          .from('profiles') as any)
          .select('id')
          .eq('email', userEmail)
          .single()

        if (profile) {
          // Atomically increment credits
          const { error: rpcError } = await (supabase as any).rpc('increment_credits', { 
            p_user_id: profile.id, 
            p_amount: creditsToAdd 
          })

          if (rpcError) throw new Error(`Atomic credit update failed: ${rpcError.message}`)

          // Update LS identifiers
          await (supabase.from('profiles') as any)
            .update({
               lemon_squeezy_customer_id: String(attributes.customer_id),
               variant_id: variantId
            })
            .eq('id', profile.id)

          console.log(`[Webhook/LS] Successfully added ${creditsToAdd} credits to ${userEmail}`)
        } else {
          console.error(`[Webhook/LS] User profile not found for email: ${userEmail}`)
        }
      }
    }

    // Update subscription status and variant
    if (['subscription_created', 'subscription_updated', 'subscription_cancelled', 'subscription_expired'].includes(eventName)) {
      const status = attributes.status
      await (supabase.from('profiles') as any)
        .update({
          subscription_id: String(payload.data.id),
          subscription_status: status,
          variant_id: variantId
        })
        .eq('email', userEmail)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    // Log detailed error but return generic response to third parties
    console.error('[Webhook/LS] Execution Error:', error.message)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
