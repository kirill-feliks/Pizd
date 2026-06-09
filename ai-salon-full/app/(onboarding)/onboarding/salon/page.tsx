'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingSalon() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: 'Алматы' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    await supabase.from('tenants').update({
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      onboarding_step: 1,
    }).eq('id', userData?.tenant_id)
    router.push('/onboarding/hours')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Расскажите о вашем салоне</h2>
      <p className="text-gray-500 mb-8">Эта информация будет показана вашим клиентам</p>

      <form onSubmit={handleNext} className="space-y-5">
        {[
          { key: 'name',    label: 'Название салона', placeholder: 'Beauty Studio' },
          { key: 'phone',   label: 'Телефон',         placeholder: '+7 700 000 00 00' },
          { key: 'address', label: 'Адрес',           placeholder: 'ул. Абая 10, офис 5' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input
              type="text"
              value={form[f.key as keyof typeof form]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Город</label>
          <select
            value={form.city}
            onChange={set('city')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option>Алматы</option>
            <option>Астана</option>
            <option>Шымкент</option>
            <option>Другой</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Сохраняем...' : 'Далее →'}
        </button>
      </form>
    </div>
  )
}
