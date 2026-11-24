export function uid(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${prefix}_${random}${time}`
}

export function makeDid() {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let body = 'z6Mkdemo'
  for (let index = 0; index < 24; index += 1) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `did:key:${body}`
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
