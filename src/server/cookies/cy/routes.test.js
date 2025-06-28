import { routes } from './routes.js'
import { cookiesController } from './controller.js'

describe('Routes', () => {
  it('should include the briwsion/cy route', () => {
    const cookiesRoute = routes.find((route) => route.path === '/briwsion/cy')
    expect(cookiesRoute).toBeDefined()
    expect(cookiesRoute.method).toBe('GET')
    expect(cookiesRoute.handler).toBe(cookiesController.handler)
  })
})
