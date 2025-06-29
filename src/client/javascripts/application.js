/* eslint-disable */
/* eslint-env browser */
/* eslint-disable no-new */

import { initAll } from 'govuk-frontend'

import '../stylesheets/application.scss'

import '../assets/images/favicon.ico'
import '../assets/images/favicon.svg'
import '../assets/images/govuk-icon-180.png'
import '../assets/images/govuk-icon-192.png'
import '../assets/images/govuk-icon-512.png'
import '../assets/images/govuk-icon-mask.svg'

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
const $cookieBanner = document.querySelector(COOKIE_BANNER_SELECTOR)
if ($cookieBanner) {
  initializeComponent(CookieBanner, $cookieBanner) // ''
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
initializeAnalytics()

// Initialise cookie page
const $cookiesPage = document.querySelector(COOKIES_PAGE_SELECTOR)
if ($cookiesPage) {
  initializeComponent(CookiesPage, $cookiesPage)
} else {
  console.warn('Cookies page element not found') // eslint-disable-line no-console
}
// Initialise all GOV.UK Frontend components
import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'
createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
