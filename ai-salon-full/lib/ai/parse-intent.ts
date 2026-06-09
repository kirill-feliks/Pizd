import OpenAI from 'openai'
import { ParsedIntent } from '@/types'

interface Context {
  upcomingBookings: Array<{
    id: string
    service: string
    master: string
    starts_at: string
  }>
  availableServices: string[]
  availableMasters: string[]
  clientName?: string | null
}

export async function parseIntent(
  message: string,
  context: Context
): Promise<ParsedIntent> {
  const today = new Date().toISOString().split('T')[0]

  const systemPrompt = `Ты — AI-администратор салона красоты в Казахстане. Говоришь только на русском языке.

Сегодняшняя дата: ${today}

Доступные услуги: ${context.availableServices.join(', ') || 'не указаны'}
Доступные мастера: ${context.availableMasters.join(', ') || 'не указаны'}
Предстоящие записи клиента: ${context.upcomingBookings.length > 0 ? JSON.stringify(context.upcomingBookings) : 'нет'}
Имя клиента: ${context.clientName || 'неизвестно'}

Верни ТОЛЬКО JSON без markdown, без пояснений:
{
  "intent": "book" | "reschedule" | "cancel" | "confirm" | "unknown",
  "confidence": 0.0-1.0,
  "service": "название услуги точно как в списке или null",
  "master": "имя мастера точно как в списке или null",
  "date": "YYYY-MM-DD или null",
  "time": "HH:MM или null",
  "booking_id": "ID записи для отмены/переноса или null",
  "response_text": "ответ клиенту на русском, дружелюбный, 1-2 предложения"
}

Правила:
- "да", "ДА", "+", "подтверждаю", "буду", "ок", "окей" → intent: "confirm"
- "нет", "НЕТ", "не приду", "отмена", "отменить", "не смогу" → intent: "cancel"  
- "перенести", "перенос", "другое время", "не могу в это время" → intent: "reschedule"
- Любая запись на услугу → intent: "book"
- Если не хватает инфо (нет услуги или даты) — спроси в response_text
- "завтра" = ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}
- "послезавтра" = ${new Date(Date.now() + 172800000).toISOString().split('T')[0]}
- Дни недели переводи в даты относительно сегодня
- response_text всегда заполнен, никогда не пустой`

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    })

    const raw = response.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw) as ParsedIntent
    
    // Validate required fields
    if (!parsed.intent || !parsed.response_text) {
      throw new Error('Invalid AI response structure')
    }

    return parsed
  } catch (e) {
    console.error('[AI Parse Error]', e)
    return {
      intent: 'unknown',
      confidence: 0,
      response_text: 'Не совсем поняла 😊 Хотите записаться, отменить или перенести запись?',
    }
  }
}
