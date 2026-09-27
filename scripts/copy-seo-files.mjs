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
const siteUrl = 'https://www.realvia.hu'

mkdirSync(dist, { recursive: true })
copyFileSync(resolve(root, 'public', 'robots.txt'), resolve(dist, 'robots.txt'))
copyFileSync(resolve(root, 'assets', 'images', 'realvia-home-sunrise.png'), resolve(dist, 'og-image.png'))

const fallbackSitemap = readFileSync(resolve(root, 'public', 'sitemap.xml'), 'utf8')

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function plainText(value = '') {
  return String(value)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function seoDescription(value, fallback = '') {
  const text = plainText(value || fallback)
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}…` : text
}

function formatPrice(price) {
  const value = Number(price)
  if (!Number.isFinite(value)) return String(price ?? '')
  if (value > 0 && value < 10000) return `${value.toLocaleString('hu-HU', { maximumFractionDigits: 2 })} M Ft`
  if (value >= 1000000) return `${(value / 1000000).toLocaleString('hu-HU', { maximumFractionDigits: 2 })} M Ft`
  return `${value.toLocaleString('hu-HU')} Ft`
}

function priceInForints(price) {
  const value = Number(price)
  if (!Number.isFinite(value)) return undefined
  return value > 0 && value < 10000 ? value * 1000000 : value
}

async function loadPublicProperties() {
  const authUrl = process.env.EXPO_PUBLIC_NEON_AUTH_URL
  const dataApiUrl = process.env.EXPO_PUBLIC_NEON_DATA_API_URL

  if (!authUrl || !dataApiUrl) {
    console.warn('SEO: Neon build variables are unavailable. Homepage sitemap fallback will be used.')
    return []
  }

  const client = createClient({
    auth: { url: authUrl, allowAnonymous: true },
    dataApi: { url: dataApiUrl },
  })

  const { data, error } = await client
    .from('properties')
    .select('id,title,location,description,price,image,images,status,updated_at')
    .in('status', ['published', 'sold'])
    .order('id', { ascending: false })

  if (error) throw error
  return data ?? []
}

function createSitemap(properties) {
  const propertyUrls = properties.map((property) => {
    const lastmod = property.updated_at
      ? `\n    <lastmod>${escapeXml(new Date(property.updated_at).toISOString())}</lastmod>`
      : ''
    return `  <url>\n    <loc>${siteUrl}/property/${Number(property.id)}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>${propertyUrls ? `\n${propertyUrls}` : ''}\n</urlset>\n`
}

function homepageHtml(html) {
  return html
    .replace('<html lang="en">', '<html lang="hu">')
    .replace(/<title>.*?<\/title>/s, `<title>Eladó ingatlanok Debrecenben és Hajdú-Biharban | Realvia</title>\n    <meta name="description" content="Válogatott eladó lakások, családi házak és prémium ingatlanok Debrecenben és Hajdú-Biharban. Böngészd a Realvia aktuális kínálatát." />\n    <meta name="robots" content="index, follow, max-image-preview:large" />\n    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:locale" content="hu_HU" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Realvia" />\n    <meta property="og:title" content="Eladó ingatlanok Debrecenben és Hajdú-Biharban | Realvia" />\n    <meta property="og:description" content="Válogatott eladó lakások, családi házak és prémium ingatlanok Debrecenben és Hajdú-Biharban." />\n    <meta property="og:url" content="${siteUrl}/" />\n    <meta property="og:image" content="${siteUrl}/og-image.png" />\n    <meta name="twitter:card" content="summary_large_image" />`)
}

function propertyHtml(baseHtml, property) {
  const id = Number(property.id)
  const title = plainText(property.title) || 'Eladó ingatlan'
  const location = plainText(property.location) || 'Debrecen'
  const price = formatPrice(property.price)
  const description = seoDescription(property.description, `${title}, ${location}. ${price}.`)
  const canonical = `${siteUrl}/property/${id}`
  const imageList = Array.isArray(property.images) ? property.images.filter(Boolean) : []
  const image = property.image || imageList[0] || `${siteUrl}/og-image.png`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description,
    url: canonical,
    image: imageList.length ? imageList : [image],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'HUF',
      price: priceInForints(property.price),
      availability: property.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'HU',
    },
  }
  const safeJsonLd = JSON.stringify(jsonLd).replaceAll('<', '\\u003c')

  return baseHtml
    .replace('<html lang="en">', '<html lang="hu">')
    .replace(/<title>.*?<\/title>/s, `<title>${escapeXml(title)} – ${escapeXml(location)} | Realvia</title>\n    <meta name="description" content="${escapeXml(description)}" />\n    <meta name="robots" content="index, follow, max-image-preview:large" />\n    <link rel="canonical" href="${canonical}" />\n    <meta property="og:locale" content="hu_HU" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Realvia" />\n    <meta property="og:title" content="${escapeXml(title)} – ${escapeXml(location)} | Realvia" />\n    <meta property="og:description" content="${escapeXml(description)}" />\n    <meta property="og:url" content="${canonical}" />\n    <meta property="og:image" content="${escapeXml(image)}" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <script type="application/ld+json">${safeJsonLd}</script>`)
}

const indexPath = resolve(dist, 'index.html')
const exportedHtml = readFileSync(indexPath, 'utf8')
let properties = []

try {
  properties = await loadPublicProperties()
  console.log(`SEO: ${properties.length} public property URL(s) loaded.`)
} catch (error) {
  console.warn('SEO: property loading failed; homepage-only sitemap fallback will be used.', error)
}

writeFileSync(resolve(dist, 'sitemap.xml'), properties.length ? createSitemap(properties) : fallbackSitemap)
writeFileSync(indexPath, homepageHtml(exportedHtml))

for (const property of properties) {
  const id = Number(property.id)
  if (!Number.isInteger(id)) continue
  const propertyDir = resolve(dist, 'property')
  mkdirSync(propertyDir, { recursive: true })
  writeFileSync(resolve(propertyDir, `${id}.html`), propertyHtml(exportedHtml, property))
}

console.log('SEO: robots, sitemap, homepage metadata and property landing HTML files are ready.')
