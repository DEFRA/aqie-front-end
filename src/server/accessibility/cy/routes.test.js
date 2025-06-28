import { routes } from './routes.js'
import { accessibilityController } from './controller.js'

vi.mock('./controller.js')

describe('Accessibility cy Routes', () => {
  it('should define the accessibility route - cy', () => {
    expect(routes).toEqual([
      {
        method: 'GET',
        path: '/hygyrchedd/cy',
        ...accessibilityController
      }
    ])
  })
})
