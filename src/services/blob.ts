import { supabase } from './supabase'
import { Platform } from 'react-native'

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

  const originalBlob = await imageResponse.blob()
  const blob = await optimizePropertyImage(originalBlob)
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

async function optimizePropertyImage(original: Blob) {
  if (Platform.OS !== 'web') return original

  try {
    const browser = globalThis as any
    const bitmap = await browser.createImageBitmap(original)
    const maxSide = 1920
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = browser.document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const optimized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.78)
    )

    return optimized || original
  } catch (error) {
    console.warn('Image optimization skipped:', error)
    return original
  }
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession({ forceFetch: true })

  if (!session?.access_token) {
    throw new Error('A művelethez be kell jelentkezned.')
  }

  return session.access_token
}

async function blobManagementRequest(body: Record<string, unknown>) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${appUrl}/api/blob-manage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'A képművelet sikertelen.')
  return result
}

export async function deletePropertyWithImages(propertyId: string | number) {
  return blobManagementRequest({ action: 'delete-property', propertyId })
}

export async function syncPropertyImages(
  propertyId: string | number,
  images: string[]
) {
  return blobManagementRequest({ action: 'sync-property-images', propertyId, images })
}

export async function getBlobUsage() {
  const accessToken = await getAccessToken()
  const response = await fetch(`${appUrl}/api/blob-manage`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'A tárhelyadatok nem tölthetők be.')
  return result as { bytes: number; megabytes: number; files: number }
}
