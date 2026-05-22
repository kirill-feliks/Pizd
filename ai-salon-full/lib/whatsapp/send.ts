export async function sendWhatsAppMessage(
  tenant: { wa_phone_number_id: string; wa_access_token: string },
  toPhone: string,
  message: string
): Promise<boolean> {
  try {
    const url = `https://graph.facebook.com/v19.0/${tenant.wa_phone_number_id}/messages`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tenant.wa_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone,
        type: 'text',
        text: { body: message },
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.error('[WA Send Error]', err)
      return false
    }
    return true
  } catch (e) {
    console.error('[WA Send Exception]', e)
    return false
  }
}
