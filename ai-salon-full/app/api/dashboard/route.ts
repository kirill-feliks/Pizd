import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  const [todayRes, noshowRes] = await Promise.all([
    supabase.from('bookings').select('*, clients(*), masters(*), services(*)')
      .gte('starts_at', `${today}T00:00:00`).lte('starts_at', `${today}T23:59:59`)
      .order('starts_at', { ascending: true }),
    supabase.from('bookings').select('status')
      .gte('starts_at', thirtyDaysAgo)
      .in('status', ['completed', 'no_show']),
  ])

  const bookings = todayRes.data ?? []
  const total = bookings.length
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length
  const pending = bookings.filter((b) => b.status === 'pending').length

  const allFinished = noshowRes.data ?? []
  const noShows = allFinished.filter((b) => b.status === 'no_show').length
  const noshowRate = allFinished.length > 0 ? Math.round((noShows / allFinished.length) * 100) : 0

  const revenueAtRisk = bookings
    .filter((b) => b.status === 'pending' && b.confirmation_requested_at)
    .reduce((sum, b) => sum + (b.services?.price ?? 0), 0)

  return Response.json({
    bookings_today: bookings,
    total_today: total,
    confirmed_today: confirmed,
    pending_today: pending,
    noshow_rate_30d: noshowRate,
    revenue_at_risk: revenueAtRisk,
  })
}
