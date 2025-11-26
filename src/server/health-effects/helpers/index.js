// '' Import postcode formatter
import { formatUKPostcode } from '../../locations/helpers/convert-string.js' // ''

// '' Build a context-aware back link model using only provided content
// Params: { backLinkText, backLinkUrl } from controller logic or content
function buildBackLinkModel({ backLinkText, backLinkUrl }) {
  return {
    text: backLinkText,
    href: backLinkUrl
  }
}
// '' Pure helpers for health-effects feature

// '' Derive readable location name with postcode and place name
const getReadableLocationName = (query = {}, params = {}, logger) => {
  try {
    const searchTerms = (query.searchTerms || '').trim() // '' Postcode
    const locationName = (query.locationName || '').trim() // '' Place name

    // '' Format postcode properly (uppercase with space separator)
    const formattedPostcode = searchTerms ? formatUKPostcode(searchTerms) : '' // ''

    // '' Build formatted string: "N8 7GE, Hornsey" or fallback
    if (formattedPostcode && locationName) {
      return `${formattedPostcode}, ${locationName}` // ''
    }
    if (formattedPostcode) {
      return formattedPostcode // ''
    }
    if (locationName) {
      return locationName // ''
    }

    // '' Fallback: normalize params.id and format
    const rawId = (params.id || '').trim() // ''
    if (!rawId) return '' // ''
    const normalized = rawId
      .replace(/[_-]+/gi, ' ') // '' Convert delimiters to space
      .replace(/\s+/g, ' ') // '' Collapse multiple spaces
      .trim() // ''
    return formatUKPostcode(normalized) // '' Format as postcode if possible
  } catch (e) {
    logger && logger.warn(e, "'' Failed to derive readable locationName")
    return ''
  }
}

// '' Compose view model for template
const buildHealthEffectsViewModel = ({
  content = {},
  metaSiteUrl = '',
  readableName = '',
  lang = 'en',
  locationId = ''
} = {}) => {
  const {
    healthEffects,
    footerTxt,
    cookieBanner,
    phaseBanner,
    multipleLocations: { serviceName = '' } = {}
  } = content || {}

  // Generate back link URL based on locationId and language
  const backLinkUrl = locationId
    ? lang === 'cy'
      ? `/lleoliad/${locationId}?lang=cy`
      : `/location/${locationId}?lang=en`
    : lang === 'cy'
      ? '/chwilio-lleoliad/cy?lang=cy'
      : '/search-location?lang=en'

  return {
    pageTitle:
      healthEffects?.pageTitle ||
      'How you can reduce your exposure to air pollution', // ''
    description: healthEffects?.description || '', // ''
    metaSiteUrl, // ''
    healthEffects, // ''
    page: 'How you can reduce your exposure to air pollution', // ''
    displayBacklink: true, // ''
    customBackLink: !!readableName, // '' Add for template compatibility
    backLinkUrl, // ''
    backLinkHref: backLinkUrl, // ''
    locationName: readableName, // ''
    locationId, // '' Include locationId for template use
    phaseBanner, // ''
    footerTxt, // ''
    cookieBanner, // ''
    serviceName, // ''
    lang // ''
  }
}

export {
  getReadableLocationName,
  buildHealthEffectsViewModel,
  buildBackLinkModel
} // ''
