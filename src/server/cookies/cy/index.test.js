import { cookiesCy } from './index'

describe('cookies index plugin - cy', () => {
  const server = {
    route: vi.fn()
  }

  test('should register cookies route', () => {
    cookiesCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
