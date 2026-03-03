import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer } from '../../../index.js'
import { config } from '../../../../config/index.js'

// Integration tests for email-details route ''
describe('email-details integration', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  it('GET /notify/register/email-details returns 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/notify/register/email-details'
    })
    expect(res.statusCode).toBe(200)
    expect(res.result).toContain('What is your email address?')
  })

  it('POST /notify/register/email-details validation error', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/notify/register/email-details',
      payload: { notifyByEmail: '' }
    })
    expect(res.statusCode).toBe(200) // stays on page with error
    expect(res.result).toContain('Enter your email address')
  })

  it('POST /notify/register/email-details success redirects', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/notify/register/email-details',
      payload: { notifyByEmail: 'user@example.com' }
    })
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe(config.get('notify.emailVerifyEmailPath'))
  })
})
