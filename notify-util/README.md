# notify-util

Utility helpers for GOV.UK Notify integration and per-subscription unsubscribe flows.

This folder contains reusable, framework-agnostic helpers to:

- Build and verify signed unsubscribe tokens/links for specific subscriptions
- Redact personally identifiable information (PII) in logs (email/phone)
- Parse inbound SMS commands (e.g., STOP with optional code)

These utilities are intentionally decoupled from route handlers and persistence. Integrate them within controllers/services as needed.

## Functions

- buildUnsubscribeLink(baseUrl, subscriptionId, token)
  - Returns a full unsubscribe URL for a specific subscription.
- generateUnsubscribeToken(subscriptionId, secret, expiresInSec?)
  - Creates a signed token (URL-safe) with expiry for an unsubscribe action.
- verifyUnsubscribeToken(token, secret)
  - Validates signature and expiry; returns the decoded payload if valid.
- redactPhone(phone)
  - Masks a phone number to last 4 digits.
- redactEmail(email)
  - Masks an email address by keeping the first/last letter of the local part and the domain.
- redactObject(obj, keysToRedact?)
  - Deeply clones and redacts values for provided keys using best-effort masking.
- parseInboundSmsCommand(text, options?)
  - Detects commands like "STOP" or "STOP AQ123" and returns structured intent for handling.

## Security Notes

- Do not log raw tokens or secrets. Use the redaction helpers for any PII in logs.
- Keep `secret` values in environment variables.
- Tokens include an expiry (`exp`) and an HMAC signature to prevent tampering.

## Example

```js
const {
  buildUnsubscribeLink,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  redactPhone,
  redactEmail,
  parseInboundSmsCommand
} = require('./index')

const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
const subscriptionId = 'sub_123'

const token = generateUnsubscribeToken(subscriptionId, secret, 24 * 60 * 60)
const url = buildUnsubscribeLink(
  'https://service.gov.uk/unsubscribe',
  subscriptionId,
  token
)

// Later, on GET/POST /unsubscribe
const payload = verifyUnsubscribeToken(token, secret) // throws if invalid/expired
```

''
