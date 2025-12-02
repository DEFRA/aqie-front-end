// NOSONAR - Client-side complexity justified for dynamic link parameter handling
''
/* eslint-disable n/prefer-global/window */
// DAQI Accessibility Enhancements
// GovUK tabs component handles all tab accessibility natively
// This script dynamically updates health advice based on active tab

import {
  WELSH_EXPOSURE_TEMPLATES,
  ENGLISH_EXPOSURE_TEMPLATES,
  HEALTH_ADVICE_DATA
} from './daqi-accessibility-constants.js'

function initDAQIAccessibility() {
  if (typeof document === 'undefined') {
    return
  }

  console.log('DAQI Accessibility: Initializing dynamic health advice updates')

  // Initialize dynamic health advice updates based on active tab
  initHealthAdviceUpdates()
}

function initHealthAdviceUpdates() {
  const tabsContainer = document.querySelector('.daqi-tabs')
  if (!tabsContainer) {
    console.log('No DAQI tabs found on page')
    return
  }

  // Get all tab buttons
  const tabButtons = tabsContainer.querySelectorAll('.govuk-tabs__tab')
  if (!tabButtons.length) {
    console.log('No tab buttons found')
    return
  }

  const TAB_SWITCH_DELAY = 50
  // Listen for clicks on tab buttons
  for (const tabButton of tabButtons) {
    tabButton.addEventListener('click', () => {
      // Small delay to let GovUK tabs finish switching
      setTimeout(() => {
        updateHealthAdviceForActiveTab()
      }, TAB_SWITCH_DELAY)
    })
  }

  // '' Initial load: keep default (Today) tab even if mockDay param present
  // '' Requirement update: do NOT auto-switch tab based on mockDay query param
  updateHealthAdviceForActiveTab()

  console.log(
    'Health advice updates initialized for',
    tabButtons.length,
    'tabs'
  )
}

// '' Removed mockDay tab preselection per updated requirement (keep Today active by default)

function updateHealthAdviceForActiveTab() {
  // Find the currently visible/active panel
  const activePanel = document.querySelector(
    '.govuk-tabs__panel:not(.govuk-tabs__panel--hidden)'
  )

  if (!activePanel) {
    console.log('No active panel found')
    return
  }

  // Extract DAQI data from the active panel
  const daqiBar = activePanel.querySelector('.daqi-numbered')
  if (!daqiBar) {
    console.log('No DAQI bar found in active panel')
    return
  }

  // '' Get the aria-label which contains: "Daily Air Quality Index, level 7 out of 10, high pollution"
  // '' or Welsh: "Mynegai Ansawdd Aer Dyddiol, lefel 7 allan o 10, uchel llygredd"
  const ariaLabel = daqiBar.getAttribute('aria-label')
  if (!ariaLabel) {
    return
  }

  // '' Parse the level and band from aria-label
  // '' English: "level 7 out of 10" or Welsh: "lefel 7 allan o 10"
  const levelRegex = /(?:level|lefel) (\d+)/i
  const levelMatch = levelRegex.exec(ariaLabel)
  // '' English: "out of 10, high pollution" or "out of 10, very high pollution"
  // '' Welsh: "allan o 10, uchel llygredd" or "allan o 10, uchel iawn llygredd"
  // '' Extract everything between "10, " and " pollution"/" llygredd"
  const bandRegex =
    /(?:out of|allan o) \d+,\s*([a-z]+(?:\s+[a-z]+)?)\s+(?:pollution|llygredd)/i
  const bandMatch = bandRegex.exec(ariaLabel)

  if (!levelMatch || !bandMatch) {
    return
  }

  const level = Number.parseInt(levelMatch[1], 10)
  // '' Band is already extracted without "pollution" or "llygredd" suffix
  const band = bandMatch[1].trim() // "low", "high", "cymedrol", "uchel", etc.

  console.log(`Active tab: level ${level}, band: ${band}`)

  // Update health advice content
  updateHealthAdvice(level, band)

  // '' Update exposure section content based on band
  updateExposureSection(band)

  // '' Dynamically reorder exposure vs health sections based on active tab level
  reorderExposureAndHealth(level)
}

const EXPOSURE_SECTION_ID = 'exposure-section'

// '' Helper to extract locationId from URL path
function extractLocationIdFromUrl() {
  const urlPath = globalThis.location.pathname
  const regex = /\/(location|lleoliad)\/([^/]+)/
  const match = regex.exec(urlPath)
  if (match?.[2]) {
    console.log('locationId extracted from URL:', match[2])
    return match[2]
  }
  return null
}

