import { actionsReduceExposure } from './index'
import { vi } from 'vitest'

describe('actions-reduce-exposure index plugin - en', () => {
  const server = {
    route: vi.fn()
  }

  test('should register actions-reduce-exposure routes', () => {
    actionsReduceExposure.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
