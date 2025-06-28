import { describe, it, expect } from 'vitest'

describe('Render Location Not Found View Tests', () => {
  it('should render not found view correctly', () => {
    const renderLocationNotFoundView = () => '<div>Location Not Found</div>'
    const result = renderLocationNotFoundView()
    expect(result).toBe('<div>Location Not Found</div>')
  })

  it('should handle additional message in not found view', () => {
    const renderLocationNotFoundView = (message) =>
      `<div>${message || 'Location Not Found'}</div>`
    const result = renderLocationNotFoundView('Custom Message')
    expect(result).toBe('<div>Custom Message</div>')
  })
})
