import { home } from './index'

describe('home index plugin - en', () => {
  const server = {
    route: jest.fn()
  }

  test('should register home routes', () => {
    home.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
