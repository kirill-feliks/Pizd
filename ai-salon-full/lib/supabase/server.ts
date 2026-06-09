import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

type CookieToSet = { name: string; value: string; options?: Partial<ResponseCookie> }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'demo-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export function createAdminClient() {
  return createServerClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
