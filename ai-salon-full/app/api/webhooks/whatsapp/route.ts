import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/whatsapp/verify'
import { parseIntent } from '@/lib/ai/parse-intent'
import { handleBookingIntent } from '@/lib/booking/handler'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { isSubscriptionActive } from '@/lib/utils'
import { templates } from '@/lib/whatsapp/templates'

export const dynamic = 'force-dynamic'

type RelationName = { name: string } | { name: string }[] | null

function getRelationName(relation: RelationName) {
  return Array.isArray(relation) ? relation[0]?.name : relation?.name
}

// Webhook verification (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// Incoming messages (POST)
export async function POST(req: Request) {
  const rawBody = await req.text()

  // Verify signature
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[WA Webhook] Invalid signature')
    return new Response('Invalid signature', { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // Extract message
  const entry = (body.entry as unknown[])?.[0] as Record<string, unknown>
  const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown>
  const value = changes?.value as Record<string, unknown>
  const messages = value?.messages as unknown[]
  const message = messages?.[0] as Record<string, unknown>

  // Ignore status updates
  if (!message) {
    return new Response('OK', { status: 200 })
  }

  const waPhoneNumberId = (value?.metadata as Record<string, string>)?.phone_number_id
  const fromPhone = message.from as string
  const messageText = (message.text as Record<string, string>)?.body ?? ''
  const waMessageId = message.id as string

  if (!messageText || !fromPhone) {
    return new Response('OK', { status: 200 })
  }

  const supabase = createAdminClient()

  // Dedup — ignore already processed message
  const { data: existing } = await supabase
    .from('wa_messages')
    .select('id')
    .eq('wa_message_id', waMessageId)
    .maybeSingle()

  if (existing) return new Response('OK', { status: 200 })

  // Find tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('wa_phone_number_id', waPhoneNumberId)
    .maybeSingle()

  if (!tenant) {
    console.warn('[WA Webhook] Unknown phone number ID:', waPhoneNumberId)
    return new Response('OK', { status: 200 })
  }

  // Check subscription
  if (!isSubscriptionActive(tenant)) {
    await sendWhatsAppMessage(tenant, fromPhone, templates.subscriptionExpired())
    return new Response('OK', { status: 200 })
  }

  // Upsert client
  const { data: client } = await supabase
    .from('clients')
    .upsert({ tenant_id: tenant.id, wa_phone: fromPhone }, {
      onConflict: 'tenant_id,wa_phone',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (!client) return new Response('OK', { status: 200 })

  // Get context for AI
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('id, starts_at, services(name), masters(name)')
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(3)

  const { data: availableServices } = await supabase
    .from('services')
    .select('name')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  const { data: availableMasters } = await supabase
    .from('masters')
    .select('name')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  // Parse intent with AI
  const parsed = await parseIntent(messageText, {
    upcomingBookings: (upcomingBookings ?? []).map(b => ({
      id: b.id,
      service: getRelationName(b.services) ?? '',
      master: getRelationName(b.masters) ?? '',
      starts_at: b.starts_at,
    })),
    availableServices: availableServices?.map(s => s.name) ?? [],
    availableMasters: availableMasters?.map(m => m.name) ?? [],
    clientName: client.name,
  })

  // Log inbound
  await supabase.from('wa_messages').insert({
    tenant_id: tenant.id,
    client_id: client.id,
    wa_message_id: waMessageId,
    direction: 'inbound',
    body: messageText,
    parsed_intent: parsed,
  })

  // Handle intent
  const response = await handleBookingIntent(supabase, tenant, client, parsed)

  // Send response
  await sendWhatsAppMessage(tenant, fromPhone, response)

  // Log outbound
  await supabase.from('wa_messages').insert({
    tenant_id: tenant.id,
    client_id: client.id,
    direction: 'outbound',
    body: response,
  })

  return new Response('OK', { status: 200 })
}
