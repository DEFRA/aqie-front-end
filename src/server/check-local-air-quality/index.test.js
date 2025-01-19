import { home } from './index'

describe('home index plugin', () => {
  const server = {
    route: jest.fn()
  }

  test('should register home route', () => {
    home.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
