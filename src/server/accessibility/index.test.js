import { accessibility } from './index'

describe('accessibility index plugin', () => {
  const server = {
    route: jest.fn()
  }

  test('should register accessibility route', () => {
    accessibility.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
