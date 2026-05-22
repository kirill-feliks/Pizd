'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tenant } from '@/types'
import { getTrialDaysLeft } from '@/lib/utils'
import Link from 'next/link'

export default function SubscriptionPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
      const { data } = await supabase.from('tenants').select('*').eq('id', userData?.tenant_id).single()
      setTenant(data)
    }
    load()
  }, [])

  if (!tenant) return null

  const daysLeft = getTrialDaysLeft(tenant.trial_ends_at)
  const isTrial = tenant.plan === 'trial'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Подписка</h1>

      {isTrial && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="font-semibold text-violet-900">Пробный период</div>
              <div className="text-violet-700 text-sm">Осталось {daysLeft} дней</div>
            </div>
          </div>
          <p className="text-violet-700 text-sm">
            После окончания пробного периода выберите тариф для продолжения работы.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {[
          { name: 'Basic',   price: 25000, desc: 'До 5 мастеров',   features: ['Запись','Напоминания','Подтверждения'] },
          { name: 'Pro',     price: 45000, desc: 'До 15 мастеров',  features: ['Всё из Basic','Авто-перенос','Дашборд','Приоритетная поддержка'], recommended: true },
          { name: 'Premium', price: 65000, desc: 'Без ограничений', features: ['Всё из Pro','Ребукинг','Upsell','SLA 4ч'] },
        ].map(plan => (
          <div key={plan.name} className={`bg-white rounded-2xl border p-6 ${(plan as {recommended?: boolean}).recommended ? 'border-violet-300 ring-2 ring-violet-100' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{plan.name}</span>
                  {(plan as {recommended?: boolean}).recommended && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Популярный</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{plan.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{plan.price.toLocaleString('ru-RU')}</div>
                <div className="text-xs text-gray-400">₸/месяц</div>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-violet-500">✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-violet-200 text-violet-600 text-sm font-medium hover:bg-violet-50 transition-colors">
              {tenant.plan === plan.name.toLowerCase() ? 'Текущий тариф' : 'Выбрать тариф'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Для оплаты напишите нам в{' '}
        <a href="https://wa.me/77000000000" className="text-violet-600 hover:underline">WhatsApp</a>
      </p>
    </div>
  )
}
