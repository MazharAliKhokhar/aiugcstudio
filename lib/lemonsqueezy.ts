import crypto from 'crypto'

/**
 * Validates the Lemon Squeezy webhook signature.
 * @param rawBody The raw request body as a string.
 * @param signature The X-Signature header value.
 * @param secret The webhook signing secret from environment variables.
 * @returns boolean
 */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret) {
    console.error('LS Webhook Error: Missing LEMON_SQUEEZY_WEBHOOK_SECRET')
    return false
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')

  if (digest.length !== signatureBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(digest, signatureBuffer)
}

/**
 * Mappings for Lemon Squeezy Variant IDs to Credit amounts.
 * You should update these with the actual variant IDs from your dashboard.
 */
export const VARIANT_CREDITS: Record<string, number> = {
  // Example mapping: 'variant_id': credit_amount
  // We will dynamicize this once we have the actual IDs
}

export interface LSWebhookBody {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      order_id: number
      customer_id: number
      identifier: string
      status: string
      user_name: string
      user_email: string
      currency: string
      total: number
      variant_id: number
      variant_name: string
      product_id: number
      product_name: string
      first_subscription_item?: {
         id: number
         subscription_id: number
      }
    }
  }
}
