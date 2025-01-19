import { routes } from './routes'
import { accessibilityController } from './controller'

jest.mock('./controller')

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
