import { describe, expect, test, vi } from 'vitest'
import {
  buildViewModel,
  determineLanguage,
  retryController
} from './controller.js'

vi.mock('../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example')
}))

const buildRequest = ({ payload, query, referer } = {}) => ({
  payload,
  query,
  headers: referer ? { referer } : {}
})

describe('retry controller helpers', () => {
  test('determineLanguage returns cy from payload', () => {
    const request = buildRequest({ payload: { lang: 'cy' } })
    expect(determineLanguage(request)).toBe('cy')
  })

  test('determineLanguage returns cy from referer', () => {
    const request = buildRequest({
      referer: 'https://example/chwilio-lleoliad/cy'
    })
    expect(determineLanguage(request)).toBe('cy')
  })

  test('determineLanguage defaults to en', () => {
    const request = buildRequest()
    expect(determineLanguage(request)).toBe('en')
  })

  test('buildViewModel includes payload and lang', () => {
    const viewModel = buildViewModel({
      metaSiteUrl: 'https://example',
      lang: 'en',
      payload: { locationType: 'uk-location' }
    })

    expect(viewModel.lang).toBe('en')
    expect(viewModel.payload).toEqual({ locationType: 'uk-location' })
  })
})

describe('retryController handler', () => {
  test('uses session retryPayload when no request payload', () => {
    const sessionPayload = { locationType: 'NI', ni: 'BT1 1FB' }
    const mockH = { view: vi.fn(() => 'view-result') }
    const mockRequest = {
      payload: null,
      query: {},
      headers: {},
      yar: {
        get: vi.fn((key) => (key === 'retryPayload' ? sessionPayload : null)),
        clear: vi.fn()
      }
    }

    retryController.handler(mockRequest, mockH)

    expect(mockRequest.yar.clear).toHaveBeenCalledWith('retryPayload')
    expect(mockH.view).toHaveBeenCalledWith(
      'retry/index',
      expect.objectContaining({ payload: sessionPayload })
    )
  })

  test('uses request payload when present, ignores session', () => {
    const requestPayload = { locationType: 'UK', engScoWal: 'Cardiff' }
    const mockH = { view: vi.fn(() => 'view-result') }
    const mockRequest = {
      payload: requestPayload,
      query: {},
      headers: {},
      yar: { get: vi.fn(), clear: vi.fn() }
    }

    retryController.handler(mockRequest, mockH)

    expect(mockRequest.yar.clear).not.toHaveBeenCalled()
    expect(mockH.view).toHaveBeenCalledWith(
      'retry/index',
      expect.objectContaining({ payload: requestPayload })
    )
  })
})
