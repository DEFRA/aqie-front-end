// '' - Filter to normalize Welsh and English pollutant band names to CSS class names

/**
 * Map of Welsh band names to English equivalents for CSS class consistency
 */
const WELSH_TO_ENGLISH_BAND_MAP = {
  isel: 'low',
  cymedrol: 'moderate',
  uchel: 'high',
  'uchel iawn': 'very high'
}

/**
 * Normalize pollutant band name to CSS class
 * Handles both English and Welsh band names
 *
 * @param {string} band - Band name (e.g., "Low", "Isel", "Very High", "Uchel iawn")
 * @returns {string} - Normalized CSS class name (e.g., "low", "very-high")
 */
function normalizeBandClass(band) {
  if (!band) {
    return ''
  }

  // Convert to lowercase for comparison
  const lowercaseBand = band.toLowerCase()

  // Check if it's a Welsh band and map to English
  const englishEquivalent = WELSH_TO_ENGLISH_BAND_MAP[lowercaseBand]

  // Use English equivalent if found, otherwise use the original band
  const normalizedBand = englishEquivalent || lowercaseBand

  // Convert spaces to hyphens for CSS class naming convention
  return normalizedBand.replaceAll(' ', '-')
}

export { normalizeBandClass, WELSH_TO_ENGLISH_BAND_MAP }
