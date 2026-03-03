import { redactPhone, redactEmail, redactObject } from '../index.js'

// Demonstrate phone redaction
console.log('[RedactPhone] 07700 900123 ->', redactPhone('07700 900123'))
console.log('[RedactPhone] +44 7700 900456 ->', redactPhone('+44 7700 900456'))
console.log('[RedactPhone] empty ->', redactPhone(''))

// Demonstrate email redaction
console.log(
  '[RedactEmail] john.doe@example.com ->',
  redactEmail('john.doe@example.com')
)
console.log('[RedactEmail] a@ex.com ->', redactEmail('a@ex.com'))
console.log('[RedactEmail] invalid ->', redactEmail('invalid'))

// Demonstrate deep object redaction
const sampleObj = {
  user: {
    name: 'Jane Doe',
    email: 'jane.doe@example.org',
    phone: '+44 7700 900789'
  },
  meta: {
    token: 'abc123',
    secret: 'shhh',
    preferences: {
      alerts: true,
      channels: ['sms', 'email']
    }
  }
}

const redacted = redactObject(sampleObj)
console.log('[RedactObject] result:', JSON.stringify(redacted, null, 2))
