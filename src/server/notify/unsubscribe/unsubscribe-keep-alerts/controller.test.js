import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleUnsubscribeKeepAlertsRequest } from './controller.js'

vi.mock('../../../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

vi.mock('../../../common/helpers/get-site-url.js', () => ({
  getAirQualitySiteUrl: vi.fn(() => 'https://example.test')
}))

vi.mock('../../register/helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

const mockH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm }))
})

const mockRequest = () => ({
  path: '/notify/unsubscribe-keep-alerts',
  yar: { get: vi.fn(), set: vi.fn() }
})

const VIEW_PATH = 'notify/unsubscribe/unsubscribe-keep-alerts/index'

describe('unsubscribe-keep-alerts/controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the keep alerts page', () => {
    const h = mockH()
    const response = handleUnsubscribeKeepAlertsRequest(mockRequest(), h)

    expect(response.tpl).toBe(VIEW_PATH)
  })

  it('renders with correct heading content', () => {
    const h = mockH()
    const response = handleUnsubscribeKeepAlertsRequest(mockRequest(), h)

    expect(response.vm.content.heading).toBe(
      'You will continue to get air pollution alerts by email'
    )
  })

  it('renders with correct body content', () => {
    const h = mockH()
    const response = handleUnsubscribeKeepAlertsRequest(mockRequest(), h)

    expect(response.vm.content.bodyPrefix).toBe(
      'If you want to set up another alert, you can '
    )
    expect(response.vm.content.searchLinkText).toBe(
      'search for another location'
    )
    expect(response.vm.content.bodySuffix).toBe('.')
  })

  it('includes metaSiteUrl and currentPath in view model', () => {
    const h = mockH()
    const response = handleUnsubscribeKeepAlertsRequest(mockRequest(), h)

    expect(response.vm.metaSiteUrl).toBe('https://example.test')
    expect(response.vm.currentPath).toBe('/notify/unsubscribe-keep-alerts')
  })

  it('includes correct page title', () => {
    const h = mockH()
    const response = handleUnsubscribeKeepAlertsRequest(mockRequest(), h)

    expect(response.vm.pageTitle).toContain(
      'You will continue to get air pollution alerts by email'
    )
    expect(response.vm.pageTitle).toContain('GOV.UK')
  })
})
