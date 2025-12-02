// '' Tests for back link helper utility
import { describe, expect, it } from 'vitest'
import {
  createBackLink,
  createSearchLocationBackLink,
  createLocationBackLink
} from '../../../../src/server/common/helpers/back-link-helper.js'

describe('createBackLink', () => {
  it('should create a back link with provided text and url', () => {
    // ''
    const result = createBackLink({
      text: 'Go back',
      url: '/previous-page'
    })

    expect(result).toEqual({
      displayBacklink: true,
      backLinkText: 'Go back',
      backLinkUrl: '/previous-page',
      customBackLink: true
    })
  })

  it('should return disabled back link when text is missing', () => {
    // ''
    const result = createBackLink({
      url: '/previous-page'
    })

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })

  it('should return disabled back link when url is missing', () => {
    // ''
    const result = createBackLink({
      text: 'Go back'
    })

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })

  it('should return disabled back link when both text and url are missing', () => {
    // ''
    const result = createBackLink({})

    expect(result).toEqual({
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    })
  })

  it('should handle language parameter', () => {
    // ''
    const result = createBackLink({
      text: 'Yn ôl',
      url: '/tudalen-flaenorol',
      lang: 'cy'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkText).toBe('Yn ôl')
    expect(result.backLinkUrl).toBe('/tudalen-flaenorol')
  })
})

describe('createSearchLocationBackLink', () => {
  it('should create English search location back link by default', () => {
    // ''
    const result = createSearchLocationBackLink()

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/search-location?lang=en')
    expect(result.customBackLink).toBe(true)
    expect(result.backLinkText).toBeTruthy()
  })

  it('should create English search location back link when lang=en', () => {
    // ''
    const result = createSearchLocationBackLink('en')

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/search-location?lang=en')
    expect(result.customBackLink).toBe(true)
  })

  it('should create Welsh search location back link when lang=cy', () => {
    // ''
    const result = createSearchLocationBackLink('cy')

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/chwilio-lleoliad/cy?lang=cy')
    expect(result.customBackLink).toBe(true)
    expect(result.backLinkText).toBeTruthy()
  })
})

describe('createLocationBackLink', () => {
  it('should fallback to search location when locationId is missing', () => {
    // ''
    const result = createLocationBackLink({})

    expect(result.backLinkUrl).toBe('/search-location?lang=en')
    expect(result.displayBacklink).toBe(true)
  })

  it('should create English location back link with locationId only', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      lang: 'en'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
    expect(result.customBackLink).toBe(true)
  })

  it('should create Welsh location back link with locationId only', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      lang: 'cy'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId and searchTerms in English', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      searchTerms: 'SW1A 1AA',
      lang: 'en'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
    expect(result.backLinkText).toContain('Air pollution in SW1A 1AA')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId and searchTerms in Welsh', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      searchTerms: 'CF10 1AA',
      lang: 'cy'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
    expect(result.backLinkText).toContain('Llygredd aer yn CF10 1AA')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId and locationName in English', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      locationName: 'London',
      lang: 'en'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
    expect(result.backLinkText).toContain('Air pollution in London')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId and locationName in Welsh', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      locationName: 'Caerdydd',
      lang: 'cy'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
    expect(result.backLinkText).toContain('Llygredd aer yn Caerdydd')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId, searchTerms and locationName in English', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      searchTerms: 'SW1A 1AA',
      locationName: 'Westminster',
      lang: 'en'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
    expect(result.backLinkText).toBe('Air pollution in SW1A 1AA, Westminster')
    expect(result.customBackLink).toBe(true)
  })

  it('should create back link with locationId, searchTerms and locationName in Welsh', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      searchTerms: 'CF10 1AA',
      locationName: 'Caerdydd',
      lang: 'cy'
    })

    expect(result.displayBacklink).toBe(true)
    expect(result.backLinkUrl).toBe('/lleoliad/abc123?lang=cy')
    expect(result.backLinkText).toBe('Llygredd aer yn CF10 1AA, Caerdydd')
    expect(result.customBackLink).toBe(true)
  })

  it('should default to English when lang is not provided', () => {
    // ''
    const result = createLocationBackLink({
      locationId: 'abc123',
      locationName: 'London'
    })

    expect(result.backLinkUrl).toBe('/location/abc123?lang=en')
    expect(result.backLinkText).toContain('Air pollution in London')
  })
})
