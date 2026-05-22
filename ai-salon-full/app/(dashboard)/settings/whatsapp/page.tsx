'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tenant } from '@/types'

declare global { interface Window { FB: unknown; fbAsyncInit: () => void } }

export default function WhatsAppSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [reconnecting, setReconnecting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    load()
    // Load Meta SDK
    window.fbAsyncInit = function () {
      ;(window.FB as { init: (c: unknown) => void }).init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v19.0',
      })
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/ru_RU/sdk.js'
    document.head.appendChild(script)

    const handler = async (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com') return
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
        const { phone_number_id } = data.data
        await fetch('/api/whatsapp/save-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number_id }),
        })
        load()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    const { data } = await supabase.from('tenants').select('*').eq('id', userData?.tenant_id).single()
    setTenant(data)
    setLoading(false)
  }

  function reconnect() {
    setReconnecting(true)
    ;(window.FB as { login: (cb: (r: unknown) => void, opts: unknown) => void }).login(
      async (response: unknown) => {
        const r = response as { authResponse?: { code?: string } }
        if (r.authResponse?.code) {
          await fetch('/api/whatsapp/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: r.authResponse.code }),
          })
          load()
        }
        setReconnecting(false)
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      }
    )
  }

  if (loading) return <div className="text-gray-400 text-sm">Загрузка...</div>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">WhatsApp</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
            ${tenant?.wa_connected ? 'bg-green-100' : 'bg-gray-100'}`}>
            💬
          </div>
          <div>
            <div className="font-semibold text-gray-900">WhatsApp Business API</div>
            <div className={`flex items-center gap-1.5 text-sm ${tenant?.wa_connected ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-2 h-2 rounded-full ${tenant?.wa_connected ? 'bg-green-500' : 'bg-gray-300'}`} />
              {tenant?.wa_connected ? 'Подключён и работает' : 'Не подключён'}
            </div>
          </div>
        </div>

        {tenant?.wa_connected ? (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <div className="text-gray-500 text-xs mb-1">Phone Number ID</div>
              <div className="font-mono text-gray-700">{tenant.wa_phone_number_id ?? '—'}</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
              ✅ AI-администратор активен. Клиенты могут писать в WhatsApp прямо сейчас.
            </div>
            <button onClick={reconnect} disabled={reconnecting}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">
              {reconnecting ? 'Переподключение...' : 'Переподключить номер'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
              ⚠️ WhatsApp не подключён. AI-администратор не работает.
            </div>
            <button onClick={reconnect} disabled={reconnecting}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
              {reconnecting ? 'Открываем...' : '💬 Подключить WhatsApp Business'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-900">Инструкция</p>
        <ol className="space-y-1.5 list-decimal list-inside text-gray-500">
          <li>Нажмите кнопку подключения</li>
          <li>Войдите в Facebook Business аккаунт</li>
          <li>Выберите или создайте номер WhatsApp</li>
          <li>Готово — AI начнёт отвечать клиентам</li>
        </ol>
        <p className="text-xs text-gray-400 pt-2">
          Нужен отдельный номер для WhatsApp Business. Личный номер использовать нельзя.
        </p>
      </div>
    </div>
  )
}
