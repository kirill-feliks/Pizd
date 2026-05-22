'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Calendar, Users, Scissors, Settings, LogOut, Menu, X, MessageSquare } from 'lucide-react'

const navItems = [
  { label: 'Главная',   href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Записи',    href: '/dashboard/bookings',   icon: Calendar },
  { label: 'Мастера',   href: '/dashboard/masters',    icon: Users },
  { label: 'Услуги',    href: '/dashboard/services',   icon: Scissors },
  { label: 'Настройки', href: '/dashboard/settings/salon', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <span className="font-bold text-gray-900">Salon</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = path === item.href || path.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <Link href="/dashboard/subscription"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-violet-600 font-medium hover:bg-violet-50 mb-1">
          <MessageSquare size={18} />
          WhatsApp
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 w-full">
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed h-full z-10">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="bg-white w-56 flex-col flex shadow-xl">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">Salon</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
