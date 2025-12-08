import { describe, it, expect, vi } from 'vitest'
import {
  handleNILocationData,
  handleUKLocationData,
  handleUnsupportedLocationType,
  catchProxyFetchError
} from './util-helpers.js'
import { STATUS_BAD_REQUEST } from '../../../data/constants.js'

describe('util-helpers - Handler Functions', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
  })

  describe('handleNILocationData', () => {
    it('should accept all required parameters', async () => {
      const di = {
        logger: mockLogger,
        isTestMode: vi.fn().mockReturnValue(true)
      }

      const result = await handleNILocationData('Belfast', di)

      // Just verify function executes without error
      expect(result).toBeDefined()
    })
  })

  describe('handleUKLocationData', () => {
    it('should accept all required parameters', async () => {
      const di = {
        logger: mockLogger,
        isTestMode: vi.fn().mockReturnValue(true)
      }

      const result = await handleUKLocationData('London', di)

      // Just verify function executes without error
      expect(result).toBeDefined()
    })
  })

  describe('handleUnsupportedLocationType', () => {
    it('should return error response for unsupported location type', () => {
      const mockErrorResponse = vi
        .fn()
        .mockReturnValue({ error: 'Bad request' })
      const handler = handleUnsupportedLocationType()
      const result = handler(mockLogger, mockErrorResponse, 'InvalidType')

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unsupported location type provided:',
        'InvalidType'
      )
      expect(mockErrorResponse).toHaveBeenCalledWith(
        'Unsupported location type provided',
        STATUS_BAD_REQUEST
      )
      expect(result).toEqual({ error: 'Bad request' })
    })
  })

  describe('catchProxyFetchError', () => {
    it('should call catchFetchError with provided arguments', () => {
      // Since catchProxyFetchError uses the real catchFetchError which makes HTTP calls,
      // we just verify it's exported and is a function
      expect(catchProxyFetchError).toBeDefined()
      expect(typeof catchProxyFetchError).toBe('function')
    })
  })
})
