'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const steps = [
  { label: 'Салон',    href: '/onboarding/salon' },
  { label: 'Часы',     href: '/onboarding/hours' },
  { label: 'Мастера',  href: '/onboarding/masters' },
  { label: 'Услуги',   href: '/onboarding/services' },
  { label: 'WhatsApp', href: '/onboarding/whatsapp' },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const currentStep = steps.findIndex(s => path.startsWith(s.href))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="font-semibold text-gray-900">Salon</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${i < currentStep ? 'bg-violet-600 text-white' :
                  i === currentStep ? 'bg-violet-600 text-white ring-4 ring-violet-100' :
                  'bg-gray-200 text-gray-500'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-violet-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}
