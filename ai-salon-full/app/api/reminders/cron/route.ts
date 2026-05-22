import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { templates } from '@/lib/whatsapp/templates'
import { formatDate, formatTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let sent24h = 0, sent2h = 0, released = 0

  // ── 24-HOUR REMINDERS ────────────────────────────────────
  const window24Start = new Date(now.getTime() + 23 * 3600000)
  const window24End   = new Date(now.getTime() + 25 * 3600000)

  const { data: bookings24h } = await supabase
    .from('bookings')
    .select('*, clients(*), services(*), masters(*), tenants(*)')
    .in('status', ['pending', 'confirmed'])
    .is('reminder_24h_sent_at', null)
    .gte('starts_at', window24Start.toISOString())
    .lte('starts_at', window24End.toISOString())

  for (const b of bookings24h ?? []) {
    if (!b.tenants.wa_connected) continue

    const msg = templates.reminder24h(
      b.clients.name ?? '',
      formatDate(b.starts_at),
      formatTime(b.starts_at),
      b.services.name,
      b.masters.name
    )

    const ok = await sendWhatsAppMessage(b.tenants, b.clients.wa_phone, msg)
    if (ok) {
      await supabase.from('bookings').update({
        reminder_24h_sent_at: now.toISOString(),
        confirmation_requested_at: now.toISOString(),
      }).eq('id', b.id)
      sent24h++
    }
  }

  // ── 2-HOUR REMINDERS ─────────────────────────────────────
  const window2Start = new Date(now.getTime() + 100 * 60000)
  const window2End   = new Date(now.getTime() + 140 * 60000)

  const { data: bookings2h } = await supabase
    .from('bookings')
    .select('*, clients(*), services(*), tenants(*)')
    .in('status', ['pending', 'confirmed'])
    .is('reminder_2h_sent_at', null)
    .gte('starts_at', window2Start.toISOString())
    .lte('starts_at', window2End.toISOString())

  for (const b of bookings2h ?? []) {
    if (!b.tenants.wa_connected) continue

    const msg = templates.reminder2h(formatTime(b.starts_at), b.services.name)
    const ok = await sendWhatsAppMessage(b.tenants, b.clients.wa_phone, msg)
    if (ok) {
      await supabase.from('bookings').update({
        reminder_2h_sent_at: now.toISOString(),
      }).eq('id', b.id)
      sent2h++
    }
  }

  // ── AUTO-RELEASE UNCONFIRMED SLOTS ───────────────────────
  // If confirmation was requested 4+ hours ago and no reply → cancel
  const cutoff = new Date(now.getTime() - 4 * 3600000)

  const { data: toRelease } = await supabase
    .from('bookings')
    .select('id, clients(*), tenants(*)')
    .eq('status', 'pending')
    .not('confirmation_requested_at', 'is', null)
    .lte('confirmation_requested_at', cutoff.toISOString())
    .gt('starts_at', now.toISOString())

  for (const b of toRelease ?? []) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    released++
    // Optionally notify client their slot was released
  }

  console.log(`[Cron] 24h: ${sent24h}, 2h: ${sent2h}, released: ${released}`)

  return Response.json({ ok: true, sent24h, sent2h, released })
}
