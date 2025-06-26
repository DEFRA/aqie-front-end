''
// Unit tests for handle-single-match-helper.js
const { handleSingleMatchTest } = require('./handle-single-match-helper')

// Mock data
const mockMatch = { id: '123', name: 'Test Location' }

describe('handleSingleMatch', () => {
  it('should return match details for valid match', () => {
    const result = handleSingleMatchTest(mockMatch)
    expect(result).toEqual({ id: '123', name: 'Test Location' })
  })

  it('should return null for invalid match', () => {
    const result = handleSingleMatchTest(null)
    expect(result).toBeNull()
  })
})
