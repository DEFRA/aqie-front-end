import { describe, it, expect, vi, beforeEach } from 'vitest'
import { welsh } from '../../data/cy/cy.js'
import { ozoneController } from './controller.js'
import { LANG_CY, OZONE_PATH_CY } from '../../data/constants.js'
import { getAirQualitySiteUrl } from '../../common/helpers/get-site-url.js'

const createMockRequestResponse = () => {
  const VIEW_RENDERED = 'view rendered'
  const mockRequest = {
    query: {},
    path: '/llygryddion/oson/cy'
  }
  const mockH = {
    redirect: vi.fn(() => ({
      code: vi.fn(() => 'redirected')
    })),
    view: vi.fn(() => VIEW_RENDERED)
  }
  return { mockRequest, mockH, VIEW_RENDERED }
}

describe('Ozone Controller - Welsh', () => {
  let mockRequest
  let mockH
  let VIEW_RENDERED
  const mockContent = welsh
  const { ozone } = welsh.pollutants

  beforeEach(() => {
    const mocks = createMockRequestResponse()
    mockRequest = mocks.mockRequest
    mockH = mocks.mockH
    VIEW_RENDERED = mocks.VIEW_RENDERED
    vi.mock('../../common/helpers/get-site-url.js', () => ({
      getAirQualitySiteUrl: vi.fn((request) => {
        return `https://check-air-quality.service.gov.uk${request.path}?lang=${request.query.lang}`
      })
    }))
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith('/pollutants/ozone?lang=en')
  })

  it('should render the ozone cy page with the necessary data', () => {
    mockRequest.query.lang = LANG_CY
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/oson/cy?lang=cy'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      metaSiteUrl: actualUrl,
      ozone,
      page: 'ozone-cy',
      displayBacklink: true,
      backLinkText: 'Llygredd aer yn Test Location',
      backLinkUrl: '/lleoliad/123?lang=cy',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: mockRequest.query.lang,
      currentPath: OZONE_PATH_CY
    })
  })

  it('should render the ozone cy page with the necessary data if lang is not cy | en', () => {
    mockRequest.query.lang = 'test'
    mockRequest.query.locationId = '123'
    mockRequest.query.locationName = 'Test Location'
    const expectedUrl =
      'https://check-air-quality.service.gov.uk/llygryddion/oson/cy?lang=test'
    const actualUrl = getAirQualitySiteUrl(mockRequest)
    expect(actualUrl).toBe(expectedUrl)
    const result = ozoneController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith('ozone/index', {
      pageTitle: mockContent.pollutants.ozone.pageTitle,
      description: mockContent.pollutants.ozone.description,
      metaSiteUrl: actualUrl,
      ozone,
      page: 'ozone-cy',
      displayBacklink: true,
      backLinkText: 'Llygredd aer yn Test Location',
      backLinkUrl: '/lleoliad/123?lang=cy',
      customBackLink: true,
      phaseBanner: mockContent.phaseBanner,
      footerTxt: mockContent.footerTxt,
      cookieBanner: mockContent.cookieBanner,
      serviceName: mockContent.multipleLocations.serviceName,
      lang: LANG_CY,
      currentPath: OZONE_PATH_CY
    })
  })
})
