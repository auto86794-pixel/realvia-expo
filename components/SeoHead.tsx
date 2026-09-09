import Head from 'expo-router/head'

const SITE_URL = 'https://www.realvia.hu'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

type Props = {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
  jsonLd?: Record<string, unknown>
}

export default function SeoHead({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd,
}: Props) {
  const canonical = new URL(path, SITE_URL).toString()
  const fullTitle = title.includes('Realvia')
    ? title
    : `${title} | Realvia`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large'
        }
      />
      <link rel="canonical" href={canonical} />
      <meta property="og:locale" content="hu_HU" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Realvia" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  )
}
