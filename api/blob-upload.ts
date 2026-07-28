import { put } from '@vercel/blob'

export const config = {
  api: {
    bodyParser: false,
  },
}

function getAuthBaseUrl() {
  const value =
    process.env.NEON_AUTH_BASE_URL ||
    process.env.EXPO_PUBLIC_NEON_AUTH_URL

  if (!value) {
    throw new Error('NEON_AUTH_BASE_URL is not configured.')
  }

  return value.replace(/\/$/, '')
}

async function verifyUser(request: any) {
  const authorization =
    request.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const sessionResponse = await fetch(
    `${getAuthBaseUrl()}/get-session`,
    {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
    }
  )

  if (!sessionResponse.ok) {
    throw new Error('Unauthorized')
  }

  const sessionData =
    await sessionResponse.json()

  if (
    !sessionData?.user &&
    !sessionData?.session?.user
  ) {
    throw new Error('Unauthorized')
  }
}

export default async function handler(
  request: any,
  response: any
) {
  try {
    if (request.method !== 'POST') {
      response.status(405).json({
        error: 'Method not allowed',
      })
      return
    }

    await verifyUser(request)

    const contentType = String(
      request.headers['content-type'] || 'image/jpeg'
    ).split(';')[0]
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(contentType)) {
      response.status(415).json({
        error: 'Nem támogatott képtípus.',
      })
      return
    }

    const chunks: Buffer[] = []

    for await (const chunk of request) {
      chunks.push(Buffer.from(chunk))
    }

    const file = Buffer.concat(chunks)

    if (file.length > 4 * 1024 * 1024) {
      response.status(413).json({
        error: 'A kép legfeljebb 4 MB lehet.',
      })
      return
    }

    const extension =
      contentType.split('/')[1].replace('jpeg', 'jpg')
    const pathname =
      `properties/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`

    const result = await put(pathname, file, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    })

    response.status(200).json({ url: result.url })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Upload failed'
    console.error('Blob upload failed:', error)

    const status =
      message === 'Unauthorized'
        ? 401
        : message.includes('configured')
          ? 500
          : 400

    response.status(status).json({ error: message })
  }
}
