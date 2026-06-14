export async function sendInquiry({
  propertyId,
  customerName,
  customerEmail,
  customerPhone,
  message,
}: {
  propertyId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  message: string
}) {
  const response = await fetch(
    'https://wbnqrwvvfygdzvxctlco.supabase.co/functions/v1/inquiry',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        propertyId,
        customerName,
        customerEmail,
        customerPhone,
        message,
      }),
    }
  )

  const data = await response.json()

  if (!data.success) {
    throw new Error(
      'Sikertelen érdeklődés küldés'
    )
  }

  return data
}