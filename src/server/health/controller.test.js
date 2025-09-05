import { describe, test, expect, vi, beforeEach } from 'vitest'

describe('Health Controller', () => {
  let mockRequest, mockH

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {}

    mockH = {
      response: vi.fn().mockReturnValue({
        code: vi.fn().mockReturnValue('success response')
      })
    }
  })

  test('should export healthController', async () => {
    // ''
    const module = await import('./controller.js')

    expect(module.healthController).toBeDefined()
    expect(module.healthController.handler).toBeDefined()
    expect(typeof module.healthController.handler).toBe('function')
  })

  test('should return success response with 200 status code', async () => {
    // ''
    const module = await import('./controller.js')
    const result = await module.healthController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ message: 'success' })
    expect(mockH.response().code).toHaveBeenCalledWith(200)
    expect(result).toBe('success response')
  })
})
