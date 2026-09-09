import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

mkdirSync(dist, { recursive: true })

for (const file of ['robots.txt', 'sitemap.xml']) {
  copyFileSync(resolve(root, 'public', file), resolve(dist, file))
}

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
