'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'

interface ServiceRow { name: string; duration_minutes: string; price: string }

const defaultServices: ServiceRow[] = [
  { name: 'Маникюр', duration_minutes: '60', price: '8000' },
  { name: 'Педикюр', duration_minutes: '90', price: '10000' },
]

export default function OnboardingServices() {
  const [services, setServices] = useState<ServiceRow[]>(defaultServices)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function addService() { setServices(prev => [...prev, { name: '', duration_minutes: '60', price: '' }]) }
  function removeService(i: number) { setServices(prev => prev.filter((_, idx) => idx !== i)) }
  function update(i: number, key: keyof ServiceRow, val: string) {
    setServices(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }

  async function handleNext() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    const valid = services.filter(s => s.name.trim() && s.price)
    if (valid.length > 0) {
      await supabase.from('services').insert(
        valid.map(s => ({
          name: s.name,
          duration_minutes: parseInt(s.duration_minutes),
          price: parseInt(s.price),
          tenant_id: userData?.tenant_id,
        }))
      )
    }
    await supabase.from('tenants').update({ onboarding_step: 4 }).eq('id', userData?.tenant_id)
    router.push('/onboarding/whatsapp')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ваши услуги</h2>
      <p className="text-gray-500 mb-8">Добавьте основные услуги салона</p>

      <div className="space-y-3 mb-6">
        {services.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 items-center">
            <input placeholder="Название" value={s.name} onChange={e => update(i, 'name', e.target.value)}
              className="col-span-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            <input placeholder="Цена ₸" value={s.price} onChange={e => update(i, 'price', e.target.value)} type="number"
              className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            <div className="flex gap-2 items-center">
              <select value={s.duration_minutes} onChange={e => update(i, 'duration_minutes', e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} мин</option>)}
              </select>
              {services.length > 1 && (
                <button onClick={() => removeService(i)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addService} className="flex items-center gap-2 text-violet-600 text-sm font-medium hover:text-violet-700 mb-8">
        <Plus size={16} /> Добавить услугу
      </button>

      <div className="flex gap-3">
        <button onClick={() => router.push('/onboarding/masters')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
          ← Назад
        </button>
        <button onClick={handleNext} disabled={loading}
          className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-60">
          {loading ? 'Сохраняем...' : 'Далее →'}
        </button>
      </div>
    </div>
  )
}
