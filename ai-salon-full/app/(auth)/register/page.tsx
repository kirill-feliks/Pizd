'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({ salonName: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { salon_name: form.salonName, full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding/salon`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding/salon')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">7 дней бесплатно</h1>
          <p className="text-gray-500 mt-1">Без привязки карты. Настройка за 15 минут.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: 'salonName', label: 'Название салона', placeholder: 'Beauty Studio Алматы', type: 'text' },
              { key: 'fullName',  label: 'Ваше имя',        placeholder: 'Айгуль Иванова',       type: 'text' },
              { key: 'email',     label: 'Email',            placeholder: 'salon@example.kz',     type: 'email' },
              { key: 'password',  label: 'Пароль',           placeholder: '••••••••',             type: 'password' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={set(f.key)}
                  required
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Создаём аккаунт...' : 'Начать бесплатно →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Регистрируясь, вы принимаете условия использования
          </p>
          <p className="text-center text-sm text-gray-500 mt-4">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-violet-600 font-medium hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
