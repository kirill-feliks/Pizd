# AI Salon — WhatsApp AI Administrator

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Настроить переменные окружения
```bash
cp .env.local.example .env.local
# Заполни все значения в .env.local
```

### 3. Настроить Supabase
- Зайди на supabase.com, создай проект
- В SQL Editor запусти файл `schema.sql`
- Скопируй URL и ключи в `.env.local`

### 4. Запустить локально
```bash
npm run dev
# Открой http://localhost:3000
```

### 5. Деплой на Vercel
```bash
# 1. Залей на GitHub
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USERNAME/ai-salon.git
git push -u origin main

# 2. Зайди на vercel.com → Import Project → выбери репо
# 3. Добавь все env variables из .env.local.example
# 4. Deploy
```

### 6. Настроить WhatsApp Webhook
После деплоя:
- Зайди в Meta Developer Dashboard
- WhatsApp → Configuration → Webhook
- URL: https://твой-домен.vercel.app/api/webhooks/whatsapp
- Verify Token: значение из WA_VERIFY_TOKEN в .env

## Структура проекта
```
app/
  (landing)/     — лендинг
  (auth)/        — логин, регистрация
  (onboarding)/  — 5 шагов онбординга
  (dashboard)/   — основной дашборд
  api/           — все API routes
lib/
  supabase/      — клиент, сервер, middleware
  whatsapp/      — отправка, шаблоны, верификация
  ai/            — парсинг интентов (OpenAI)
  booking/       — логика слотов и бронирования
types/           — TypeScript типы
```

## Как работает WhatsApp интеграция
1. Клиент пишет в WhatsApp
2. Meta отправляет POST на /api/webhooks/whatsapp
3. Мы парсим intent через GPT-4o-mini
4. Выполняем детерминированную логику (создание/отмена/перенос)
5. Отвечаем клиенту

## Cron (напоминания)
Vercel запускает /api/reminders/cron каждые 15 минут.
Cron отправляет напоминания за 24ч и 2ч до визита.
