import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('bookings')
    .select('*, clients(*), masters(*), services(*)')
    .order('starts_at', { ascending: true })

  if (date) {
    query = query
      .gte('starts_at', `${date}T00:00:00.000Z`)
      .lte('starts_at', `${date}T23:59:59.999Z`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...body, tenant_id: userData.tenant_id, source: 'manual' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
