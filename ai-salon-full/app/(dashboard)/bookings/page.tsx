'use client'
import { useEffect, useState } from 'react'
import { Booking } from '@/types'
import { formatDateTime, formatPrice, statusLabel, statusColor } from '@/lib/utils'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/bookings?date=${date}`)
    if (res.ok) setBookings(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [date])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Записи</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Загрузка...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Записей на эту дату нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Время','Клиент','Услуга','Мастер','Цена','Статус',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 whitespace-nowrap">
                      {formatDateTime(b.starts_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {b.client?.name ?? b.client?.wa_phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.service?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.master?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {b.service ? formatPrice(b.service.price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(b.status)}`}>
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(b.id, 'confirmed')}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100">✓</button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')}
                            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">✕</button>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">Завершить</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
