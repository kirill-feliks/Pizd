// Message templates for WhatsApp
// For outbound proactive messages you MUST use approved Meta templates.
// These are free-text versions used when replying within 24h window.

export const templates = {
  bookingCreated: (service: string, date: string, time: string, price: number) =>
    `✅ Записала вас на *${service}* ${date} в ${time}.\n💰 Стоимость: ${price.toLocaleString('ru-RU')} ₸\n\nЗа день до визита напомним вам 🌸`,

  reminder24h: (clientName: string, date: string, time: string, service: string, master: string) =>
    `Привет${clientName ? ', ' + clientName : ''}! 👋\n\nНапоминаем о вашей записи:\n📅 ${date} в ${time}\n💅 ${service} у ${master}\n\nПожалуйста, подтвердите визит:\n*ДА* ✅ — приду\n*НЕТ* ❌ — отменить\n*ПЕРЕНЕСТИ* 🔄 — другое время`,

  reminder2h: (time: string, service: string) =>
    `⏰ Напоминаем — через 2 часа в *${time}* вас ждём на *${service}*!\n\nБудете? *ДА* / *НЕТ*`,

  confirmed: (time: string) =>
    `✅ Отлично! Запись подтверждена. Ждём вас в *${time}*! 💛`,

  cancelled: () =>
    `Запись отменена. Если захотите записаться снова — просто напишите! 😊`,

  rescheduled: (date: string, time: string) =>
    `✅ Перенесла вашу запись на *${date}* в *${time}*.`,

  slotsBusy: (service: string, alternatives: string[]) =>
    `К сожалению, это время занято для *${service}*.\n\nДоступные варианты:\n${alternatives.map(t => `• ${t}`).join('\n')}\n\nКакое время подходит?`,

  noSlots: (service: string) =>
    `К сожалению, на этот день нет свободных окошек для *${service}*. На какой день записать?`,

  unknown: () =>
    `Не совсем поняла 😊\n\nМогу помочь:\n• *Записаться* — напишите услугу и время\n• *Отменить* — напишите "отмена"\n• *Перенести* — напишите "перенести"`,

  noActiveBooking: () =>
    `У вас нет активных записей. Хотите записаться? Напишите название услуги 💅`,

  subscriptionExpired: () =>
    `Сервис временно недоступен. Пожалуйста, свяжитесь с нами напрямую.`,
}
