import { neon } from '@neondatabase/serverless'
import { del, list } from '@vercel/blob'

function getAuthBaseUrl() {
  const value =
    process.env.NEON_AUTH_BASE_URL ||
    process.env.EXPO_PUBLIC_NEON_AUTH_URL

  if (!value) {
    throw new Error(
      'NEON_AUTH_BASE_URL is not configured.'
    )
  }

  return value.replace(/\/$/, '')
}

function getDatabaseUrl() {
  const value =
    process.env.DATABASE_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL

  if (!value) {
    throw new Error(
      'DATABASE_POSTGRES_URL is not configured.'
    )
  }

  return value
}

async function verifyUser(request: any) {
  const authorization =
    request.headers.authorization

  if (
    !authorization?.startsWith('Bearer ')
  ) {
    throw new Error('Unauthorized')
  }

  const {
    createRemoteJWKSet,
    jwtVerify,
  } = await import('jose')

  const jwks = createRemoteJWKSet(
    new URL(
      `${getAuthBaseUrl()}/.well-known/jwks.json`
    )
  )

  const { payload } = await jwtVerify(
    authorization.slice(7),
    jwks
  )

  if (!payload.sub) {
    throw new Error('Unauthorized')
  }

  return payload.sub
}

function normalizeGallery(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === 'string'
    )
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)

      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is string =>
              typeof item === 'string'
          )
        : []
    } catch {
      return value ? [value] : []
    }
  }

  return []
}

function propertyUrls(row: any) {
  return Array.from(
    new Set([
      ...(row?.image
        ? [row.image]
        : []),
      ...normalizeGallery(row?.gallery),
    ])
  )
}

function isManagedBlobUrl(
  value: string
) {
  try {
    const url = new URL(value)

    return (
      url.protocol === 'https:' &&
      url.hostname.endsWith(
        '.blob.vercel-storage.com'
      )
    )
  } catch {
    return false
  }
}

/**
 * PostgreSQL text[] literal készítése.
 *
 * A properties.gallery oszlop text[],
 * ezért nem JSONB-ként mentjük.
 */
function toPostgresTextArray(
  values: string[]
) {
  const escaped = values.map(
    (value) =>
      `"${value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')}"`
  )

  return `{${escaped.join(',')}}`
}

