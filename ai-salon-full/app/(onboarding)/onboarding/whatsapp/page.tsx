'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

declare global { interface Window { FB: unknown; fbAsyncInit: () => void } }

export default function OnboardingWhatsApp() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    window.fbAsyncInit = function () {
      (window.FB as {init: (c: unknown) => void}).init({
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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
        await supabase.from('tenants').update({
          wa_phone_number_id: phone_number_id,
          wa_connected: true,
          onboarding_completed: true,
          onboarding_step: 5,
        }).eq('id', userData?.tenant_id)
        setConnected(true)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function launchSignup() {
    setLoading(true)
    ;(window.FB as {login: (cb: (r: unknown) => void, opts: unknown) => void}).login(
      (response: unknown) => {
        const r = response as {authResponse?: {code?: string}}
        if (r.authResponse?.code) {
          fetch('/api/whatsapp/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: r.authResponse.code }),
          })
        }
        setLoading(false)
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
      }
    )
  }

  if (connected) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp подключён!</h2>
        <p className="text-gray-500 mb-8">Теперь ваш AI-администратор готов к работе</p>
        <button onClick={() => router.push('/dashboard')}
          className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700">
          Перейти в дашборд →
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Подключите WhatsApp</h2>
      <p className="text-gray-500 mb-8">
        Нажмите кнопку — откроется окно Meta. Войдите в ваш Facebook Business аккаунт
        и выберите номер WhatsApp для салона.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">💬</span>
          <div>
            <div className="font-semibold text-gray-900">WhatsApp Business API</div>
            <div className="text-sm text-gray-500">Официальная интеграция Meta</div>
          </div>
        </div>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {['Неограниченные сообщения','Официальный бизнес-аккаунт','Зелёная галочка верификации'].map(t => (
            <li key={t} className="flex items-center gap-2"><span className="text-green-500">✓</span>{t}</li>
          ))}
        </ul>
      </div>

      <button onClick={launchSignup} disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-60">
        <span>💬</span>
        {loading ? 'Открываем...' : 'Подключить WhatsApp Business'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        Мы не получаем доступ к вашим личным перепискам
      </p>

      <button onClick={() => router.push('/dashboard')} className="w-full text-sm text-gray-400 hover:text-gray-600 mt-4 py-2">
        Пропустить, подключу позже →
      </button>
    </div>
  )
}
