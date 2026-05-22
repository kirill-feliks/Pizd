import { createHmac } from 'crypto'

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.WA_APP_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return `sha256=${expected}` === signature
}
