// '' Tests for modular back link helper
import { describe, it, expect } from 'vitest'
import {
  createBackLink,
  createSearchLocationBackLink,
  createLocationBackLink
} from './back-link-helper.js'

const PREVIOUS_PAGE_URL = '/previous-page'
const SEARCH_LOCATION_EN_URL = '/search-location?lang=en'
const LOCATION_EN_URL = '/location/abc123?lang=en'

describe('createBackLink', () => {
  it('creates a valid back link configuration with all properties', () => {
    const result = createBackLink({
      text: 'Go back',
      url: PREVIOUS_PAGE_URL
    })

    expect(result).toEqual({
      displayBacklink: true,
      backLinkText: 'Go back',
      backLinkUrl: PREVIOUS_PAGE_URL,
      customBackLink: true
    })
  })

  it('returns disabled config when text is missing', () => {
    const result = createBackLink({
      url: PREVIOUS_PAGE_URL
    })

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })

  it('returns disabled config when url is missing', () => {
    const result = createBackLink({
      text: 'Go back',
      lang: 'en'
    })

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })

  it('returns disabled config when both text and url are missing', () => {
    const result = createBackLink({})

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })
})

describe('createSearchLocationBackLink', () => {
  it('creates English search location back link by default', () => {
    const result = createSearchLocationBackLink()

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe(SEARCH_LOCATION_EN_URL)
    expect(result.customBackLink).toBe(true)
    expect(result.backLinkText).toBeTruthy()
  })

  it('creates English search location back link explicitly', () => {
    const result = createSearchLocationBackLink('en')

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe(SEARCH_LOCATION_EN_URL)
    expect(result.customBackLink).toBe(true)
  })

  it('creates Welsh search location back link', () => {
    const result = createSearchLocationBackLink('cy')

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/chwilio-lleoliad/cy?lang=cy')
    expect(result.customBackLink).toBe(true)
    expect(result.backLinkText).toBeTruthy()
  })
})

describe('createLocationBackLink', () => {
  describe('fallback behavior', () => {
    it('falls back to search location link when locationId is missing', () => {
      const result = createLocationBackLink({
        lang: 'en'
      })

      expect(result.backLinkUrl).toBe(SEARCH_LOCATION_EN_URL)
    })
  })

  describe('basic location links', () => {
    it('creates English location back link with only locationId', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        lang: 'en'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe(LOCATION_EN_URL)
      expect(result.customBackLink).toBe(true)
      expect(result.backLinkText).toBeTruthy()
    })

    it('creates Welsh location back link with only locationId', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        lang: 'cy'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
      expect(result.customBackLink).toBe(true)
      expect(result.backLinkText).toBeTruthy()
    })
  })

  describe('location links with search terms and location names', () => {
    it('creates back link with locationId and searchTerms', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        searchTerms: 'SW1A 1AA',
        lang: 'en'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
      expect(result.backLinkText).toBe('Air pollution in SW1A 1AA')
    })

    it('creates back link with locationId and locationName', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        locationName: 'Westminster',
        lang: 'en'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
      expect(result.backLinkText).toBe('Air pollution in Westminster')
    })

    it('creates back link with locationId, searchTerms, and locationName', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        searchTerms: 'SW1A 1AA',
        locationName: 'Westminster',
        lang: 'en'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
      expect(result.backLinkText).toBe('Air pollution in SW1A 1AA, Westminster')
    })

    it('creates Welsh back link with locationId, searchTerms, and locationName', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        searchTerms: 'CF10 1AA',
        locationName: 'Caerdydd',
        lang: 'cy'
      })

      expect(result.displayBacklink).toBe(true)
      expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
      expect(result.backLinkText).toBe('Llygredd aer yn CF10 1AA, Caerdydd')
    })

    it('defaults to English when lang is not specified', () => {
      const result = createLocationBackLink({
        locationId: 'abc123',
        searchTerms: 'SW1A 1AA'
      })

      expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
      expect(result.backLinkText).toBe('Air pollution in SW1A 1AA')
    })
  })
})
