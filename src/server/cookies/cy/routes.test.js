import { routes } from '~/src/server/cookies/cy/routes'
import { cookiesController } from '~/src/server/cookies/cy/controller'

describe('Routes', () => {
  it('should include the briwsion/cy route', () => {
    const cookiesRoute = routes.find((route) => route.path === '/briwsion/cy')
    expect(cookiesRoute).toBeDefined()
    expect(cookiesRoute.method).toBe('GET')
    expect(cookiesRoute.handler).toBe(cookiesController.handler)
  })
})