// '' Helper to get location data from exposure section
function getLocationData() {
  const exposureSection = document.getElementById(EXPOSURE_SECTION_ID)
  let locationId = exposureSection?.dataset.locationId ?? null
  const locationName = exposureSection?.dataset.locationName ?? null
  const searchTerms = exposureSection?.dataset.searchTerms ?? null

  // Fallback: extract locationId from URL if not in data attribute
  if (!locationId) {
    locationId = extractLocationIdFromUrl()
  }

  console.log('addQueryParametersToLinks - locationId:', locationId)
  console.log('addQueryParametersToLinks - locationName:', locationName)
  console.log('addQueryParametersToLinks - searchTerms:', searchTerms)

  return { locationId, locationName, searchTerms }
}

// '' Helper to build query parameters string
function buildQueryParams(searchTerms, locationName) {
  let queryParams = ''
  if (searchTerms) {
    queryParams += '&searchTerms=' + encodeURIComponent(searchTerms)
  }
  if (locationName) {
    queryParams += '&locationName=' + encodeURIComponent(locationName)
  }
  return queryParams
}

// '' Helper to append query params to links based on language
function appendParamsToLinks(html, queryParams) {
  const isWelsh = document.documentElement.lang === 'cy'

  if (isWelsh) {
    html = html.replaceAll(
      'effeithiau-iechyd?lang=cy',
      'effeithiau-iechyd?lang=cy' + queryParams
    )
    html = html.replaceAll(
      'camau-lleihau-amlygiad/cy?lang=cy',
      'camau-lleihau-amlygiad/cy?lang=cy' + queryParams
    )
  } else {
    html = html.replaceAll(
      'health-effects?lang=en',
      'health-effects?lang=en' + queryParams
    )
    html = html.replaceAll(
      'actions-reduce-exposure?lang=en',
      'actions-reduce-exposure?lang=en' + queryParams
    )
  }

  return html
}

function updateExposureSection(band) {
  const exposureSection = document.getElementById(EXPOSURE_SECTION_ID)
  if (!exposureSection) {
    return
  }

  // Normalize band name
  const normalizedBand = band.toLowerCase().trim()

  // Get the exposure HTML content based on band
  let exposureHtml = getExposureHtmlForBand(normalizedBand)
  if (!exposureHtml) {
    return
  }

  // '' Add locationName and searchTerms parameters to links (same as Nunjucks template does)
  exposureHtml = addQueryParametersToLinks(exposureHtml)

  // Update the exposure section content
  exposureSection.innerHTML = exposureHtml
  console.log(`Exposure section updated for band: ${normalizedBand}`)
}

// '' Adds locationId, locationName and searchTerms query parameters to exposure section links
function addQueryParametersToLinks(html) {
  const { locationId, locationName, searchTerms } = getLocationData()

  // Replace {locationId} placeholder in the HTML
  if (locationId) {
    html = html.replaceAll('{locationId}', locationId)
  }

  // Build and append query parameters to links if we have any
  const queryParams = buildQueryParams(searchTerms, locationName)
  if (queryParams) {
    console.log('addQueryParametersToLinks - queryParams:', queryParams)
    html = appendParamsToLinks(html, queryParams)
  }

  return html
}

function getExposureHtmlForBand(band) {
  const isWelsh = document.documentElement.lang === 'cy'
  const templates = isWelsh
    ? WELSH_EXPOSURE_TEMPLATES
    : ENGLISH_EXPOSURE_TEMPLATES
  return templates[band] || null
}

const DAQI_HEALTH_INSET_SELECTOR = '.daqi-health-inset'
const DAQI_HEALTH_CONTENT_SELECTOR = '.daqi-health-content'
const LOW_POLLUTION_MAX_LEVEL = 3
const HEADING_SELECTOR = 'h2.govuk-heading-m'
const HEALTH_ADVICE_EN = 'Health advice for'
const HEALTH_ADVICE_CY = 'Cyngor iechyd ar gyfer'

// Helper to find the health advice heading
function findHealthHeading() {
  const allHeadings = document.querySelectorAll(HEADING_SELECTOR)
  for (const heading of allHeadings) {
    const headingText = heading.textContent
    if (headingText.includes(HEALTH_ADVICE_EN)) {
      return { heading, isWelsh: false }
    }
    if (headingText.includes(HEALTH_ADVICE_CY)) {
      return { heading, isWelsh: true }
    }
  }
  return { heading: null, isWelsh: true }
}

