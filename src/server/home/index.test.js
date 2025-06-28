import { home } from './index'

describe('home index plugin - en', () => {
  const server = {
    route: vi.fn()
  }

  test('should register home routes', () => {
    home.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
