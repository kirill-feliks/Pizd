import { SupabaseClient } from '@supabase/supabase-js'
import { TimeSlot } from '@/types'

function pad(n: number) { return n.toString().padStart(2, '0') }

export async function getAvailableSlots(
  supabase: SupabaseClient,
  tenantId: string,
  serviceId: string,
  date: string,
  masterId?: string | null
): Promise<TimeSlot[]> {
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) return []

  const duration = service.duration_minutes
  const dateObj = new Date(date + 'T12:00:00')
  const dow = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1

  let query = supabase
    .from('working_hours')
    .select('*, masters(id, name)')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dow)
    .eq('is_working', true)

  if (masterId) query = query.eq('master_id', masterId)

  const { data: workingHours } = await query

  if (!workingHours?.length) return []

  const dayStart = `${date}T00:00:00.000Z`
  const dayEnd = `${date}T23:59:59.000Z`

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('master_id, starts_at, ends_at')
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd)

  const slots: TimeSlot[] = []
  const now = new Date()

  for (const wh of workingHours) {
    const [startH, startM] = (wh.start_time as string).split(':').map(Number)
    const [endH, endM] = (wh.end_time as string).split(':').map(Number)

    const workStart = startH * 60 + startM
    const workEnd = endH * 60 + endM - duration

    for (let t = workStart; t <= workEnd; t += 30) {
      const slotStart = new Date(`${date}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00`)
      const slotEnd = new Date(slotStart.getTime() + duration * 60000)

      // Skip past slots
      if (slotStart <= now) continue

      const conflict = existingBookings?.some(
        (b) =>
          b.master_id === wh.master_id &&
          new Date(b.starts_at) < slotEnd &&
          new Date(b.ends_at) > slotStart
      )

      if (!conflict) {
        slots.push({
          time: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`,
          master_id: wh.master_id as string,
          master_name: (wh.masters as { name: string }).name,
        })
      }
    }
  }

  return slots
}

export async function getFirstAvailableMaster(
  supabase: SupabaseClient,
  tenantId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('masters')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .limit(1)
    .single()
  return data?.id ?? null
}
