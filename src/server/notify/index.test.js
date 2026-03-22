import { describe, it, expect, vi } from 'vitest'

import { notify } from './index.js'

vi.mock('./controller.js', () => ({
  notifyController: { handler: vi.fn() },
  notifyPostController: { handler: vi.fn() }
}))

vi.mock('../../config/index.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'notify.smsMobileNumberPath') {
        return '/notify/register/sms-mobile-number'
      }
      return undefined
    })
  }
}))

describe('notify/index plugin', () => {
  it('registers GET and POST routes for sms mobile number path', async () => {
    const server = { route: vi.fn() }

    await notify.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
    const routesArg = server.route.mock.calls[0][0]
    expect(Array.isArray(routesArg)).toBe(true)
    expect(routesArg).toHaveLength(2)
    expect(routesArg[0].method).toBe('GET')
    expect(routesArg[1].method).toBe('POST')
    expect(routesArg[0].path).toBe('/notify/register/sms-mobile-number')
  })

  it('exposes expected plugin name', () => {
    expect(notify.plugin.name).toBe('notify-sms-subscription')
  })
})
