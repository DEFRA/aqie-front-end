// '' Shared test helpers for location-id controller tests (mocks must be in each test file)
import { vi } from 'vitest'

// Helper to get mocked modules - call this after vi.mock() in your test file
export async function getMockedModules() {
  const { getNearestLocation } = await import(
    '../../../locations/helpers/get-nearest-location.js'
  )
  const { getIdMatch } = await import(
    '../../../locations/helpers/get-id-match.js'
  )
  const { compareLastElements } = await import(
    '../../../locations/helpers/convert-string.js'
  )

  return { getNearestLocation, getIdMatch, compareLastElements }
}

// Create mock request and response objects
export function createMockRequestResponse() {
  const mockRequest = {
    params: { id: 'test-location-123' },
    query: { lang: 'en' },
    headers: { referer: 'https://example.com/previous' },
    url: { href: 'https://example.com/location/test-location-123?lang=en' },
    yar: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      _store: {}
    }
  }

  const mockCode = vi.fn()
  const mockH = {
    redirect: vi.fn(() => ({
      code: vi.fn(() => ({ takeover: vi.fn() }))
    })),
    view: vi.fn(),
    response: vi.fn(() => ({
      code: mockCode
    }))
  }
  mockH.code = mockCode

  return { mockRequest, mockH }
}
