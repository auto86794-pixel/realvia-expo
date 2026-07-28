import { supabase } from './supabase'

const appUrl =
  process.env.EXPO_PUBLIC_APP_URL ||
  'https://www.realvia.hu'

export async function uploadPropertyImage(
  uri: string,
  contentType = 'image/jpeg'
) {
  const imageResponse = await fetch(uri)

  if (!imageResponse.ok) {
    throw new Error('A kiválasztott kép nem olvasható.')
  }

  const blob = await imageResponse.blob()
  const {
    data: { session },
  } = await supabase.auth.getSession({
    forceFetch: true,
  })

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
        'Content-Type':
          blob.type || contentType,
      },
    }
  )

  const responseText =
    await uploadResponse.text()

  let result: {
    url?: string
    error?: string
  } = {}

  try {
    result = responseText
      ? JSON.parse(responseText)
      : {}
  } catch {
    result = {
      error:
        'A képfeltöltő szerver nem megfelelő választ adott.',
    }
  }

  if (!uploadResponse.ok || !result.url) {
    throw new Error(
      result.error ||
        'A képfeltöltés sikertelen.'
    )
  }

  return result.url
}
