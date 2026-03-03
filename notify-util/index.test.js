import { describe, it, expect } from 'vitest'
import * as util from './index.js'

describe('notify-util', () => {
  it('generates and verifies unsubscribe token', () => {
    const secret = 'test-secret'
    const sid = 'sub_123'
    const token = util.generateUnsubscribeToken(sid, secret, 60)
    const payload = util.verifyUnsubscribeToken(token, secret)
    expect(payload.sid).toBe(sid)
    expect(payload.typ).toBe('unsubscribe')
    expect(payload.exp).toBeGreaterThan(payload.iat)
  })

  it('rejects tampered token', () => {
    const secret = 'test-secret'
    const sid = 'sub_123'
    const token = util.generateUnsubscribeToken(sid, secret, 60)
    const parts = token.split('.')
    const payload = JSON.parse(
      Buffer.from(util.fromBase64Url(parts[0])).toString('utf8')
    )
    payload.sid = 'sub_999'
    const tampered = `${util.toBase64Url(Buffer.from(JSON.stringify(payload)))}.${parts[1]}`
    expect(() => util.verifyUnsubscribeToken(tampered, secret)).toThrow()
  })

  it('builds unsubscribe link with params', () => {
    const url = util.buildUnsubscribeLink(
      'https://service.gov.uk/unsubscribe',
      'sub_1',
      'tok_abc'
    )
    expect(url).toContain('sid=sub_1')
    expect(url).toContain('token=tok_abc')
  })

  it('redacts phone and email', () => {
    expect(util.redactPhone('07700900123')).toMatch(/\*{6}0123$/)
    expect(util.redactEmail('alice@example.com')).toMatch(
      /a\*\*\*e@example\.com/i
    )
  })

  it('redacts keys within object', () => {
    const input = {
      phone: '07700900123',
      email: 'alice@example.com',
      keep: 'ok'
    }
    const out = util.redactObject(input)
    expect(out.keep).toBe('ok')
    expect(out.phone).toMatch(/\*{6}0123$/)
    expect(out.email).toMatch(/\*\*\*/)
  })

  it('parses STOP commands', () => {
    expect(util.parseInboundSmsCommand('STOP')).toEqual({
      action: 'STOP',
      scope: 'global'
    })
    expect(util.parseInboundSmsCommand('STOP AQ123')).toEqual({
      action: 'STOP',
      scope: 'specific',
      code: 'AQ123'
    })
    expect(util.parseInboundSmsCommand('HELLO')).toEqual({ action: 'UNKNOWN' })
    expect(util.parseInboundSmsCommand('STOP ZZ999', { prefix: 'AQ' })).toEqual(
      { action: 'STOP', scope: 'global' }
    )
  })
})
