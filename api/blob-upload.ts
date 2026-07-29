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

  const token = authorization.slice(7)

  // jose is ESM-only. A dynamic import keeps Vercel from compiling it
  // into CommonJS require(), which caused ERR_REQUIRE_ESM.
  const {
    createRemoteJWKSet,
    jwtVerify,
  } = await import('jose')

  const jwks = createRemoteJWKSet(
    new URL(
      `${getAuthBaseUrl()}/.well-known/jwks.json`
    )
  )

  const { payload } = await jwtVerify(token, jwks)
  if (!payload.sub) throw new Error('Unauthorized')
  return payload.sub
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

    const userId = await verifyUser(request)

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
      `properties/${userId}/${Date.now()}-${Math.random()
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
