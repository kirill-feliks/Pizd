export type Plan = 'trial' | 'basic' | 'pro' | 'premium'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type Intent = 'book' | 'reschedule' | 'cancel' | 'confirm' | 'unknown'

export interface Tenant {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  city: string
  timezone: string
  wa_phone_number_id: string | null
  wa_access_token: string | null
  wa_connected: boolean
  plan: Plan
  trial_ends_at: string
  subscription_status: string
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string | null
  role: 'owner' | 'admin' | 'viewer'
}

export interface Master {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  specialization: string | null
  color: string
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  tenant_id: string
  name: string
  duration_minutes: number
  price: number
  description: string | null
  is_active: boolean
}

export interface WorkingHours {
  id: string
  master_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface Client {
  id: string
  tenant_id: string
  wa_phone: string
  name: string | null
  visit_count: number
  total_spent: number
  last_visit_at: string | null
  created_at: string
}

export interface Booking {
  id: string
  tenant_id: string
  client_id: string
  master_id: string
  service_id: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  reminder_24h_sent_at: string | null
  reminder_2h_sent_at: string | null
  confirmation_requested_at: string | null
  confirmed_at: string | null
  notes: string | null
  source: string
  created_at: string
  // Joined
  client?: Client
  master?: Master
  service?: Service
}

export interface ParsedIntent {
  intent: Intent
  confidence: number
  service?: string | null
  master?: string | null
  date?: string | null
  time?: string | null
  booking_id?: string | null
  response_text: string
}

export interface TimeSlot {
  time: string
  master_id: string
  master_name: string
}

export interface DashboardStats {
  bookings_today: Booking[]
  stats: {
    total_today: number
    confirmed_today: number
    pending_today: number
    noshow_rate_30d: number
    revenue_at_risk: number
  }
}
