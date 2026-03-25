import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!
    const signature = req.headers.get('X-Signature') || ''

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signatureBuffer = Buffer.from(signature, 'utf8')

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data // Assuming we pass user_id in checkout
    const variantId = payload.data.attributes.variant_id

    // Setup Supabase with service role to bypass RLS
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

    // Handlers
    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const userId = customData?.user_id
      if (!userId) {
        console.error('No user_id found in custom_data')
        return NextResponse.json({ success: true, message: 'Skipped - no user id' })
      }

      // Map variant/product to credit amount
      let creditsToAdd = 0
      
      // Determine credits by LS Variant ID or Price (hardcoded logic for MVP)
      // E.g., Basic=5 credits, Pro=20 credits
      const amountTotal = payload.data.attributes.total // in cents
      if (amountTotal >= 5000) creditsToAdd = 20
      else if (amountTotal >= 1000) creditsToAdd = 5
      else creditsToAdd = 1

      // Atomic increment would be better, but read-write for MVP:
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            credits: profile.credits + creditsToAdd,
            lemon_squeezy_customer_id: payload.data.attributes.customer_id.toString()
          })
          .eq('id', userId)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Lemon Squeezy Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
