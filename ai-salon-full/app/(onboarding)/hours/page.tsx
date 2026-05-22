'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export default function OnboardingHours() {
  const router = useRouter()
  const [hours, setHours] = useState(
    DAYS.map((_, i) => ({ day: i, start: '09:00', end: '20:00', working: i < 6 }))
  )

  function toggle(i: number) { setHours(prev => prev.map((h, idx) => idx === i ? { ...h, working: !h.working } : h)) }
  function setTime(i: number, key: 'start' | 'end', val: string) {
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [key]: val } : h))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Часы работы</h2>
      <p className="text-gray-500 mb-8">Когда принимает ваш салон?</p>

      <div className="space-y-3 mb-8">
        {hours.map((h, i) => (
          <div key={i} className="flex items-center gap-4">
            <button
              onClick={() => toggle(i)}
              className={`w-10 h-10 rounded-xl font-semibold text-sm flex-shrink-0 transition-colors
                ${h.working ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {DAYS[i]}
            </button>
            {h.working ? (
              <div className="flex items-center gap-3 flex-1">
                <input type="time" value={h.start} onChange={e => setTime(i, 'start', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <span className="text-gray-400 text-sm">—</span>
                <input type="time" value={h.end} onChange={e => setTime(i, 'end', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Выходной</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push('/onboarding/salon')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
          ← Назад
        </button>
        <button onClick={() => router.push('/onboarding/masters')}
          className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700">
          Далее →
        </button>
      </div>
    </div>
  )
}
