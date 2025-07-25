import { home } from './index'
import { describe, expect, test, vi } from 'vitest'

describe('home index plugin', () => {
  const server = {
    route: vi.fn()
  }

  test('should register home route', () => {
    home.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
