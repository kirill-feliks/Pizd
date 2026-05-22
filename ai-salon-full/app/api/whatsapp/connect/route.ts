import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  // Exchange code for access token via Meta API
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token` +
    `?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&code=${code}`
  )

  if (!tokenRes.ok) {
    const err = await tokenRes.json()
    console.error('[WA Connect] Token exchange failed:', err)
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 })
  }

  const { access_token } = await tokenRes.json()

  // Get user's tenant
  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  // Save token — in production, encrypt before storing
  await supabase.from('tenants').update({
    wa_access_token: access_token,
    wa_connected: true,
    onboarding_completed: true,
  }).eq('id', userData.tenant_id)

  return NextResponse.json({ ok: true })
}
