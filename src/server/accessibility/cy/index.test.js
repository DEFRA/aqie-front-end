import { vi } from 'vitest'
import { accessibilityCy } from './index'

describe('accessibility index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

  test('should register accessibility route - cy', () => {
    accessibilityCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