export default async function handler(
  request: any,
  response: any
) {
  try {
    const userId =
      await verifyUser(request)

    const sql = neon(getDatabaseUrl())

    // --------------------------------
    // TÁRHELYHASZNÁLAT
    // --------------------------------

    if (request.method === 'GET') {
      const properties = await sql`
        select image, gallery
        from public.properties
        where owner_id = ${userId}
      `

      const ownedUrls = new Set(
        properties.flatMap(propertyUrls)
      )

      let cursor:
        | string
        | undefined

      let bytes = 0
      let files = 0

      do {
        const page = await list({
          limit: 1000,
          cursor,
        })

        for (
          const blob of page.blobs
        ) {
          if (
            ownedUrls.has(blob.url)
          ) {
            bytes += blob.size
            files += 1
          }
        }

        cursor = page.hasMore
          ? page.cursor
          : undefined
      } while (cursor)

      response.status(200).json({
        bytes,
        megabytes:
          Math.round(
            (bytes /
              1024 /
              1024) *
              10
          ) / 10,
        files,
      })

      return
    }

    // --------------------------------
    // CSAK POST ENGEDÉLYEZETT
    // --------------------------------

    if (
      request.method !== 'POST'
    ) {
      response.status(405).json({
        error:
          'Method not allowed',
      })

      return
    }

    const {
      action,
      propertyId,
    } = request.body || {}

    if (!propertyId) {
      response.status(400).json({
        error:
          'Hiányzó ingatlanazonosító.',
      })

      return
    }

    // --------------------------------
    // INGATLAN + KÉPEK TÖRLÉSE
    // --------------------------------

    if (
      action ===
      'delete-property'
    ) {
      const deleted = await sql`
        delete from public.properties
        where id =
          ${String(
            propertyId
          )}::bigint
          and owner_id =
            ${userId}
        returning image, gallery
      `

      if (!deleted.length) {
        response.status(404).json({
          error:
            'Az ingatlan nem található vagy nem a sajátod.',
        })

        return
      }

      const urls =
        propertyUrls(
          deleted[0]
        ).filter(
          isManagedBlobUrl
        )

      if (urls.length) {
        await del(urls)
      }

      response.status(200).json({
        deleted: true,
        deletedImages:
          urls.length,
      })

      return
    }

    // --------------------------------
    // INGATLAN KÉPEINEK SZINKRONIZÁLÁSA
    // --------------------------------

    if (
      action ===
      'sync-property-images'
    ) {
      const images =
        Array.isArray(
          request.body?.images
        )
          ? request.body.images.filter(
              (
                item: unknown
              ): item is string =>
                typeof item ===
                'string'
            )
          : []

      if (
        !images.length ||
        images.length > 10 ||
        images.some(
          (url: string) =>
            !isManagedBlobUrl(
              url
            )
        )
      ) {
        response.status(400).json({
          error:
            '1–10 érvényes Blob-kép szükséges.',
        })

        return
      }

      // Jelenlegi képek lekérése
      // a később törlendő fájlokhoz.

      const current = await sql`
        select image, gallery
        from public.properties
        where id =
          ${String(
            propertyId
          )}::bigint
          and owner_id =
            ${userId}
        limit 1
      `

      if (!current.length) {
        response.status(404).json({
          error:
            'Az ingatlan nem található vagy nem a sajátod.',
        })

        return
      }

      /*
       * FONTOS:
       *
       * A gallery oszlop PostgreSQL
       * text[] típusú.
       *
       * Korábban:
       *
       * JSON.stringify(images)::jsonb
       *
       * került ide, ami:
       *
       * text[] vs jsonb
       *
       * adatbázis-hibát okozott.
       */

      const gallery =
        toPostgresTextArray(
          images
        )

      await sql`
        update public.properties
        set
          image = ${images[0]},
          gallery =
            ${gallery}::text[]
        where id =
          ${String(
            propertyId
          )}::bigint
          and owner_id =
            ${userId}
      `

      // --------------------------------
      // MÁR NEM HASZNÁLT KÉPEK TÖRLÉSE
      // --------------------------------

      const keep =
        new Set(images)

      const removed =
        propertyUrls(
          current[0]
        )
          .filter(
            (url) =>
              !keep.has(url)
          )
          .filter(
            isManagedBlobUrl
          )

      if (removed.length) {
        await del(removed)
      }

      response.status(200).json({
        updated: true,
        deletedImages:
          removed.length,
      })

      return
    }

    // --------------------------------
    // GAZDÁTLAN, SAJÁT FELTÖLTÉSEK TAKARÍTÁSA
    // --------------------------------

    if (action === 'delete-uploaded-images') {
      const images = Array.isArray(request.body?.images)
        ? request.body.images.filter((item: unknown): item is string => typeof item === 'string')
        : []

      const ownedPrefix = `properties/${userId}/`
      const safeUrls = images.filter((value: string) => {
        if (!isManagedBlobUrl(value)) return false
        try {
          const pathname = decodeURIComponent(new URL(value).pathname).replace(/^\//, '')
          return pathname.startsWith(ownedPrefix)
        } catch {
          return false
        }
      })

      if (safeUrls.length) await del(Array.from(new Set(safeUrls)))
      response.status(200).json({ deletedImages: safeUrls.length })
      return
    }

    // --------------------------------
    // INGATLAN + KÉPLISTA EGYETLEN DB-MENTÉSBEN
    // --------------------------------

    if (action === 'update-property') {
      const property = request.body?.property || {}
      const images = Array.isArray(request.body?.images)
        ? request.body.images.filter((item: unknown): item is string => typeof item === 'string')
        : []
      const allowedStatuses = new Set(['published', 'sold', 'draft', 'inactive'])

      if (!images.length || images.length > 10 || images.some((url: string) => !isManagedBlobUrl(url))) {
        response.status(400).json({ error: '1–10 érvényes Blob-kép szükséges.' })
        return
      }
      if (!String(property.title || '').trim() || !String(property.location || '').trim()) {
        response.status(400).json({ error: 'A cím és a helyszín kötelező.' })
        return
      }
      if (!(Number(property.price) > 0) || !(Number(property.area) > 0)) {
        response.status(400).json({ error: 'Az ár és az alapterület legyen nullánál nagyobb.' })
        return
      }
      if (!allowedStatuses.has(String(property.status))) {
        response.status(400).json({ error: 'Érvénytelen hirdetésállapot.' })
        return
      }

      const current = await sql`
        select image, gallery
        from public.properties
        where id = ${String(propertyId)}::bigint and owner_id = ${userId}
        limit 1
      `
      if (!current.length) {
        response.status(404).json({ error: 'Az ingatlan nem található vagy nem a sajátod.' })
        return
      }

      const gallery = toPostgresTextArray(images)
      const updated = await sql`
        update public.properties
        set
          title = ${String(property.title).trim()},
          location = ${String(property.location).trim()},
          price = ${Number(property.price)},
          description = ${String(property.description || '').trim()},
          category = ${String(property.category || '').trim()},
          listing_type = ${String(property.listing_type || 'Eladó')},
          bedrooms = ${Number(property.bedrooms) || 0},
          bathrooms = ${Number(property.bathrooms) || 0},
          area = ${Number(property.area)},
          parking = ${Number(property.parking) || 0},
          status = ${String(property.status)},
          image = ${images[0]},
          gallery = ${gallery}::text[]
        where id = ${String(propertyId)}::bigint and owner_id = ${userId}
        returning id
      `

      if (!updated.length) {
        response.status(404).json({ error: 'Az ingatlan nem található vagy nem a sajátod.' })
        return
      }

      const keep = new Set(images)
      const removed = propertyUrls(current[0])
        .filter((url) => !keep.has(url))
        .filter(isManagedBlobUrl)

      // A DB-mentés már sikeres. A régi fájlok takarítása best-effort:
      // ennek hibája nem teheti "sikertelenné" a már elmentett hirdetést.
      if (removed.length) {
        try {
          await del(removed)
        } catch (cleanupError) {
          console.error('Old property image cleanup failed:', cleanupError)
        }
      }

      response.status(200).json({ updated: true, deletedImages: removed.length })
      return
    }

    // --------------------------------
    // ISMERETLEN MŰVELET
    // --------------------------------

    response.status(400).json({
      error:
        'Ismeretlen képművelet.',
    })
  } catch (error) {
    console.error(
      'Blob management failed:',
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : 'Blob management failed'

    response
      .status(
        message ===
          'Unauthorized'
          ? 401
          : 500
      )
      .json({
        error: message,
      })
  }
}