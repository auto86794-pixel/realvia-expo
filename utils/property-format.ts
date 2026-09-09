const BOLD_MARKDOWN = /\*\*(.*?)\*\*/g
const MARKDOWN_HEADING = /^#{1,6}\s+/gm

export function formatPropertyPrice(price: string | number) {
  if (typeof price === 'string' && /Ft/i.test(price)) {
    return price
  }

  const value = Number(price)

  if (!Number.isFinite(value)) {
    return String(price ?? '')
  }

  if (value > 0 && value < 10_000) {
    return `${value.toLocaleString('hu-HU', {
      maximumFractionDigits: 2,
    })} M Ft`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('hu-HU', {
      maximumFractionDigits: 2,
    })} M Ft`
  }

  return `${value.toLocaleString('hu-HU')} Ft`
}

export function plainPropertyText(value?: string) {
  return (value || '')
    .replace(BOLD_MARKDOWN, '$1')
    .replace(MARKDOWN_HEADING, '')
    .trim()
}

export function seoDescription(value?: string, fallback = '') {
  const text = plainPropertyText(value || fallback).replace(/\s+/g, ' ')

  return text.length > 155
    ? `${text.slice(0, 152).trimEnd()}…`
    : text
}
