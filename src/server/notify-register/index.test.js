import { describe, it, expect, vi } from 'vitest'
import { notifyRegister } from './index.js'

describe('notify-register plugin', () => {
  it('registers routes with server.route', async () => {
    const server = {
      route: vi.fn()
    }

    await notifyRegister.plugin.register(server)

    expect(server.route).toHaveBeenCalledTimes(1)
  })

  it('exposes expected plugin metadata', () => {
    expect(notifyRegister.plugin.name).toBe('Notify Register')
  })
})
