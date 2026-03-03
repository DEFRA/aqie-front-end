import { vi } from 'vitest'
import {
  getFormattedDateSummary,
  getLanguageDates
} from '../helpers/middleware-helpers.js'
import { handleUKLocationType } from '../helpers/extra-middleware-helpers.js'
import { getMonth } from '../helpers/location-type-util.js'

// Shared test constants
export const PAGE_NOT_FOUND = 'Page not found'
export const ERROR_INDEX = 'error/index'
export const TAKEOVER_RESULT = 'takeover-result'
export const MOCK_DATE_STRING = '2024-01-15'
export const MOCK_DATE_OBJECT = { date: MOCK_DATE_STRING }

// Shared test setup utilities - exported as objects that will be mutated
export const mocks = {
  mockRequest: null,
  mockH: null,
  mockRedirect: null,
  mockView: null
}

export function setupMocks() {
  vi.clearAllMocks()

  // Setup chainable mock objects for .view and .redirect
  mocks.mockView = vi.fn(function () {
    return {
      code: vi.fn(function () {
        return {
          takeover: vi.fn().mockReturnValue(TAKEOVER_RESULT)
        }
      })
    }
  })
  mocks.mockRedirect = vi.fn(function () {
    const chain = {
      code: vi.fn(function () {
        return {
          takeover: vi.fn().mockReturnValue(TAKEOVER_RESULT)
        }
      }),
      takeover: vi.fn().mockReturnValue(TAKEOVER_RESULT)
    }
    return chain
  })

  mocks.mockH = {
    view: mocks.mockView,
    redirect: mocks.mockRedirect
  }

  mocks.mockRequest = {
    query: {},
    payload: {},
    path: '/test-path',
    yar: {
      set: vi.fn(),
      clear: vi.fn(),
      get: vi.fn()
    }
  }

  // Setup default mocks
  vi.mocked(getMonth).mockReturnValue(0)
  vi.mocked(handleUKLocationType).mockReturnValue('uk-location-result')
  vi.mocked(getFormattedDateSummary).mockReturnValue({
    formattedDateSummary: ['15', 'January', '2024'],
    getMonthSummary: 0
  })
  vi.mocked(getLanguageDates).mockReturnValue({
    englishDate: '15 January 2024',
    welshDate: '15 Ionawr 2024'
  })

  return mocks
}
