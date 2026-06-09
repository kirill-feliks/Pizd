import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone_number_id, waba_id } = await req.json()

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  await supabase.from('tenants').update({
    wa_phone_number_id: phone_number_id,
    wa_connected: true,
  }).eq('id', userData.tenant_id)

  // Register webhook for this phone number via Meta API
  // (optional — can also be done manually in Meta dashboard)

  return NextResponse.json({ ok: true })
}
