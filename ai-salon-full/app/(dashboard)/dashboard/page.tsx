'use client'
import { useEffect, useState } from 'react'
import { DashboardStats, Booking } from '@/types'
import { formatPrice, formatTime, statusLabel, statusColor } from '@/lib/utils'
import { TrendingDown, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/dashboard/stats')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-violet-600" size={28} />
      </div>
    )
  }

  const { stats, bookings_today } = data ?? { stats: { total_today:0, confirmed_today:0, pending_today:0, noshow_rate_30d:0, revenue_at_risk:0 }, bookings_today: [] }

  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сегодня</h1>
          <p className="text-gray-500 capitalize">{today}</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Записей', value: stats.total_today, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Подтверждено', value: stats.confirmed_today, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'No-show (30д)', value: `${stats.noshow_rate_30d}%`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Под угрозой', value: formatPrice(stats.revenue_at_risk), icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Записи на сегодня</h2>
        </div>
        {bookings_today.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p>Записей на сегодня нет</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(bookings_today as Booking[]).map(b => (
              <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-sm font-mono font-semibold text-gray-900 w-12 flex-shrink-0">
                    {formatTime(b.starts_at)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {b.client?.name ?? b.client?.wa_phone ?? '—'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {b.service?.name} · {b.master?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(b.status)}`}>
                    {statusLabel(b.status)}
                  </span>
                  {b.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(b.id, 'confirmed')}
                        className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200 font-medium">
                        ✓ Подтвердить
                      </button>
                      <button onClick={() => updateStatus(b.id, 'no_show')}
                        className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-100 font-medium">
                        Не пришёл
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')}
                      className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium">
                      Завершить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Calendar({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}
