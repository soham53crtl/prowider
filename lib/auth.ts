const COOKIE_NAME = 'prowider_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export { COOKIE_NAME, COOKIE_MAX_AGE }

async function getKey(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  )
}

export async function signToken(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'prowider-fallback-secret'
  const key = await getKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${payload}.${sigB64}`
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return false
    const payload = token.slice(0, lastDot)
    const sigB64 = token.slice(lastDot + 1)
    const secret = process.env.SESSION_SECRET ?? 'prowider-fallback-secret'
    const key = await getKey(secret, ['verify'])
    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(payload))
  } catch {
    return false
  }
}
