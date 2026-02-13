/* eslint-disable no-new */

import '../stylesheets/application.scss'

import '../images/favicon.ico'
import '../images/favicon.svg'
import '../images/govuk-icon-180.png'
import '../images/govuk-icon-192.png'
import '../images/govuk-icon-512.png'
import '../images/govuk-icon-mask.svg'
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
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing CookieBanner...') // eslint-disable-line no-console
}
const $cookieBanner = document.querySelector(COOKIE_BANNER_SELECTOR)
if ($cookieBanner) {
  initializeComponent(CookieBanner, $cookieBanner)
  if (process.env.NODE_ENV === 'development') {
    console.log('CookieBanner initialized successfully') // eslint-disable-line no-console
  }
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
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing Analytics...') // eslint-disable-line no-console
}
initializeAnalytics()
if (process.env.NODE_ENV === 'development') {
  console.log('Analytics initialized successfully') // eslint-disable-line no-console
}

// Initialise cookie page
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing CookiesPage...') // eslint-disable-line no-console
}
const $cookiesPage = document.querySelector(COOKIES_PAGE_SELECTOR)
if ($cookiesPage) {
  initializeComponent(CookiesPage, $cookiesPage)
  if (process.env.NODE_ENV === 'development') {
    console.log('CookiesPage initialized successfully') // eslint-disable-line no-console
  }
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

// DAQI label/bar alignment: measure columns and set CSS variable so labels and bar stay aligned
import daqiColumns from './daqi-columns.js'
// DAQI accessibility enhancements: improve screen reader support and keyboard navigation
import daqiAccessibility from './daqi-accessibility.js'
// '' Search loading preloader removed

if (daqiColumns && typeof daqiColumns.init === 'function') {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    daqiColumns.init()
  } else {
    window.addEventListener('DOMContentLoaded', () => daqiColumns.init())
  }
}

// Initialize DAQI accessibility enhancements
if (
  daqiAccessibility &&
  typeof daqiAccessibility.initDAQIAccessibility === 'function'
) {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    daqiAccessibility.initDAQIAccessibility()
  } else {
    window.addEventListener('DOMContentLoaded', () =>
      daqiAccessibility.initDAQIAccessibility()
    )
  }
}
