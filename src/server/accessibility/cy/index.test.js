import { accessibilityCy } from './index'

describe('accessibility index plugin - cy', () => {
  const server = {
    route: jest.fn()
  }

  test('should register accessibility route - cy', () => {
    accessibilityCy.plugin.register(server)
    expect(server.route).toHaveBeenCalled()
  })
})