// Helper to update heading text
function updateHeadingText(healthHeading, band, isWelsh) {
  if (isWelsh) {
    const welshBand = getWelshBandName(band)
    healthHeading.textContent = `${HEALTH_ADVICE_CY} lefelau ${welshBand} o lygredd aer`
  } else {
    healthHeading.textContent = `${HEALTH_ADVICE_EN} ${band} levels of air pollution`
  }
}

// Helper to handle low pollution level display
function handleLowPollution(healthHeading, adviceData) {
  const existingParagraph = healthHeading.nextElementSibling
  if (existingParagraph?.tagName === 'P') {
    existingParagraph.style.display = 'none'
    existingParagraph.textContent = ''
  }

  const insetText = document.querySelector(DAQI_HEALTH_INSET_SELECTOR)
  if (insetText) {
    insetText.style.display = 'none'
  }

  let contentDiv = document.querySelector(DAQI_HEALTH_CONTENT_SELECTOR)
  if (!contentDiv) {
    contentDiv = document.createElement('div')
    contentDiv.className = 'daqi-health-content daqi-health-content--low'
    healthHeading.after(contentDiv)
  }
  // '' Replace {locationId} placeholder and add query parameters to links
  contentDiv.innerHTML = addQueryParametersToLinks(adviceData.insetText)
  contentDiv.style.display = 'block'
  contentDiv.dataset.daqiBand = 'low'
  console.log('Low level: regular text content updated (no colored box)')
}

// Helper to handle high pollution level display
function handleHighPollution(healthHeading, adviceData, band) {
  const mainAdviceParagraph = healthHeading.nextElementSibling
  if (mainAdviceParagraph?.tagName === 'P') {
    mainAdviceParagraph.style.display = 'none'
    console.log('Main advice paragraph hidden for Moderate+ level')
  }

  const contentDiv = document.querySelector(DAQI_HEALTH_CONTENT_SELECTOR)
  if (contentDiv) {
    contentDiv.style.display = 'none'
  }

  let insetText = document.querySelector(DAQI_HEALTH_INSET_SELECTOR)
  if (!insetText) {
    insetText = document.createElement('div')
    insetText.className =
      'govuk-inset-text daqi-health-inset daqi-health-inset--moderate'
    const insertAfter = mainAdviceParagraph || healthHeading
    insertAfter.after(insetText)
    console.log('Created new inset text element')
  }

  if (adviceData.insetText) {
    insetText.style.display = 'block'
    // '' Replace {locationId} placeholder and add query parameters to links
    insetText.innerHTML = addQueryParametersToLinks(adviceData.insetText)
    console.log('Inset text content updated')

    insetText.classList.remove(
      'daqi-health-inset--low',
      'daqi-health-inset--moderate',
      'daqi-health-inset--high',
      'daqi-health-inset--veryHigh',
      'daqi-health-inset--isel',
      'daqi-health-inset--cymedrol',
      'daqi-health-inset--uchel',
      'daqi-health-inset--uchelIawn'
    )

    const bandClass = getBandClassName(band)
    insetText.classList.add(`daqi-health-inset--${bandClass}`)
    insetText.dataset.daqiBand = bandClass
    console.log(`Border color updated to ${bandClass}`)
  }
}

function updateHealthAdvice(level, band) {
  const adviceData = getAdviceForBand(band, level)
  console.log(`updateHealthAdvice called: level=${level}, band=${band}`)
  console.log('Advice data:', adviceData)

  const { heading: healthHeading, isWelsh } = findHealthHeading()
  if (!healthHeading) {
    console.log('No health advice heading found')
    return
  }

  updateHeadingText(healthHeading, band, isWelsh)

  if (level <= LOW_POLLUTION_MAX_LEVEL) {
    handleLowPollution(healthHeading, adviceData)
  } else {
    handleHighPollution(healthHeading, adviceData, band)
  }

  console.log(`Health advice updated for ${band} (level ${level})`)
}

// Helper function to normalize band name for CSS class
function getBandClassName(band) {
  const normalized = band.toLowerCase().trim()
  // Handle English band names
  if (normalized === 'very high') {
    return 'veryHigh'
  }
  // Handle Welsh band names
  if (normalized === 'uchel iawn') {
    return 'uchelIawn'
  }
  return normalized
}

// Helper function to get Welsh band name for heading
function getWelshBandName(englishBand) {
  const welshBands = {
    low: 'isel',
    moderate: 'cymedrol',
    high: 'uchel',
    'very high': 'uchel iawn'
  }
  return welshBands[englishBand.toLowerCase().trim()] || englishBand
}

