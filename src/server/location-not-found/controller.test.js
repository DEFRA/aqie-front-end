import { locationNotFoundController } from './controller.js'
import { english } from '../data/en/en.js'
import {
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_CY
} from '../data/constants.js'
import { vi } from 'vitest'

const VIEW_RENDERED = 'view rendered'
const REDIRECTED = 'redirected'

const createMockH = () => {
  const takeover = vi.fn(() => REDIRECTED)
  const code = vi.fn(() => ({ takeover }))
  const redirect = vi.fn(() => ({ code }))
  const view = vi.fn(() => VIEW_RENDERED)
  return { redirect, view }
}

describe('locationNotFoundController - english - basic rendering', () => {
  let mockRequest
  let mockH
  const mockContent = english

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/location-not-found',
      yar: {
        get: vi.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'en'
        })
      }
    }
    mockH = createMockH()
  })

  it('should render the location not found view with empty location data', () => {
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      userLocation: '',
      serviceName: mockContent.notFoundLocation.heading,
      paragraph: mockContent.notFoundLocation.paragraphs,
      pageTitle: `${mockContent.notFoundLocation.paragraphs.a}  - ${mockContent.home.pageTitle}`,
      description: mockContent.multipleLocations.description,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
  })

  test.skip('should render the location not found page when invalid empty location data', () => {
    const locationData = { locationNameOrPostcode: 'dkjfhe', lang: 'en' }
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      userLocation: locationData.locationNameOrPostcode,
      serviceName: mockContent.notFoundLocation.heading,
      paragraph: mockContent.notFoundLocation.paragraphs,
      pageTitle: `${mockContent.notFoundLocation.paragraphs.a} ${locationData.locationNameOrPostcode} - ${mockContent.home.pageTitle}`,
      footerTxt: mockContent.footerTxt,
      phaseBanner: mockContent.phaseBanner,
      backlink: mockContent.backlink,
      cookieBanner: mockContent.cookieBanner,
      lang: 'en'
    })
  })

  it('should redirect to the English version if the language is "cy"', () => {
    mockRequest.query.lang = 'cy'
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(REDIRECTED)
    expect(mockH.redirect).toHaveBeenCalledWith(LOCATION_NOT_FOUND_ROUTE_CY)
  })
})

describe('locationNotFoundController - english - session handling', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/location-not-found',
      yar: {
        get: vi.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'en'
        })
      }
    }
    mockH = createMockH()
  })

  it('should use session lang when query.lang is not provided', () => {
    mockRequest.yar.get.mockReturnValue({
      locationNameOrPostcode: 'TestLocation',
      lang: 'cy'
    })
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        lang: 'cy',
        userLocation: 'TestLocation'
      })
    )
  })

  it('should handle empty session data gracefully', () => {
    mockRequest.yar.get.mockReturnValue(null)
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        userLocation: '',
        lang: 'en'
      })
    )
  })

  it('should override session lang with query.lang when provided', () => {
    mockRequest.query.lang = 'en'
    mockRequest.yar.get.mockReturnValue({
      locationNameOrPostcode: 'Cardiff',
      lang: 'cy'
    })
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        lang: 'en',
        userLocation: 'Cardiff'
      })
    )
  })

  it('should handle missing notFoundLocation fields', () => {
    mockRequest.yar.get.mockReturnValue({
      locationNameOrPostcode: 'Test',
      lang: 'en'
    })
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalled()
  })
})
