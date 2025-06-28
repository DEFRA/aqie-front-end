import { homeCy } from './index'

describe('homeCy index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

  test('should register homeCy route - cy', () => {
    homeCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
