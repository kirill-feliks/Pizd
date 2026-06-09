'use client'
import { useEffect, useState } from 'react'
import { Service } from '@/types'
import { Plus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_minutes: 60, price: '' })
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/services')
    if (res.ok) setServices(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function addService() {
    if (!form.name.trim() || !form.price) return
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseInt(form.price) }),
    })
    setForm({ name: '', duration_minutes: 60, price: '' })
    setShowForm(false)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Новая услуга</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Маникюр"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Цена (₸)</label>
              <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="8000" type="number"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Длительность</label>
              <select value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} мин</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">Отмена</button>
            <button onClick={addService} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">Добавить</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-16 text-gray-400">Загрузка...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {services.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Услуги не добавлены</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {services.map(s => (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.duration_minutes} мин</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatPrice(s.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
