import { describe, it, expect, vi, beforeEach } from 'vitest'
import renderLocationNotFoundView from './renderLocationNotFoundView.js'
import { LOCATION_NOT_FOUND } from '../../data/constants.js'

describe('renderLocationNotFoundView', () => {
  let mockH, notFoundLocation, english, lang

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnValue('rendered-not-found-view')
    }

    notFoundLocation = {
      paragraphs: [
        'Sorry, we cannot find that location.',
        'Please try searching again.'
      ],
      heading: 'Location Not Found Service'
    }

    english = {
      footerTxt: 'Footer Text',
      phaseBanner: 'Beta Phase',
      backlink: 'Back to previous page',
      cookieBanner: 'We use cookies'
    }

    lang = 'en'
  })

  it('should render location not found view with all required data', () => {
    const result = renderLocationNotFoundView(
      notFoundLocation,
      english,
      lang,
      mockH
    )

    expect(mockH.view).toHaveBeenCalledWith(LOCATION_NOT_FOUND, {
      paragraph: notFoundLocation.paragraphs,
      serviceName: notFoundLocation.heading,
      footerTxt: english.footerTxt,
      phaseBanner: english.phaseBanner,
      backlink: english.backlink,
      cookieBanner: english.cookieBanner,
      lang: 'en'
    })

    expect(result).toBe('rendered-not-found-view')
  })

  it('should handle Welsh language correctly', () => {
    const welshLang = 'cy'

    const result = renderLocationNotFoundView(
      notFoundLocation,
      english,
      welshLang,
      mockH
    )

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        lang: 'cy'
      })
    )

    expect(result).toBe('rendered-not-found-view')
  })

  it('should handle empty paragraphs array', () => {
    const notFoundLocationEmpty = {
      paragraphs: [],
      heading: 'Empty Location Service'
    }

    const result = renderLocationNotFoundView(
      notFoundLocationEmpty,
      english,
      lang,
      mockH
    )

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        paragraph: [],
        serviceName: 'Empty Location Service'
      })
    )

    expect(result).toBe('rendered-not-found-view')
  })

  it('should handle undefined notFoundLocation properties gracefully', () => {
    const incompleteNotFoundLocation = {
      paragraphs: undefined,
      heading: undefined
    }

    const result = renderLocationNotFoundView(
      incompleteNotFoundLocation,
      english,
      lang,
      mockH
    )

    expect(mockH.view).toHaveBeenCalledWith(
      LOCATION_NOT_FOUND,
      expect.objectContaining({
        paragraph: undefined,
        serviceName: undefined,
        footerTxt: english.footerTxt,
        lang: 'en'
      })
    )

    expect(result).toBe('rendered-not-found-view')
  })
})
