import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLoggerInfo = vi.fn()

vi.mock('./logging/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: mockLoggerInfo,
    warn: vi.fn(),
    error: vi.fn()
  }))
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234')
}))

const createRequest = (path, existingJourneyId = null) => ({
  path,
  yar: {
    get: vi.fn(() => existingJourneyId),
    set: vi.fn()
  }
})

const h = { continue: Symbol('h.continue') }

const registerAndGetHandler = async () => {
  const { kpiTracker } = await import('./kpi-tracker.js')
  let capturedHandler
  const server = {
    ext: vi.fn((event, fn) => {
      capturedHandler = fn
    })
  }
  await kpiTracker.register(server)
  return { server, handler: capturedHandler }
}

describe('kpiTracker plugin', () => {
  beforeEach(() => {
    vi.resetModules()
    mockLoggerInfo.mockClear()
  })

  describe('plugin structure', () => {
    it('has the correct name and version', async () => {
      const { kpiTracker } = await import('./kpi-tracker.js')
      expect(kpiTracker.name).toBe('kpiTracker')
      expect(kpiTracker.version).toBe('1.0.0')
    })

    it('registers an onPreHandler extension', async () => {
      const { server } = await registerAndGetHandler()
      expect(server.ext).toHaveBeenCalledWith(
        'onPreHandler',
        expect.any(Function)
      )
    })
  })

  describe('journey ID', () => {
    it('generates a new journey ID when none exists in session', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/', null)

      handler(request, h)

      expect(request.yar.set).toHaveBeenCalledWith(
        'journeyId',
        'mock-uuid-1234'
      )
    })

    it('reuses existing journey ID from session', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/', 'existing-journey-id')

      handler(request, h)

      expect(request.yar.set).not.toHaveBeenCalled()
    })
  })

  describe('transaction_initiated', () => {
    it('logs transaction_initiated when path is /', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/', 'mock-uuid-1234')

      handler(request, h)

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          event: {
            action: 'transaction_initiated',
            kind: 'metric',
            category: ['web'],
            outcome: 'success'
          }
        },
        'kpi: transaction_initiated journey_id=mock-uuid-1234 url_path=/ is_welsh=false'
      )
    })
  })

  describe('transaction_completed', () => {
    it('logs transaction_completed for English location path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/location/abc123', 'mock-uuid-1234')

      handler(request, h)

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          event: {
            action: 'transaction_completed',
            kind: 'metric',
            category: ['web'],
            outcome: 'success'
          }
        },
        'kpi: transaction_completed journey_id=mock-uuid-1234 url_path=/location/abc123 is_welsh=false'
      )
    })

    it('logs transaction_completed for Welsh location path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/lleoliad/abc123', 'mock-uuid-1234')

      handler(request, h)

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          event: {
            action: 'transaction_completed',
            kind: 'metric',
            category: ['web'],
            outcome: 'success'
          }
        },
        'kpi: transaction_completed journey_id=mock-uuid-1234 url_path=/lleoliad/abc123 is_welsh=true'
      )
    })

    it('sets is_welsh=true for Welsh path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/lleoliad/abc123', 'mock-uuid-1234')

      handler(request, h)

      const message = mockLoggerInfo.mock.calls[0][1]
      expect(message).toContain('is_welsh=true')
    })

    it('sets is_welsh=false for English path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/location/abc123', 'mock-uuid-1234')

      handler(request, h)

      const message = mockLoggerInfo.mock.calls[0][1]
      expect(message).toContain('is_welsh=false')
    })
  })

  describe('non-milestone paths', () => {
    it('does not log for a non-milestone path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/search-location', 'mock-uuid-1234')

      handler(request, h)

      expect(mockLoggerInfo).not.toHaveBeenCalled()
    })

    it('does not log for /health path', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/health', 'mock-uuid-1234')

      handler(request, h)

      expect(mockLoggerInfo).not.toHaveBeenCalled()
    })
  })

  describe('handler return value', () => {
    it('always returns h.continue', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/', 'mock-uuid-1234')

      const result = handler(request, h)

      expect(result).toBe(h.continue)
    })

    it('returns h.continue even for non-milestone paths', async () => {
      const { handler } = await registerAndGetHandler()
      const request = createRequest('/search-location', 'mock-uuid-1234')

      const result = handler(request, h)

      expect(result).toBe(h.continue)
    })
  })
})
