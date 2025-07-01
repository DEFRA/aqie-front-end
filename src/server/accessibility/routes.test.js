import { routes } from './routes.js'
import { accessibilityController } from './controller.js'

vi.mock('./controller.js')

describe('Accessibility Routes', () => {
  it('should define the accessibility route', () => {
    expect(routes).toEqual([
      {
        method: 'GET',
        path: '/accessibility',
        ...accessibilityController
      }
    ])
  })
})
