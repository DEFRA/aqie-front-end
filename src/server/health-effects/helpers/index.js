// '' Pure helpers for health-effects feature

// '' Derive readable location name (query wins; fallback normalises params.id)
const getReadableLocationName = (query = {}, params = {}, logger) => {
  try {
    const rawQuery = (query.locationName || query.searchTerms || '').trim(); // ''
    if (rawQuery) return rawQuery; // ''
    const rawId = (params.id || '').trim(); // ''
    if (!rawId) return ''; // ''
    // '' Replace underscores / hyphens with spaces; collapse whitespace
    return rawId
      .replace(/[_-]+/gi, ' ')   // '' Convert delimiters to space
      .replace(/\s+/g, ' ')      // '' Collapse multiple spaces
      .trim(); // ''
  } catch (e) {
    logger && logger.warn(e, "'' Failed to derive readable locationName");
    return '';
  }
}

// '' Build backlink model (history-based navigation)
const buildBackLinkModel = (readableName = '') => {
  const safeName = readableName || 'this location'; // '' Fallback descriptor
  return {
    backLinkUrl: 'javascript:history.back()', // '' Use browser history
    backLinkText: `Air pollution in ${safeName}` // ''
  };
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
  } = content || {};

  const { backLinkUrl, backLinkText } = buildBackLinkModel(readableName); // ''

  return {
    pageTitle: healthEffects?.pageTitle || 'Health effects of air pollution', // ''
    description: healthEffects?.description || '', // ''
    metaSiteUrl, // ''
    healthEffects, // ''
    page: 'Health effects of air pollution', // ''
    displayBacklink: true, // ''
    customBackLink: !!readableName, // '' Add for template compatibility
    backLinkText, // ''
    backLinkUrl, // ''
    backLinkHref: backLinkUrl, // ''
    backlink: { text: backLinkText, href: backLinkUrl }, // ''
    locationName: readableName, // ''
    locationId, // '' Include locationId for template use
    phaseBanner, // ''
    footerTxt, // ''
    cookieBanner, // ''
    serviceName, // ''
    lang // ''
  };
}

export {
  getReadableLocationName,
  buildBackLinkModel,
  buildHealthEffectsViewModel
} // ''