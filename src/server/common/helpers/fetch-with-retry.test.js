import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithRetry, delay } from './fetch-with-retry.js'

describe('fetch-with-retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('fetchWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
        operationName: 'test operation'
      })

      // Advance timers to allow the operation to complete
      await vi.runAllTimersAsync()

      const result = await promise
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      let attemptCount = 0
      const mockFn = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve('success')
      })

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 3,
        retryDelayMs: 100,
        timeoutMs: 5000,
        operationName: 'test operation'
      })

      // Advance timers for each retry attempt
      await vi.runAllTimersAsync()

      const result = await promise
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries exhausted', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValue(new Error('Persistent network error'))

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
        operationName: 'test operation'
      })

      // Advance timers for all retry attempts
      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('Persistent network error')
      expect(mockFn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should handle timeout errors', async () => {
      const mockFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            // Never resolves - will timeout
            setTimeout(resolve, 20000)
          })
      )

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 1,
        retryDelayMs: 100,
        timeoutMs: 1000,
        operationName: 'test operation'
      })

      // Advance timers to trigger timeout
      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('Timeout')
    })

    it('should use exponential backoff between retries', async () => {
      let attemptCount = 0
      const mockFn = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Error'))
        }
        return Promise.resolve('success')
      })

      const retryDelayMs = 100

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 3,
        retryDelayMs,
        timeoutMs: 5000,
        operationName: 'test operation'
      })

      // Advance timers for all attempts
      await vi.runAllTimersAsync()

      await promise

      // Verify exponential backoff was used
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should pass abort controller to fetch function', async () => {
      let receivedController = null
      const mockFn = vi.fn().mockImplementation((controller) => {
        receivedController = controller
        return Promise.resolve('success')
      })

      const promise = fetchWithRetry(mockFn, {
        maxRetries: 0,
        timeoutMs: 5000,
        operationName: 'test operation'
      })

      await vi.runAllTimersAsync()
      await promise

      expect(receivedController).toBeDefined()
      expect(receivedController).toBeInstanceOf(AbortController)
    })
  })

  describe('delay', () => {
    it('should delay execution for specified milliseconds', async () => {
      const promise = delay(1000)

      // Should not resolve immediately
      let resolved = false
      promise.then(() => {
        resolved = true
      })

      expect(resolved).toBe(false)

      // Advance timers by 1000ms
      await vi.advanceTimersByTimeAsync(1000)

      await promise
      expect(resolved).toBe(true)
    })
  })
})
