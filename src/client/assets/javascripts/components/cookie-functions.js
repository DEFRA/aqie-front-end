/**
 * Cookie functions
 * ================
 *
 * Used by the cookie banner component and cookies page pattern.
 *
 * Includes function `Cookie()` for getting, setting, and deleting cookies, and
 * functions to manage the users' consent to cookies.
 *
 * Note: there is an inline script in cookie-banner.njk to show the banner
 * as soon as possible, to avoid a high Cumulative Layout Shift (CLS) score.
 * The consent cookie version is defined in cookie-banner.njk
 */

import Analytics from './load-analytics.js'

/* Name of the cookie to save users cookie preferences to. */
const CONSENT_COOKIE_NAME = 'airaqie_cookies_policy'

/* Google Analytics tracking IDs for preview and live environments. */
const TRACKING_PREVIEW_ID = '26179049-17'
const TRACKING_LIVE_ID = '116229859-1'

/* Users can (dis)allow different groups of cookies. */
const COOKIE_CATEGORIES = {
  analytics: [
    '_ga',
    '_gid',
    `_gat_UA-${TRACKING_PREVIEW_ID}`,
    `_gat_UA-${TRACKING_LIVE_ID}`
  ],
  essential: ['airaqie_cookies_policy'] // Essential cookies
}

/* Default cookie preferences if user has no cookie preferences. */
const DEFAULT_COOKIE_CONSENT = {
  analytics: false
}

/**
 * Set, get, and delete cookies.
 *
 * @param {string} name - Cookie name
 * @param {string | false | null} [value] - Cookie value
 * @param {{ days?: number }} [options] - Cookie options
 * @returns {string | null | undefined} - Returns value when setting or deleting
 */
export function Cookie(name, value, options) {
  if (typeof value !== 'undefined') {
    if (value === false || value === null) {
      return deleteCookie(name) // Return result of deleteCookie
    } else {
      if (typeof options === 'undefined') {
        options = { days: 30 } // Default expiry date of 30 days
      }
      return setCookie(name, value, options) // Return result of setCookie
    }
  }
  return getCookie(name) // Return result of getCookie
}

/**
 * Return the user's cookie preferences.
 *
 * @returns {ConsentPreferences | null} Consent preferences
 */
export function getConsentCookie() {
  const consentCookie = getCookie(CONSENT_COOKIE_NAME)
  if (!consentCookie) {
    return null // Return null if no consent cookie exists
  }

  try {
    return JSON.parse(consentCookie) // Return parsed consent cookie
  } catch (error) {
    return null // Return null if parsing fails
  }
}

/**
 * Check the cookie preferences object.
 *
 * @param {ConsentPreferences | null} options - Consent preferences
 * @returns {boolean} True if consent cookie is valid
 */
export function isValidConsentCookie(options) {
  // @ts-expect-error Property does not exist on window
  return !!(options && options.version >= window.AQ_CONSENT_COOKIE_VERSION) // Return true if valid
}

/**
 * Update the user's cookie preferences.
 *
 * @param {ConsentPreferences} options - Consent options to parse
 * @returns {void}
 */
export function setConsentCookie(options) {
  const cookieConsent =
    getConsentCookie() || JSON.parse(JSON.stringify(DEFAULT_COOKIE_CONSENT)) // Use default if no preferences

  for (const option in options) {
    cookieConsent[option] = options[option] // Merge preferences
  }

  delete cookieConsent.essential // Essential cookies cannot be deselected

  // @ts-expect-error Property does not exist on window
  cookieConsent.version = window.AQ_CONSENT_COOKIE_VERSION

  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(cookieConsent), { days: 365 }) // Set consent cookie
  resetCookies() // Update other cookies
}

/**
 * Apply the user's cookie preferences.
 *
 * @returns {void}
 */
export function resetCookies() {
  const options =
    getConsentCookie() || JSON.parse(JSON.stringify(DEFAULT_COOKIE_CONSENT)) // Use default if no preferences

  for (const cookieType in options) {
    if (cookieType === 'version' || cookieType === 'essential') {
      continue // Skip version and essential cookies
    }

    if (cookieType === 'analytics' && options[cookieType]) {
      window[`ga-disable-UA-${TRACKING_PREVIEW_ID}`] = false
      window[`ga-disable-UA-${TRACKING_LIVE_ID}`] = false
      Analytics() // Enable GA if allowed
    } else {
      window[`ga-disable-UA-${TRACKING_PREVIEW_ID}`] = true
      window[`ga-disable-UA-${TRACKING_LIVE_ID}`] = true
    }

    if (!options[cookieType]) {
      const cookiesInCategory = COOKIE_CATEGORIES[cookieType]
      cookiesInCategory.forEach((cookie) => {
        Cookie(cookie, null) // Delete cookie
      })
    }
  }
}

/**
 * Check if user allows cookie category.
 *
 * @param {string} cookieCategory - Cookie type
 * @param {ConsentPreferences} cookiePreferences - Consent preferences
 * @returns {boolean} True if user allows the cookie category
 */
function userAllowsCookieCategory(cookieCategory, cookiePreferences) {
  if (cookieCategory === 'essential') {
    return true // Essential cookies are always allowed
  }

  try {
    return !!cookiePreferences[cookieCategory] // Return true if allowed
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
    return false // Return false if malformed
  }
}

/**
 * Check if user allows cookie.
 *
 * @param {string} cookieName - Cookie name
 * @returns {boolean} True if user allows the cookie
 */
function userAllowsCookie(cookieName) {
  if (cookieName === CONSENT_COOKIE_NAME) {
    return true // Always allow setting the consent cookie
  }

  let cookiePreferences = getConsentCookie()
  if (!isValidConsentCookie(cookiePreferences)) {
    cookiePreferences = DEFAULT_COOKIE_CONSENT // Use default if invalid
  }

  for (const category in COOKIE_CATEGORIES) {
    const cookiesInCategory = COOKIE_CATEGORIES[category]
    if (cookiesInCategory.includes(cookieName)) {
      return userAllowsCookieCategory(category, cookiePreferences) // Return result
    }
  }

  return false // Deny the cookie if it is not known
}

/**
 * Get cookie by name.
 *
 * @param {string} name - Cookie name
 * @returns {string | null} Cookie value
 */
function getCookie(name) {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0, len = cookies.length; i < len; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length)) // Return cookie value
    }
  }
  return null // Return null if not found
}

/**
 * Set cookie by name, value, and options.
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {{ days?: number }} [options] - Cookie options
 * @returns {void}
 */
function setCookie(name, value, options) {
  if (userAllowsCookie(name)) {
    options = options || {}
    let cookieString = `${name}=${value}; path=/`
    if (options.days) {
      const date = new Date()
      date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000)
      cookieString += `; expires=${date.toUTCString()}`
    }
    if (document.location.protocol === 'https:') {
      cookieString += '; Secure'
    }
    document.cookie = cookieString // Set the cookie
  }
}

/**
 * Delete cookie by name.
 *
 * @param {string} name - Cookie name
 * @returns {void}
 */
function deleteCookie(name) {
  if (Cookie(name)) {
    const domain = window.location.hostname
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${domain};path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.${domain};path=/`
  }
}
