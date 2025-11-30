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

// '' Helper to build formatted name from postcode and location
const buildFormattedName = (formattedPostcode, locationName) => {
  if (formattedPostcode && locationName) {
    return `${formattedPostcode}, ${locationName}`
  }
  if (formattedPostcode) {
    return formattedPostcode
  }
  if (locationName) {
    return locationName
  }
  return null
}

// '' Helper to normalize and format ID as fallback
const normalizeIdAsFallback = (params) => {
  const rawId = (params.id || '').trim()
  if (!rawId) {
    return ''
  }
  const normalized = rawId
    .replaceAll(/[_-]+/gi, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
  return formatUKPostcode(normalized)
}

// '' Derive readable location name with postcode and place name
const getReadableLocationName = (query = {}, params = {}, logger = null) => {
  try {
    const searchTerms = (query.searchTerms || '').trim()
    const locationName = (query.locationName || '').trim()
    const formattedPostcode = searchTerms ? formatUKPostcode(searchTerms) : ''
    
    const result = buildFormattedName(formattedPostcode, locationName)
    if (result) {
      return result
    }
    
    return normalizeIdAsFallback(params)
  } catch (e) {
    logger?.warn(e, "'' Failed to derive readable locationName")
    return ''
  }
}

// '' Helper to generate back link URL based on locationId and language
const generateBackLinkUrl = (locationId, lang) => {
  if (locationId) {
    return lang === 'cy'
      ? `/lleoliad/${locationId}?lang=cy`
      : `/location/${locationId}?lang=en`
  }
  return lang === 'cy'
    ? '/chwilio-lleoliad/cy?lang=cy'
    : '/search-location?lang=en'
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

  // '' Generate back link URL based on locationId and language
  const backLinkUrl = generateBackLinkUrl(locationId, lang)

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
