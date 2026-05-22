// app/(landing)/page.tsx
// AI Salon — Landing Page
// Modern SaaS, premium minimal, mobile-first, Russian language

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Nav />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <ROISection />
      <DemoFlow />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}

// ─── NAV ─────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="font-semibold text-gray-900">Salon</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#how" className="hover:text-gray-900 transition-colors">Как работает</a>
          <a href="#roi" className="hover:text-gray-900 transition-colors">ROI</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Цены</a>
          <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Войти
          </Link>
          <Link
            href="/register"
            className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            Начать бесплатно
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          Работает 24/7 в WhatsApp
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Снижаем no-show<br />
          <span className="text-violet-600">на 60%</span> через WhatsApp
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-администратор для салонов красоты. Записывает клиентов, напоминает о визите,
          получает подтверждение — всё автоматически, 24/7.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
          >
            Попробовать 7 дней бесплатно →
          </Link>
          <a
            href="#how"
            className="w-full sm:w-auto text-gray-600 px-8 py-4 rounded-xl text-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            Посмотреть демо
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-sm text-gray-400">
          Без привязки карты · 7 дней бесплатно · Настройка за 15 минут
        </p>

        {/* Phone mockup */}
        <div className="mt-16 relative">
          <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl">
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* WA header */}
              <div className="bg-teal-600 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                  💅
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Салон Айгуль</div>
                  <div className="text-teal-200 text-xs">AI-администратор · онлайн</div>
                </div>
              </div>
              {/* Messages */}
              <div className="bg-[#e5ddd5] p-4 space-y-3 min-h-[200px]">
                <ChatBubble
                  from="bot"
                  text="Привет! Завтра в 15:00 у вас маникюр к Дане. Подтвердите: ДА ✅ или НЕТ ❌"
                />
                <ChatBubble from="client" text="ДА" />
                <ChatBubble
                  from="bot"
                  text="Отлично! Запись подтверждена. Ждём вас завтра в 15:00 🌸"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChatBubble({ from, text }: { from: 'bot' | 'client'; text: string }) {
  return (
    <div className={`flex ${from === 'client' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
          from === 'bot'
            ? 'bg-white text-gray-800 rounded-tl-sm'
            : 'bg-teal-500 text-white rounded-tr-sm'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

// ─── PROBLEM ──────────────────────────────────────────────────
function ProblemSection() {
  const pains = [
    {
      stat: '15–25%',
      label: 'выручки теряют салоны из-за no-show каждый месяц',
      icon: '💸',
    },
    {
      stat: '3–4 часа',
      label: 'в день администратор тратит на запись и напоминания вручную',
      icon: '⏰',
    },
    {
      stat: '50%',
      label: 'клиентов пишут в WhatsApp — а не через онлайн-виджет',
      icon: '📱',
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Вы теряете деньги прямо сейчас
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Пока администратор обзванивает клиентов и вручную пишет в WhatsApp — слоты горят.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {pains.map((p) => (
            <div
              key={p.stat}
              className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <div className="text-4xl font-bold text-red-500 mb-2">{p.stat}</div>
              <p className="text-gray-600 leading-relaxed">{p.label}</p>
            </div>
          ))}
        </div>

        {/* Before/After */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
            <div className="text-red-500 font-semibold text-sm mb-4 uppercase tracking-wide">
              ❌ Сейчас
            </div>
            <ul className="space-y-3 text-gray-700">
              {[
                'Клиент пишет в WhatsApp — администратор отвечает часами позже',
                'Напоминания вручную — забыл, опоздал, не позвонил',
                'Клиент не пришёл — слот потерян, мастер стоит',
                'Запись в Excel или памяти телефона',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <div className="text-green-600 font-semibold text-sm mb-4 uppercase tracking-wide">
              ✅ С AI Salon
            </div>
            <ul className="space-y-3 text-gray-700">
              {[
                'AI отвечает клиенту мгновенно, 24/7, даже ночью',
                'Автоматические напоминания за 24ч и за 2ч',
                'Клиент не подтвердил — слот освобождается автоматически',
                'Всё в дашборде — записи, мастера, статистика',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Клиент пишет в WhatsApp',
      desc: 'Хочу записаться на маникюр в среду — и AI отвечает мгновенно, показывает свободные слоты.',
    },
    {
      num: '02',
      title: 'AI создаёт запись',
      desc: 'Понимает услугу, мастера, дату. Бронирует слот и подтверждает клиенту.',
    },
    {
      num: '03',
      title: 'Напоминание за 24 часа',
      desc: 'Бот пишет: «Подтвердите запись: ДА / НЕТ / Перенести». Клиент отвечает одним словом.',
    },
    {
      num: '04',
      title: 'Напоминание за 2 часа',
      desc: 'Если не ответил — второй запрос. Нет ответа 4 часа — слот освобождается автоматически.',
    },
    {
      num: '05',
      title: 'Вы видите всё в дашборде',
      desc: 'Записи сегодня, подтверждения, процент no-show. Всё в одном экране.',
    },
  ]

  return (
    <section id="how" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Как это работает</h2>
          <p className="text-lg text-gray-500">5 шагов от сообщения клиента до подтверждённой записи</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="flex gap-6 items-start p-6 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-violet-600 font-bold text-sm">{step.num}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ROI ──────────────────────────────────────────────────────
function ROISection() {
  return (
    <section id="roi" className="py-24 bg-violet-600 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Считаем вместе</h2>
          <p className="text-violet-200 text-lg">Типичный салон с 8 мастерами</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Средний чек визита', value: '8 000 ₸' },
            { label: 'Записей в месяц', value: '320' },
            { label: 'No-show до AI Salon', value: '20% = 64 визита' },
          ].map((item) => (
            <div key={item.label} className="bg-violet-500/50 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold mb-1">{item.value}</div>
              <div className="text-violet-200 text-sm">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 text-gray-900">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-gray-500 text-sm mb-1">No-show после AI Salon</div>
              <div className="text-3xl font-bold text-green-500">8% = 26 визита</div>
              <div className="text-gray-400 text-xs mt-1">снижение в 2.5 раза</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Возвращённая выручка</div>
              <div className="text-3xl font-bold text-gray-900">304 000 ₸</div>
              <div className="text-gray-400 text-xs mt-1">38 визитов × 8 000 ₸</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Цена подписки</div>
              <div className="text-3xl font-bold text-violet-600">45 000 ₸</div>
              <div className="text-gray-400 text-xs mt-1">ROI = 6.7x каждый месяц</div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Подписка окупается за <strong className="text-gray-900">5–6 не-пришедших клиентов</strong>. 
              Остальное — чистая прибыль.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── DEMO FLOW ────────────────────────────────────────────────
function DemoFlow() {
  const messages = [
    { from: 'client' as const, text: 'Здравствуйте! Хочу записаться на маникюр', delay: 0 },
    { from: 'bot' as const, text: 'Привет! К какому мастеру предпочитаете? Доступны: Айгуль, Дана, Карина', delay: 1 },
    { from: 'client' as const, text: 'К Айгуль', delay: 2 },
    { from: 'bot' as const, text: 'На завтра у Айгуль есть: 10:00, 12:30, 15:00, 17:00. Что удобно?', delay: 3 },
    { from: 'client' as const, text: '15:00', delay: 4 },
    { from: 'bot' as const, text: '✅ Записала вас на маникюр к Айгуль завтра в 15:00. Стоимость: 8 000 ₸. Напомню вам за день 🌸', delay: 5 },
  ]

  return (
    <section className="py-24 bg-gray-50 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Смотрите как это выглядит</h2>
          <p className="text-lg text-gray-500">Реальный диалог клиента с AI-администратором</p>
        </div>

        <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="bg-teal-600 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-xl">
                💅
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Beauty Studio</div>
                <div className="text-teal-200 text-xs">AI-администратор</div>
              </div>
            </div>
            <div className="bg-[#e5ddd5] p-4 space-y-3">
              {messages.map((msg, i) => (
                <ChatBubble key={i} from={msg.from} text={msg.text} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── PRICING ──────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '25 000',
      desc: 'Для небольших студий',
      features: [
        'До 5 мастеров',
        'Запись через WhatsApp',
        'Напоминания 24ч + 2ч',
        'Подтверждение записей',
        'Базовый дашборд',
      ],
      cta: 'Начать бесплатно',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '45 000',
      desc: 'Для большинства салонов',
      features: [
        'До 15 мастеров',
        'Всё из Basic',
        'Автоперенос записей',
        'Авто-освобождение слотов',
        'Полный дашборд + статистика',
        'Приоритетная поддержка',
      ],
      cta: 'Начать бесплатно',
      highlighted: true,
    },
    {
      name: 'Premium',
      price: '65 000',
      desc: 'Для сетей и крупных салонов',
      features: [
        'Неограниченно мастеров',
        'Всё из Pro',
        'Напоминание о повторной записи',
        'Уведомления об upsell',
        'Персональный онбординг',
        'SLA поддержки 4ч',
      ],
      cta: 'Связаться с нами',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Цены</h2>
          <p className="text-lg text-gray-500">7 дней бесплатно. Без привязки карты.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  ПОПУЛЯРНЫЙ
                </div>
              )}
              <div className="mb-6">
                <div className={`text-sm font-medium mb-1 ${plan.highlighted ? 'text-violet-200' : 'text-gray-500'}`}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg mb-1 ${plan.highlighted ? 'text-violet-200' : 'text-gray-400'}`}>
                    ₸/мес
                  </span>
                </div>
                <div className={`text-sm mt-1 ${plan.highlighted ? 'text-violet-200' : 'text-gray-500'}`}>
                  {plan.desc}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className={plan.highlighted ? 'text-violet-200' : 'text-violet-500'}>✓</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? 'bg-white text-violet-600 hover:bg-violet-50'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Годовая оплата — скидка 15%. Разовый онбординг — 15 000 ₸.
        </p>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────
function FAQ() {
  const faqs = [
    {
      q: 'Нужен ли отдельный номер WhatsApp?',
      a: 'Да. Лучше использовать WhatsApp Business на отдельном номере для салона. Подключение занимает 15 минут после верификации Meta Business.',
    },
    {
      q: 'Как долго длится настройка?',
      a: 'Базовая настройка — 15–20 минут: внести мастеров, услуги, часы работы. Мы помогаем в чате.',
    },
    {
      q: 'Что будет, если клиент напишет что-то нестандартное?',
      a: 'AI понимает разговорный русский. Если не понял — просит уточнить. Сложные ситуации можно передать администратору.',
    },
    {
      q: 'Работает ли с существующей CRM?',
      a: 'Пока нет — AI Salon работает как самостоятельный инструмент. Интеграция с популярными CRM — в планах.',
    },
    {
      q: 'Что значит 7 дней бесплатно?',
      a: 'Полный доступ ко всем функциям на 7 дней. Карта не нужна. После пробного периода выбираете тариф или не продолжаете — никаких обязательств.',
    },
    {
      q: 'Можно на казахском языке?',
      a: 'Пока только на русском. Казахский язык — следующий приоритет после запуска.',
    },
  ]

  return (
    <section id="faq" className="py-24 bg-gray-50 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Вопросы и ответы</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Начните возвращать<br />потерянную выручку сегодня
        </h2>
        <p className="text-lg text-gray-500 mb-10">
          7 дней бесплатно. Настройка за 15 минут. Без договоров.
        </p>
        <Link
          href="/register"
          className="inline-block bg-violet-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
        >
          Подключить AI-администратора →
        </Link>
        <p className="mt-4 text-sm text-gray-400">
          Уже подключено 50+ салонов в Алматы и Астане
        </p>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="font-semibold text-gray-900">Salon</span>
        </div>
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-900">Политика конфиденциальности</a>
          <a href="#" className="hover:text-gray-900">Условия использования</a>
          <a href="https://wa.me/77000000000" className="hover:text-gray-900">Поддержка в WhatsApp</a>
        </div>
        <p className="text-sm text-gray-400">© 2026 AI Salon. Казахстан.</p>
      </div>
    </footer>
  )
}
