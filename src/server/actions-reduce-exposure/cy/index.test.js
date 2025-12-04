import { actionsReduceExposureCy } from './index'
import { vi } from 'vitest'

describe('actions-reduce-exposure index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

  test('should register Welsh actions-reduce-exposure routes', () => {
    actionsReduceExposureCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
