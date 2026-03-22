import { describe, it, expect } from 'vitest'
import { notifyService } from './notify-service.js'

describe('helpers/notify-service stub', () => {
  it('returns success payload when sending SMS code', async () => {
    const result = await notifyService.sendSmsCode('07123456789', '12345')

    expect(result.success).toBe(true)
    expect(result.message).toContain('SMS sent')
    expect(result.messageId).toContain('stub-')
  })

  it('returns success payload when sending email code', async () => {
    const result = await notifyService.sendEmailCode(
      'user@example.com',
      '12345'
    )

    expect(result.success).toBe(true)
    expect(result.message).toContain('Email sent')
    expect(result.messageId).toContain('stub-')
  })

  it('verifies only 5-digit-length codes as valid', async () => {
    expect(await notifyService.verifyCode('12345')).toBe(true)
    expect(await notifyService.verifyCode('1234')).toBe(false)
    expect(await notifyService.verifyCode(undefined)).toBe(false)
  })
})
