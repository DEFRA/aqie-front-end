/* eslint-disable no-new */

import '../stylesheets/application.scss'

import '../images/favicon.ico'
import '../images/favicon.svg'
import '../images/govuk-icon-180.png'
import '../images/govuk-icon-192.png'
import '../images/govuk-icon-512.png'
import '../images/govuk-icon-mask.svg'

// Import JavaScript detection to run on page load
import './javascript-detection.js'

import CookieBanner from './components/cookie-banner.mjs'
import Analytics from './components/load-analytics.mjs'
import {
  getConsentCookie,
  isValidConsentCookie,
  removeUACookies
} from './components/cookie-functions.mjs'
import CookiesPage from './components/cookies-page.mjs'
import { COOKIE_BANNER_SELECTOR, COOKIES_PAGE_SELECTOR } from './constants.mjs'

/**
 * Initialise a component with a given constructor and element.
 * @param {Function} Component - The component constructor.
 * @param {HTMLElement} element - The DOM element to initialize the component with.
 */
async function initializeComponent(Component, element) {
  try {
    const instance = new Component(element)
    if (typeof instance.init === 'function') {
      await instance.init() // Call an async `init` method if it exists
    }
    return instance
  } catch (error) {
    console.error(`Failed to initialize component: ${Component.name}`, error) // eslint-disable-line no-console
    return undefined // Explicitly return undefined in case of an error
  }
}

// Initialise cookie banner
console.log('Initializing CookieBanner...')
const $cookieBanner = document.querySelector(COOKIE_BANNER_SELECTOR)
if ($cookieBanner) {
  initializeComponent(CookieBanner, $cookieBanner)
  console.log('CookieBanner initialized successfully')
} else {
  console.warn('Cookie banner element not found') // eslint-disable-line no-console
}

/**
 * Initialise analytics if consent is given.
 */
function initializeAnalytics() {
  const userConsent = getConsentCookie() || { analytics: false }
  if (
    userConsent &&
    isValidConsentCookie(userConsent) &&
    userConsent.analytics
  ) {
    Analytics()

    // Remove UA cookies if the user previously had them set or Google attempts
    // to set them
    removeUACookies()
  }
}

// Call the analytics initialization function
console.log('Initializing Analytics...')
initializeAnalytics()
console.log('Analytics initialized successfully')

// Initialise cookie page
console.log('Initializing CookiesPage...')
const $cookiesPage = document.querySelector(COOKIES_PAGE_SELECTOR)
if ($cookiesPage) {
  initializeComponent(CookiesPage, $cookiesPage)
  console.log('CookiesPage initialized successfully')
} else {
  console.warn('Cookies page element not found') // eslint-disable-line no-console
}

// Initialise all GOV.UK Frontend components
// Initialise all GOV.UK Frontend components
import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Tabs
} from 'govuk-frontend'
createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
createAll(Tabs)

// ===== JAVASCRIPT DETECTION - INLINE =====
// Adding this directly here since the import wasn't working
console.log('=== JAVASCRIPT DETECTION SCRIPT LOADED ===')
console.log('🟢 JavaScript detection script is running!')
console.log('⏰ Timestamp:', new Date().toISOString())

window.jsDetectionLoaded = true
window.jsDetectionTimestamp = new Date().toISOString()

// Send a simple POST request to confirm JavaScript is working
console.log('🚀 ABOUT TO SEND FETCH REQUEST to /api/js-enabled')
fetch('/api/js-enabled', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'same-origin'
})
  .then(function (response) {
    console.log('✅ JS ping sent successfully! Status:', response.status)
    console.log('📍 Response URL:', response.url)
    return response.json()
  })
  .then(function (data) {
    console.log('📩 Server response:', data)
    console.log('🎉 JavaScript detection completed successfully!')
    window.jsDetectionCompleted = true
  })
  .catch(function (error) {
    console.log('❌ JS ping failed:', error)
    console.log('🔍 Error details:', error.message)
    window.jsDetectionFailed = true
  })
