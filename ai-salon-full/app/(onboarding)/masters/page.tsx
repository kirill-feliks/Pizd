'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'

interface MasterRow { name: string; specialization: string }

export default function OnboardingMasters() {
  const [masters, setMasters] = useState<MasterRow[]>([{ name: '', specialization: '' }])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function addMaster() { setMasters(prev => [...prev, { name: '', specialization: '' }]) }
  function removeMaster(i: number) { setMasters(prev => prev.filter((_, idx) => idx !== i)) }
  function updateMaster(i: number, key: keyof MasterRow, val: string) {
    setMasters(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  }

  async function handleNext() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    const validMasters = masters.filter(m => m.name.trim())
    if (validMasters.length > 0) {
      await supabase.from('masters').insert(
        validMasters.map(m => ({ ...m, tenant_id: userData?.tenant_id }))
      )
    }
    await supabase.from('tenants').update({ onboarding_step: 3 }).eq('id', userData?.tenant_id)
    router.push('/onboarding/services')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Добавьте мастеров</h2>
      <p className="text-gray-500 mb-8">Можно добавить больше позже в настройках</p>

      <div className="space-y-3 mb-6">
        {masters.map((m, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                placeholder="Имя мастера"
                value={m.name}
                onChange={e => updateMaster(i, 'name', e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
              <input
                placeholder="Специализация"
                value={m.specialization}
                onChange={e => updateMaster(i, 'specialization', e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            {masters.length > 1 && (
              <button onClick={() => removeMaster(i)} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addMaster}
        className="flex items-center gap-2 text-violet-600 text-sm font-medium hover:text-violet-700 mb-8"
      >
        <Plus size={16} /> Добавить мастера
      </button>

      <div className="flex gap-3">
        <button onClick={() => router.push('/onboarding/hours')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Сохраняем...' : 'Далее →'}
        </button>
      </div>
    </div>
  )
}
