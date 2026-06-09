'use client'
import { useEffect, useState } from 'react'
import { Master } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

export default function MastersPage() {
  const [masters, setMasters] = useState<Master[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', specialization: '', phone: '' })
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/masters')
    if (res.ok) setMasters(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addMaster() {
    if (!form.name.trim()) return
    const res = await fetch('/api/masters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ name: '', specialization: '', phone: '' })
      setShowForm(false)
      load()
    }
  }

  const colors = ['#7c3aed','#2563eb','#16a34a','#dc2626','#d97706','#0891b2','#be185d']

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Мастера</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Новый мастер</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'name',           label: 'Имя',             placeholder: 'Айгуль' },
              { key: 'specialization', label: 'Специализация',   placeholder: 'Маникюр, педикюр' },
              { key: 'phone',          label: 'Телефон',         placeholder: '+7 700...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Отмена
            </button>
            <button onClick={addMaster} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
              Добавить
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Загрузка...</div>
      ) : masters.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="mb-2">Мастера не добавлены</p>
          <button onClick={() => setShowForm(true)} className="text-violet-600 text-sm font-medium">
            Добавить первого мастера
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {masters.map((m, i) => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}>
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{m.name}</div>
                {m.specialization && <div className="text-sm text-gray-500">{m.specialization}</div>}
                {m.phone && <div className="text-sm text-gray-400">{m.phone}</div>}
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
