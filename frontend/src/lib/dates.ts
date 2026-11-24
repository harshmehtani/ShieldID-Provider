export function parseDay(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(iso.length <= 10 ? parseDay(iso) : new Date(iso))
}

export function formatOptionalDate(iso?: string) {
  return iso ? formatDate(iso) : 'No expiration date set'
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function endOfDay(iso: string) {
  const date = parseDay(iso)
  date.setHours(23, 59, 59, 999)
  return date
}

export function isPastDay(iso: string, now = new Date()) {
  return now.getTime() > endOfDay(iso).getTime()
}

export function daysUntil(iso: string, now = new Date()) {
  return Math.ceil((endOfDay(iso).getTime() - now.getTime()) / 86_400_000)
}

export function todayInputValue() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
