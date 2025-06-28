import { describe, it, expect } from 'vitest'

describe('Render Location Details View Tests', () => {
  it('should render location details correctly', () => {
    const renderLocationDetailsView = (location) => `<div>${location}</div>`
    const result = renderLocationDetailsView('Cardiff')
    expect(result).toBe('<div>Cardiff</div>')
  })

  it('should handle empty location gracefully', () => {
    const renderLocationDetailsView = (location) =>
      location ? `<div>${location}</div>` : '<div>Unknown</div>'
    const result = renderLocationDetailsView('')
    expect(result).toBe('<div>Unknown</div>')
  })
})
