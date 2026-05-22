import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'AI Salon — WhatsApp администратор для салонов красоты',
  description: 'Снижаем no-show через AI WhatsApp администратора. Автоматические записи, напоминания и подтверждения.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${geist.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
