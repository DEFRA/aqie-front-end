''
// Jest test for context.js in nunjucks
import { buildNavigation } from './build-navigation'

describe('Nunjucks Context', () => {
  it('should build navigation context correctly', () => {
    const mockRequest = null // Mock request object
    const navigation = buildNavigation(mockRequest)
    expect(navigation).toBeDefined()
    // Add more tests for navigation context behavior
  })
})
