import { SupabaseClient } from '@supabase/supabase-js'
import { ParsedIntent, Tenant, Client } from '@/types'
import { getAvailableSlots, getFirstAvailableMaster } from './slots'
import { templates } from '@/lib/whatsapp/templates'
import { formatDate, formatTime } from '@/lib/utils'

export async function handleBookingIntent(
  supabase: SupabaseClient,
  tenant: Tenant,
  client: Client,
  parsed: ParsedIntent
): Promise<string> {
  switch (parsed.intent) {
    case 'book':      return handleBook(supabase, tenant, client, parsed)
    case 'confirm':   return handleConfirm(supabase, tenant, client)
    case 'cancel':    return handleCancel(supabase, tenant, client)
    case 'reschedule':return handleReschedule(supabase, tenant, client, parsed)
    default:          return parsed.response_text || templates.unknown()
  }
}

async function handleBook(
  supabase: SupabaseClient,
  tenant: Tenant,
  client: Client,
  parsed: ParsedIntent
): Promise<string> {
  if (!parsed.service) return parsed.response_text

  // Find service
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  const service = services?.find(s =>
    s.name.toLowerCase().includes(parsed.service!.toLowerCase()) ||
    parsed.service!.toLowerCase().includes(s.name.toLowerCase())
  )

  if (!service) {
    const list = services?.map(s => s.name).join(', ') ?? ''
    return `Услуга не найдена. Доступные услуги:\n${list}\n\nНа что записать?`
  }

  // Find master if specified
  let masterId: string | null = null
  if (parsed.master) {
    const { data: masters } = await supabase
      .from('masters')
      .select('id, name')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)

    const master = masters?.find(m =>
      m.name.toLowerCase().includes(parsed.master!.toLowerCase())
    )
    masterId = master?.id ?? null
  }

  // If date + time — try to create booking
  if (parsed.date && parsed.time) {
    const startsAt = new Date(`${parsed.date}T${parsed.time}:00`)
    const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60000)

    // Check availability
    const slots = await getAvailableSlots(supabase, tenant.id, service.id, parsed.date, masterId)
    const isAvailable = slots.some(s => s.time === parsed.time && (!masterId || s.master_id === masterId))

    if (!isAvailable) {
      if (slots.length === 0) {
        return templates.noSlots(service.name)
      }
      const alts = slots.slice(0, 4).map(s => `${s.time} (${s.master_name})`)
      return templates.slotsBusy(service.name, alts)
    }

    const resolvedMasterId = masterId ?? slots.find(s => s.time === parsed.time)?.master_id
      ?? await getFirstAvailableMaster(supabase, tenant.id)

    if (!resolvedMasterId) return 'Нет доступных мастеров на это время.'

    await supabase.from('bookings').insert({
      tenant_id: tenant.id,
      client_id: client.id,
      master_id: resolvedMasterId,
      service_id: service.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'pending',
      source: 'whatsapp',
    })

    return templates.bookingCreated(
      service.name,
      formatDate(startsAt.toISOString()),
      parsed.time,
      service.price
    )
  }

  // No date — show available slots for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const slots = await getAvailableSlots(supabase, tenant.id, service.id, tomorrowStr, masterId)

  if (slots.length === 0) {
    return templates.noSlots(service.name)
  }

  const slotList = slots.slice(0, 5).map(s => `• ${s.time} (${s.master_name})`).join('\n')
  return `На завтра для *${service.name}* доступно:\n${slotList}\n\nКакое время удобно?`
}

async function handleConfirm(
  supabase: SupabaseClient,
  tenant: Tenant,
  client: Client
): Promise<string> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .eq('status', 'pending')
    .not('confirmation_requested_at', 'is', null)
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!booking) {
    // Try confirming any pending booking
    const { data: anyPending } = await supabase
      .from('bookings')
      .select('id, starts_at')
      .eq('tenant_id', tenant.id)
      .eq('client_id', client.id)
      .eq('status', 'pending')
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!anyPending) return templates.noActiveBooking()

    await supabase.from('bookings').update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    }).eq('id', anyPending.id)

    return templates.confirmed(formatTime(anyPending.starts_at))
  }

  await supabase.from('bookings').update({
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  }).eq('id', booking.id)

  return templates.confirmed(formatTime(booking.starts_at))
}

async function handleCancel(
  supabase: SupabaseClient,
  tenant: Tenant,
  client: Client
): Promise<string> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('id')
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .in('status', ['pending', 'confirmed'])
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!booking) return templates.noActiveBooking()

  await supabase.from('bookings').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  }).eq('id', booking.id)

  return templates.cancelled()
}

async function handleReschedule(
  supabase: SupabaseClient,
  tenant: Tenant,
  client: Client,
  parsed: ParsedIntent
): Promise<string> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(*)')
    .eq('tenant_id', tenant.id)
    .eq('client_id', client.id)
    .in('status', ['pending', 'confirmed'])
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!booking) return templates.noActiveBooking()

  // Cancel existing
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)

  if (parsed.date && parsed.time) {
    const startsAt = new Date(`${parsed.date}T${parsed.time}:00`)
    const endsAt = new Date(startsAt.getTime() + booking.services.duration_minutes * 60000)

    await supabase.from('bookings').insert({
      tenant_id: tenant.id,
      client_id: client.id,
      master_id: booking.master_id,
      service_id: booking.service_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'pending',
      source: 'whatsapp',
    })

    return templates.rescheduled(
      formatDate(startsAt.toISOString()),
      parsed.time
    )
  }

  return `На какой день и время перенести запись на *${booking.services.name}*?`
}
