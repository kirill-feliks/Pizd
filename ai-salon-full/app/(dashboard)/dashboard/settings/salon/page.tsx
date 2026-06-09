'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SalonSettingsPage() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
      const { data: tenant } = await supabase.from('tenants').select('*').eq('id', userData?.tenant_id).single()
      if (tenant) setForm({ name: tenant.name, phone: tenant.phone ?? '', address: tenant.address ?? '', city: tenant.city })
    }
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    await supabase.from('tenants').update(form).eq('id', userData?.tenant_id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Настройки салона</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={save} className="space-y-4">
          {[
            { key: 'name',    label: 'Название салона' },
            { key: 'phone',   label: 'Телефон' },
            { key: 'address', label: 'Адрес' },
            { key: 'city',    label: 'Город' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors">
            {saved ? '✓ Сохранено!' : loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
