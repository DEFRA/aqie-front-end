import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

import { setupAlert } from '../../../common/services/notify.js'
import { createServer } from '../../../index.js'

vi.mock('../../../common/services/notify.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    setupAlert: vi.fn()
  }
})

const HTTP_STATUS_OK = 200
const HTTP_STATUS_FOUND = 302

const getSessionCookie = (response) => {
  const setCookieHeader = response.headers['set-cookie']
  if (!setCookieHeader?.length) {
    return ''
  }

  return setCookieHeader[0].split(';')[0]
}

describe('sms-confirm-details integration', () => {
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

  it('POST journey returns to sms-mobile-number with inline max-alerts error on setup-alert 400', async () => {
    setupAlert.mockResolvedValueOnce({
      ok: false,
      status: 400,
      body: { message: 'Maximum number of locations reached' }
    })

    const smsNumberResponse = await server.inject({
      method: 'POST',
      url: '/notify/register/sms-mobile-number?location=London&locationId=london-123&lat=51.5074&long=-0.1278',
      payload: { notifyByText: '07123456789' }
    })

    expect(smsNumberResponse.statusCode).toBe(HTTP_STATUS_FOUND)

    let sessionCookie = getSessionCookie(smsNumberResponse)

    const confirmResponse = await server.inject({
      method: 'POST',
      url: '/notify/register/sms-confirm-details',
      headers: {
        cookie: sessionCookie
      },
      payload: { confirmDetails: 'yes' }
    })

    expect(confirmResponse.statusCode).toBe(HTTP_STATUS_FOUND)
    expect(confirmResponse.headers.location).toBe(
      '/notify/register/sms-mobile-number'
    )

    sessionCookie = getSessionCookie(confirmResponse) || sessionCookie

    const smsInputPageResponse = await server.inject({
      method: 'GET',
      url: '/notify/register/sms-mobile-number',
      headers: {
        cookie: sessionCookie
      }
    })

    expect(smsInputPageResponse.statusCode).toBe(HTTP_STATUS_OK)
    expect(smsInputPageResponse.result).toContain(
      'maximum of 5 alerts for 07123456789'
    )
    expect(smsInputPageResponse.result).toContain(
      'Enter a UK mobile phone number, like 07700 900 982'
    )
  })
})
