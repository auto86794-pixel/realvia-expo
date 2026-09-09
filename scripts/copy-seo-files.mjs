import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@neondatabase/neon-js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

mkdirSync(dist, { recursive: true })

copyFileSync(resolve(root, 'public', 'robots.txt'), resolve(dist, 'robots.txt'))

const fallbackSitemap = readFileSync(
  resolve(root, 'public', 'sitemap.xml'),
  'utf8'
)

async function createSitemap() {
  const authUrl = process.env.EXPO_PUBLIC_NEON_AUTH_URL
  const dataApiUrl = process.env.EXPO_PUBLIC_NEON_DATA_API_URL

  if (!authUrl || !dataApiUrl) {
    console.warn(
      'Neon build variables are unavailable; keeping the static homepage sitemap.'
    )
    return fallbackSitemap
  }

  try {
    const client = createClient({
      auth: {
        url: authUrl,
        allowAnonymous: true,
      },
      dataApi: {
        url: dataApiUrl,
      },
    })

    const { data, error } = await client
      .from('properties')
      .select('id,status')
      .in('status', ['published', 'sold'])
      .order('id', { ascending: false })

    if (error) {
      throw error
    }

    const propertyUrls = (data ?? [])
      .map(({ id }) => Number(id))
      .filter(Number.isInteger)
      .map(
        (id) => `  <url>
    <loc>https://www.realvia.hu/property/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.realvia.hu/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${propertyUrls ? `\n${propertyUrls}` : ''}
</urlset>
`
  } catch (error) {
    console.warn(
      'Dynamic sitemap generation failed; keeping the static homepage sitemap.',
      error
    )
    return fallbackSitemap
  }
}

writeFileSync(resolve(dist, 'sitemap.xml'), await createSitemap())

copyFileSync(
  resolve(root, 'assets', 'images', 'realvia-home-sunrise.png'),
  resolve(dist, 'og-image.png')
)

const indexPath = resolve(dist, 'index.html')
const indexHtml = readFileSync(indexPath, 'utf8')
  .replace('<html lang="en">', '<html lang="hu">')
  .replace(
    '<title>realvia-app</title>',
    `<title>Eladó ingatlanok Debrecenben és Hajdú-Biharban | Realvia</title>
    <meta name="description" content="Válogatott eladó lakások, családi házak és prémium ingatlanok Debrecenben és Hajdú-Biharban. Böngészd a Realvia aktuális kínálatát." />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="https://www.realvia.hu/" />
    <meta property="og:locale" content="hu_HU" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Realvia" />
    <meta property="og:title" content="Eladó ingatlanok Debrecenben és Hajdú-Biharban | Realvia" />
    <meta property="og:description" content="Válogatott eladó lakások, családi házak és prémium ingatlanok Debrecenben és Hajdú-Biharban." />
    <meta property="og:url" content="https://www.realvia.hu/" />
    <meta property="og:image" content="https://www.realvia.hu/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />`
  )

writeFileSync(indexPath, indexHtml)

console.log('SEO files copied and index.html metadata updated.')
