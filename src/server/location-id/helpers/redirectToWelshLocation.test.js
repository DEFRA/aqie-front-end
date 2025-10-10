import { describe, it, expect, vi, beforeEach } from 'vitest'
import redirectToWelshLocation from './redirectToWelshLocation.js'
import { LANG_CY, REDIRECT_STATUS_CODE } from '../../data/constants.js'

describe('redirectToWelshLocation', () => {
  let mockH, mockRedirect, mockCode

  beforeEach(() => {
    mockCode = vi.fn().mockReturnValue('redirect-result')
    mockRedirect = vi.fn().mockReturnValue({ code: mockCode })
    mockH = { redirect: mockRedirect }
  })

  it('should redirect to Welsh location when lang is cy and locationId is provided', () => {
    const query = { lang: LANG_CY }
    const locationId = '12345'

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).toHaveBeenCalledWith('/lleoliad/12345/?lang=cy')
    expect(mockCode).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
    expect(result).toBe('redirect-result')
  })

  it('should return null when lang is not cy', () => {
    const query = { lang: 'en' }
    const locationId = '12345'

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockCode).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should return null when searchTerms are present', () => {
    const query = { lang: LANG_CY, searchTerms: 'cardiff' }
    const locationId = '12345'

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockCode).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should return null when locationId is not provided', () => {
    const query = { lang: LANG_CY }
    const locationId = null

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockCode).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should return null when query is undefined', () => {
    const query = undefined
    const locationId = '12345'

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockCode).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('should handle empty locationId string', () => {
    const query = { lang: LANG_CY }
    const locationId = ''

    const result = redirectToWelshLocation(query, locationId, mockH)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockCode).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
