import { homeCy } from './index'

describe('home index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

  test('should register home routes', () => {
    homeCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
