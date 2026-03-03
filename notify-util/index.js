import crypto from 'crypto'

// URL-safe base64 helpers
export function toBase64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function fromBase64Url(str) {
  const pad = 4 - (str.length % 4 || 4)
  const normalized =
    str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad === 4 ? 0 : pad)
  return Buffer.from(normalized, 'base64')
}

export function createHmacSignature(payloadStr, secret) {
  const hmac = crypto.createHmac('sha256', String(secret || ''))
  hmac.update(payloadStr, 'utf8')
  return toBase64Url(hmac.digest())
}

export function generateUnsubscribeToken(
  subscriptionId,
  secret,
  expiresInSec = 24 * 60 * 60
) {
  if (!subscriptionId) {
    throw new Error('subscriptionId is required')
  }
  if (!secret) {
    throw new Error('secret is required')
  }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sid: String(subscriptionId),
    iat: now,
    exp: now + Math.max(60, Number(expiresInSec) || 0),
    typ: 'unsubscribe'
  }
  const payloadStr = JSON.stringify(payload)
  const sig = createHmacSignature(payloadStr, secret)
  const token = `${toBase64Url(Buffer.from(payloadStr, 'utf8'))}.${sig}`
  return token
}

export function verifyUnsubscribeToken(token, secret) {
  if (!token) {
    throw new Error('token is required')
  }
  if (!secret) {
    throw new Error('secret is required')
  }
  const parts = String(token).split('.')
  if (parts.length !== 2) {
    throw new Error('invalid token format')
  }
  const [b64Payload, sig] = parts
  const payloadStr = fromBase64Url(b64Payload).toString('utf8')
  const expectedSig = createHmacSignature(payloadStr, secret)
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    throw new Error('invalid signature')
  }
  const payload = JSON.parse(payloadStr)
  if (payload.typ !== 'unsubscribe') {
    throw new Error('invalid token type')
  }
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    throw new Error('token expired')
  }
  return payload
}

export function buildUnsubscribeLink(baseUrl, subscriptionId, token) {
  if (!baseUrl) {
    throw new Error('baseUrl is required')
  }
  if (!subscriptionId) {
    throw new Error('subscriptionId is required')
  }
  if (!token) {
    throw new Error('token is required')
  }
  const url = new URL(baseUrl)
  url.searchParams.set('sid', String(subscriptionId))
  url.searchParams.set('token', String(token))
  return url.toString()
}

// Redaction helpers
export function redactPhone(phone) {
  const s = String(phone || '').replace(/\s+/g, '')
  if (!s) {
    return ''
  }
  const tail = s.slice(-4)
  return `******${tail}`
}

export function redactEmail(email) {
  const s = String(email || '').trim()
  if (!s || !s.includes('@')) {
    return ''
  }
  const [local, domain] = s.split('@')
  if (!local) {
    return `*@${domain}`
  }
  if (local.length <= 2) {
    return `*${local.slice(-1)}@${domain}`
  }
  return `${local[0]}***${local.slice(-1)}@${domain}`
}

function redactValue(key, value) {
  const k = String(key || '').toLowerCase()
  if (k.includes('phone') || k.includes('mobile') || k.includes('msisdn')) {
    return redactPhone(value)
  }
  if (k.includes('email')) {
    return redactEmail(value)
  }
  if (k.includes('token') || k.includes('secret')) {
    return '***'
  }
  return value
}

export function redactObject(
  obj,
  keysToRedact = ['phone', 'mobile', 'msisdn', 'email', 'token', 'secret']
) {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }
  const isArr = Array.isArray(obj)
  const out = isArr ? [] : {}
  const keySet = new Set(keysToRedact.map((k) => String(k).toLowerCase()))
  const entries = isArr ? obj.map((v, i) => [i, v]) : Object.entries(obj)
  for (const [k, v] of entries) {
    if (v && typeof v === 'object') {
      out[k] = redactObject(v, keysToRedact)
    } else {
      const shouldRedact = keySet.has(String(k).toLowerCase())
      out[k] = shouldRedact ? redactValue(k, v) : v
    }
  }
  return out
}

// Inbound SMS command parsing
// Supported patterns:
// - "STOP" (global)
// - "STOP <code>" (specific), optional prefix validation via options.prefix
export function parseInboundSmsCommand(text, options = {}) {
  const prefix = options.prefix ? String(options.prefix).toUpperCase() : null
  const s = String(text || '')
    .trim()
    .toUpperCase()
  if (!s) {
    return { action: 'UNKNOWN' }
  }
  const m = s.match(/^STOP(?:\s+([A-Z0-9-]+))?$/i)
  if (!m) {
    return { action: 'UNKNOWN' }
  }
  const code = m[1] ? m[1].toUpperCase() : null
  if (!code) {
    return { action: 'STOP', scope: 'global' }
  }
  if (prefix && !code.startsWith(prefix)) {
    return { action: 'STOP', scope: 'global' }
  }
  return { action: 'STOP', scope: 'specific', code }
}

export default {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  buildUnsubscribeLink,
  redactPhone,
  redactEmail,
  redactObject,
  parseInboundSmsCommand,
  toBase64Url,
  fromBase64Url,
  createHmacSignature
}
