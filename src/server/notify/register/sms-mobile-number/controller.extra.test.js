import { describe, it, expect, vi, beforeEach } from 'vitest'

import { recordSmsCapture } from '../../../common/services/subscription.js'
import { handleNotifyRequest, handleNotifyPost } from './controller.js'

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

vi.mock('../helpers/resolve-notify-language.js', () => ({
  resolveNotifyLanguage: vi.fn(() => 'en')
}))

vi.mock('../../../common/services/subscription.js', () => ({
  recordSmsCapture: vi.fn(() => Promise.resolve({ ok: true }))
}))

const createRequest = ({ query = {}, payload = {}, session = {} } = {}) => ({
  query,
  payload,
  path: '/notify/register/sms-mobile-number',
  yar: {
    get: vi.fn((key) => session[key]),
    set: vi.fn((key, value) => {
      session[key] = value
    }),
    clear: vi.fn((key) => {
      delete session[key]
    })
  }
})

const createH = () => ({
  view: vi.fn((tpl, vm) => ({ tpl, vm })),
  redirect: vi.fn((to) => ({ redirect: to }))
})

describe('sms-mobile-number/controller extra coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures and sanitizes location query and sets back-link from locationId', () => {
    const session = {}
    const request = createRequest({
      query: {
        location: 'Air quality in Leeds',
        locationId: 'loc-1',
        lat: '53.800755',
        long: '-1.549077'
      },
      session
    })

    const response = handleNotifyRequest(request, createH())

    expect(session.location).toBe('Leeds')
    expect(session.latitude).toBe(53.800755)
    expect(session.longitude).toBe(-1.549077)
    expect(session.locationId).toBe('loc-1')
    expect(session.notifyJourney).toBe('started')
    expect(response.vm.backLinkUrl).toBe('/location/loc-1')
    expect(response.vm.displayBacklink).toBe(true)
  })

  it('renders max-alerts error branch and clears session flags', () => {
    const session = {
      maxAlertsError: true,
      maskedPhoneNumber: '***6789',
      locationId: 'loc-2'
    }
    const request = createRequest({ session })

    const response = handleNotifyRequest(request, createH())

    expect(request.yar.clear).toHaveBeenCalledWith('maxAlertsError')
    expect(request.yar.clear).toHaveBeenCalledWith('maskedPhoneNumber')
    expect(response.vm.pageTitle.startsWith('Error:')).toBe(true)
    expect(response.vm.maxAlertsError).toBeTruthy()
  })

  it('valid post stores formatted number and redirects even when capture skipped', async () => {
    recordSmsCapture.mockResolvedValueOnce({ skipped: true })

    const session = {}
    const request = createRequest({
      payload: { notifyByText: '07123 456789' },
      session
    })

    const response = await handleNotifyPost(request, createH())

    expect(session.mobileNumber).toBe('07123456789')
    expect(response.redirect).toBe('/notify/register/sms-send-activation')
  })

  it('valid post still redirects when capture throws', async () => {
    recordSmsCapture.mockRejectedValueOnce(new Error('backend down'))

    const session = {}
    const request = createRequest({
      payload: { notifyByText: '07123456789' },
      session
    })

    const response = await handleNotifyPost(request, createH())

    expect(session.mobileNumber).toBe('07123456789')
    expect(response.redirect).toBe('/notify/register/sms-send-activation')
  })

  it('invalid post can render without backlink when no locationId exists', async () => {
    const request = createRequest({
      payload: { notifyByText: 'abc' },
      session: {}
    })

    const response = await handleNotifyPost(request, createH())

    expect(response.tpl).toBe('notify/register/sms-mobile-number/index')
    expect(response.vm.error).toBeTruthy()
    expect(response.vm.backLinkUrl).toBeUndefined()
  })

  it('invalid post renders backlink when locationId exists in query', async () => {
    const request = createRequest({
      query: { locationId: 'loc-1' },
      payload: { notifyByText: 'abc' },
      session: {}
    })

    const response = await handleNotifyPost(request, createH())

    expect(response.tpl).toBe('notify/register/sms-mobile-number/index')
    expect(response.vm.displayBacklink).toBe(true)
    expect(response.vm.backLinkUrl).toBe('/location/loc-1')
  })

  it('valid post continues when capture returns ok', async () => {
    recordSmsCapture.mockResolvedValueOnce({ ok: true })

    const session = {}
    const request = createRequest({
      payload: { notifyByText: '07123456789' },
      session
    })

    const response = await handleNotifyPost(request, createH())

    expect(session.mobileNumber).toBe('07123456789')
    expect(response.redirect).toBe('/notify/register/sms-send-activation')
  })

  it('valid post continues when capture returns not ok', async () => {
    recordSmsCapture.mockResolvedValueOnce({ ok: false, status: 500 })

    const session = {}
    const request = createRequest({
      payload: { notifyByText: '07123456789' },
      session
    })

    const response = await handleNotifyPost(request, createH())

    expect(session.mobileNumber).toBe('07123456789')
    expect(response.redirect).toBe('/notify/register/sms-send-activation')
  })
})
