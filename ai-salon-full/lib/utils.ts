import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(tenge: number): string {
  return tenge.toLocaleString('ru-RU') + ' ₸'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short'
  }) + ' в ' + formatTime(iso)
}

export function getTrialDaysLeft(trialEndsAt: string): number {
  const ms = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function isSubscriptionActive(tenant: { 
  plan: string; 
  trial_ends_at: string; 
  subscription_status: string 
}): boolean {
  if (tenant.subscription_status === 'active') return true
  if (tenant.plan === 'trial') {
    return new Date(tenant.trial_ends_at) > new Date()
  }
  return false
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждена',
    completed: 'Завершена',
    cancelled: 'Отменена',
    no_show: 'Не пришёл',
  }
  return map[status] ?? status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-600',
    no_show: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}
