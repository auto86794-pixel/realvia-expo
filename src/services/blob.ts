import { supabase } from './supabase'

const appUrl =
  process.env.EXPO_PUBLIC_APP_URL ||
  'https://www.realvia.hu'

export async function uploadPropertyImage(
  uri: string,
  contentType = 'image/jpeg'
) {
  const response = await fetch(uri)

  if (!response.ok) {
    throw new Error('A kiválasztott kép nem olvasható.')
  }

  const blob = await response.blob()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.access_token

  if (!accessToken) {
    throw new Error(
      'A képfeltöltéshez be kell jelentkezned.'
    )
  }

  const uploadResponse = await fetch(
    `${appUrl}/api/blob-upload`,
    {
      method: 'POST',
      body: blob,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
    }
  )

  const result = await uploadResponse.json()

  if (!uploadResponse.ok || !result.url) {
    throw new Error(
      result.error || 'A képfeltöltés sikertelen.'
    )
  }

  return result.url as string
}
