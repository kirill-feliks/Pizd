import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const tenantId = userData.tenant_id
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

  const { data: bookingsToday } = await supabase
    .from('bookings')
    .select('*, clients(*), masters(*), services(*)')
    .eq('tenant_id', tenantId)
    .gte('starts_at', todayStart)
    .lte('starts_at', todayEnd)
    .order('starts_at', { ascending: true })

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  const { data: completed30 } = await supabase
    .from('bookings')
    .select('status')
    .eq('tenant_id', tenantId)
    .in('status', ['completed', 'no_show'])
    .gte('starts_at', thirtyDaysAgo)

  const total30 = completed30?.length ?? 0
  const noShow30 = completed30?.filter(b => b.status === 'no_show').length ?? 0
  const noshowRate = total30 > 0 ? Math.round((noShow30 / total30) * 100) : 0

  const todayBookings = bookingsToday ?? []
  const revenueAtRisk = todayBookings
    .filter(b => b.status === 'pending')
    .reduce((sum: number, b: Record<string, unknown>) => sum + ((b.services as {price:number})?.price ?? 0), 0)

  return NextResponse.json({
    bookings_today: todayBookings,
    stats: {
      total_today: todayBookings.length,
      confirmed_today: todayBookings.filter(b => b.status === 'confirmed').length,
      pending_today: todayBookings.filter(b => b.status === 'pending').length,
      noshow_rate_30d: noshowRate,
      revenue_at_risk: revenueAtRisk,
    },
  })
}
