''
// Unit tests for middleware-helpers.js
const { validateLocation } = require('./middleware-helpers')

// Mock data
const mockRequest = {
  params: { locationId: '123' }
}
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
}
const mockNext = jest.fn()

describe('validateLocation', () => {
  it('should call next for valid locationId', () => {
    validateLocation(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should return 400 for missing locationId', () => {
    const req = { params: {} }
    validateLocation(req, mockResponse, mockNext)
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.send).toHaveBeenCalledWith('Invalid locationId')
  })
})
