import { cookies } from './index'

describe('cookies index plugin - en', () => {
  const server = {
    route: vi.fn()
  }

  it('should register cookies route', () => {
    cookies.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
