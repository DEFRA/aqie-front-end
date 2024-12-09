import { routes } from '~/src/server/cookies/routes'
import { cookiesController } from '~/src/server/cookies/controller'

describe('Routes', () => {
  it('should include the cookies route', () => {
    const cookiesRoute = routes.find((route) => route.path === '/cookies')
    expect(cookiesRoute).toBeDefined()
    expect(cookiesRoute.method).toBe('GET')
    expect(cookiesRoute.handler).toBe(cookiesController.handler)
  })
})
