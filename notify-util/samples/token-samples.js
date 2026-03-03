import {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  buildUnsubscribeLink,
  toBase64Url,
  fromBase64Url,
  createHmacSignature
} from '../index.js'

// Sample inputs
const subscriptionId = 'sub_12345'
const secret = 'test-secret'
const expiresInSec = 60 * 60 // 1 hour
const baseUrl = 'https://example.com/unsubscribe'

// Demonstrate token generation and verification
try {
  const token = generateUnsubscribeToken(subscriptionId, secret, expiresInSec)
  console.log('[Token] Generated:', token)

  const payload = verifyUnsubscribeToken(token, secret)
  console.log('[Token] Verified payload:', payload)

  const link = buildUnsubscribeLink(baseUrl, subscriptionId, token)
  console.log('[Link] Unsubscribe URL:', link)
} catch (err) {
  console.error('[Token] Error:', err.message)
}

// Demonstrate base64url helpers
const demoBuffer = Buffer.from('hello world', 'utf8')
const b64url = toBase64Url(demoBuffer)
console.log('[Base64Url] Encoded:', b64url)
console.log('[Base64Url] Decoded:', fromBase64Url(b64url).toString('utf8'))

// Demonstrate HMAC signature creation for an arbitrary payload
const arbitraryPayload = JSON.stringify({ foo: 'bar', n: 42 })
const signature = createHmacSignature(arbitraryPayload, secret)
console.log('[HMAC] Signature:', signature)