function getAdviceForBand(band, _level) {
  // Normalize band name
  let normalizedBand = band.toLowerCase().trim()

  // '' Translate Welsh band names to English keys (template maps Welsh→English for JS compatibility)
  const welshToEnglishBands = {
    isel: 'low',
    cymedrol: 'moderate',
    uchel: 'high',
    'uchel iawn': 'very high'
  }

  // Check if this is a Welsh band name and translate it
  if (welshToEnglishBands[normalizedBand]) {
    normalizedBand = welshToEnglishBands[normalizedBand]
    console.log(`Translated Welsh band to English key: ${normalizedBand}`)
  }

  // '' Use server-injected data if available, otherwise fall back to hardcoded data
  if (
    globalThis.airQualityMessages !== undefined &&
    globalThis.airQualityMessages[normalizedBand]
  ) {
    console.log(`Using server-injected data for band: ${normalizedBand}`)
    return globalThis.airQualityMessages[normalizedBand]
  }

  console.log(`Using hardcoded fallback data for band: ${normalizedBand}`)
  return HEALTH_ADVICE_DATA[normalizedBand] || HEALTH_ADVICE_DATA.low
}

// Helper to find visible health content element
function findVisibleHealthContent() {
  const inset = document.querySelector(DAQI_HEALTH_INSET_SELECTOR)
  const lowContent = document.querySelector(DAQI_HEALTH_CONTENT_SELECTOR)

  if (inset && inset.style.display !== 'none') {
    return inset
  }
  if (lowContent && lowContent.style.display !== 'none') {
    return lowContent
  }
  return null
}

// Helper to get or create separator element
function getOrCreateSeparator() {
  let separator = document.querySelector(
    'hr[data-daqi-separator="between-health-exposure"]'
  )
  if (!separator) {
    separator = document.createElement('hr')
    separator.className =
      'govuk-section-break govuk-section-break--visible govuk-!-margin-top-6 govuk-!-margin-bottom-6'
    separator.dataset.daqiSeparator = 'between-health-exposure'
  }
  return separator
}

// Helper to place nodes sequentially - exposure first
function placeExposureFirst(healthHeading, exposure, separator, healthContent) {
  // Exposure -> HR -> HealthHeading -> HealthContent
  // If current order differs, rebuild sequence
  const parent = healthHeading.parentNode
  if (exposure.nextElementSibling !== separator) {
    parent.insertBefore(separator, exposure.nextSibling)
  }
  // Ensure healthHeading comes after separator
  if (separator.nextElementSibling !== healthHeading) {
    parent.insertBefore(healthHeading, separator.nextSibling)
  }
  if (healthContent && healthHeading.nextElementSibling !== healthContent) {
    parent.insertBefore(healthContent, healthHeading.nextSibling)
  }
}

function placeHealthFirst(healthHeading, exposure, separator, healthContent) {
  // HealthHeading -> HealthContent -> HR -> Exposure
  const parent = healthHeading.parentNode
  // Move health heading before exposure if needed
  if (
    healthHeading.compareDocumentPosition(exposure) &
    Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    exposure.before(healthHeading)
  }
  if (healthContent && healthHeading.nextElementSibling !== healthContent) {
    parent.insertBefore(healthContent, healthHeading.nextSibling)
  }
  // Ensure separator after healthContent
  const afterHealth = healthContent || healthHeading
  if (afterHealth.nextElementSibling !== separator) {
    parent.insertBefore(separator, afterHealth.nextSibling)
  }
  // Exposure after separator
  if (separator.nextElementSibling !== exposure) {
    parent.insertBefore(exposure, separator.nextSibling)
  }
}

// '' Reorder exposure section and health advice block depending on DAQI level
function reorderExposureAndHealth(level) {
  try {
    const exposure = document.getElementById(EXPOSURE_SECTION_ID)
    if (!exposure) {
      return
    }

    const { heading: healthHeading } = findHealthHeading()
    if (!healthHeading) {
      return
    }

    const healthContent = findVisibleHealthContent()
    const separator = getOrCreateSeparator()
    const wantExposureFirst = level <= LOW_POLLUTION_MAX_LEVEL

    if (wantExposureFirst) {
      placeExposureFirst(healthHeading, exposure, separator, healthContent)
      console.log(
        'Reordered: exposure section placed before health advice (Low level)'
      )
    } else {
      placeHealthFirst(healthHeading, exposure, separator, healthContent)
      console.log(
        'Reordered: health advice placed before exposure section (Moderate+ level)'
      )
    }
  } catch (e) {
    console.log('Reorder error', e)
  }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDAQIAccessibility)
  } else {
    initDAQIAccessibility()
  }
}

// Export for application.js
export default {
  initDAQIAccessibility
}
