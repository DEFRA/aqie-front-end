import { cookies } from './index'

describe('cookies index plugin - en', () => {
  const server = {
    route: jest.fn()
  }

  test('should register cookies route', () => {
    cookies.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
