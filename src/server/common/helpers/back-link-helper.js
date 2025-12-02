// '' Modular back link helper for creating consistent back link configurations
import { english } from '../../data/en/en.js'
import { welsh } from '../../data/cy/cy.js'

/**
 * Creates a back link configuration object
 * @param {Object} options - Configuration options
 * @param {string} options.text - The text to display for the back link
 * @param {string} options.url - The URL the back link should point to
 * @param {string} [options.lang='en'] - Language code ('en' or 'cy')
 * @returns {Object} Back link configuration with text, url, and display flag
 */
function createBackLink(options = {}) {
  const { text, url, lang = 'en' } = options

  // '' Validate inputs
  if (!text || !url) {
    return {
      displayBacklink: false,
      backLinkText: '',
      backLinkUrl: '',
      customBackLink: false
    }
  }

  return {
    displayBacklink: true,
    backLinkText: text,
    backLinkUrl: url,
    customBackLink: true
  }
}

/**
 * Creates a default back link to search location page
 * @param {string} [lang='en'] - Language code ('en' or 'cy')
 * @returns {Object} Back link configuration for search location page
 */
function createSearchLocationBackLink(lang = 'en') {
  const backLinkText =
    lang === 'cy' ? 'Chwilio am leoliad' : 'Search for a location'
  const backLinkUrl =
    lang === 'cy' ? '/chwilio-lleoliad/cy?lang=cy' : '/search-location?lang=en'

  return createBackLink({
    text: backLinkText,
    url: backLinkUrl,
    lang
  })
}

/**
 * Creates a back link to a location page
 * @param {Object} options - Configuration options
 * @param {string} options.locationId - The location ID
 * @param {string} [options.locationName] - Optional location name
 * @param {string} [options.searchTerms] - Optional search terms (e.g., postcode)
 * @param {string} [options.lang='en'] - Language code ('en' or 'cy')
 * @returns {Object} Back link configuration for location page
 */
function createLocationBackLink(options = {}) {
  const { locationId, locationName, searchTerms, lang = 'en' } = options

  if (!locationId) {
    return createSearchLocationBackLink(lang)
  }

  // '' Build back link text based on available information
  let backLinkText
  if (searchTerms && locationName) {
    backLinkText =
      lang === 'cy'
        ? `Llygredd aer yn ${searchTerms}, ${locationName}`
        : `Air pollution in ${searchTerms}, ${locationName}`
  } else if (searchTerms) {
    backLinkText =
      lang === 'cy'
        ? `Llygredd aer yn ${searchTerms}`
        : `Air pollution in ${searchTerms}`
  } else if (locationName) {
    backLinkText =
      lang === 'cy'
        ? `Llygredd aer yn ${locationName}`
        : `Air pollution in ${locationName}`
  } else {
    backLinkText =
      lang === 'cy' ? 'Chwilio am leoliad' : 'Search for a location'
  }

  // '' Build back link URL
  const locationPath =
    lang === 'cy' ? `/lleoliad/${locationId}` : `/location/${locationId}`
  const langParam = lang === 'cy' ? 'lang=cy' : 'lang=en'
  const backLinkUrl = `${locationPath}?${langParam}`

  return createBackLink({
    text: backLinkText,
    url: backLinkUrl,
    lang
  })
}

export { createBackLink, createSearchLocationBackLink, createLocationBackLink }
