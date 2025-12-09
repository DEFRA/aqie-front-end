import { locationNotFoundController } from './controller.js'
import { welsh } from '../../data/cy/cy.js'
import {
  LOCATION_NOT_FOUND,
  LOCATION_NOT_FOUND_ROUTE_EN
} from '../../data/constants.js'
import { vi } from 'vitest'

const VIEW_RENDERED = 'view rendered'

describe('locationNotFoundController - welsh - basic rendering', () => {
  let mockRequest
  let mockH
  const mockContent = welsh

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/lleoliad-heb-ei-ganfod/cy',
      yar: {
        get: vi.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'cy'
        })
      }
    }
    const takeover = vi.fn(() => 'redirected')
    const code = vi.fn(() => ({ takeover }))
    const redirect = vi.fn(() => ({ code }))
    const view = vi.fn(() => VIEW_RENDERED)
    mockH = { redirect, view }
  })

  it('should render the location not found view with empty location data', () => {
    mockRequest.query.lang = 'cy'
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
      lang: 'cy'
    })
  })

  it('should redirect to the English version if the language is "en"', () => {
    mockRequest.query.lang = 'en'
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe('redirected')
    expect(mockH.redirect).toHaveBeenCalledWith(LOCATION_NOT_FOUND_ROUTE_EN)
  })
})

describe('locationNotFoundController - welsh - session handling', () => {
  let mockRequest
  let mockH

  beforeEach(() => {
    mockRequest = {
      query: {},
      path: '/lleoliad-heb-ei-ganfod/cy',
      yar: {
        get: vi.fn().mockReturnValue({
          locationNameOrPostcode: '',
          lang: 'cy'
        })
      }
    }
    const takeover = vi.fn(() => 'redirected')
    const code = vi.fn(() => ({ takeover }))
    const redirect = vi.fn(() => ({ code }))
    const view = vi.fn(() => VIEW_RENDERED)
    mockH = { redirect, view }
  })

  it('should use session lang when query.lang is not provided', () => {
    mockRequest.yar.get.mockReturnValue({
      locationNameOrPostcode: 'Caerdydd',
      lang: 'cy'
    })
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        lang: 'cy',
        userLocation: 'Caerdydd'
      })
    )
  })

  it('should handle empty session data gracefully', () => {
    mockRequest.yar.get.mockReturnValue([])
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        userLocation: undefined,
        lang: undefined
      })
    )
  })

  it('should override session lang with query.lang when provided', () => {
    mockRequest.query.lang = 'cy'
    mockRequest.yar.get.mockReturnValue({
      locationNameOrPostcode: 'Abertawe',
      lang: 'en'
    })
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        lang: 'cy',
        userLocation: 'Abertawe'
      })
    )
  })

  it('should handle null session data', () => {
    mockRequest.yar.get.mockReturnValue(null)
    const result = locationNotFoundController.handler(mockRequest, mockH)
    expect(result).toBe(VIEW_RENDERED)
    expect(mockH.view).toHaveBeenCalled()
  })
})
