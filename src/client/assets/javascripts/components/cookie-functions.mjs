/**
 * manageCookie functions
 * ================
 *
 * Used by the cookie banner component and cookies page pattern.
 *
 * Includes function `manageCookie()` for getting, setting, and deleting cookies, and
 * functions to manage the users' consent to cookies.
 *
 * Note: there is an inline script in cookie-banner.njk to show the banner
 * as soon as possible, to avoid a high Cumulative Layout Shift (CLS) score.
 * The consent cookie version is defined in cookie-banner.njk
 */

import Analytics from './load-analytics.mjs'
import { logger } from '../common/helpers/logging/logger.js'


/* Name of the cookie to save users cookie preferences to. */
const CONSENT_COOKIE_NAME = 'airaqie_cookies_analytics'

/* Google Analytics tracking IDs for preview and live environments. */
const TRACKING_PREVIEW_ID = '8F2EMQL51V'
const TRACKING_LIVE_ID = 'GHT8W0QGD9'

/* Users can (dis)allow different groups of cookies. */
const COOKIE_CATEGORIES = {
  analytics: ['_ga', `_ga_${TRACKING_PREVIEW_ID}`, `_ga_${TRACKING_LIVE_ID}`],
  /* Essential cookies
   *
   * Essential cookies cannot be deselected, but we want our cookie code to
   * only allow adding cookies that are documented in this object, so they need
   * to be added here.
   */
  essential: ['airaqie_cookies_analytics']
}

/*
 * Default cookie preferences if user has no cookie preferences.
 *
 * Note that this doesn't include a key for essential cookies, essential
 * cookies cannot be disallowed. If the object contains { essential: false }
 * this will be ignored.
 */
const DEFAULT_COOKIE_CONSENT = {
  analytics: false
}

/**
 * Set, get, and delete cookies.
 *
 *   Setting a cookie:
 *   manageCookie('hobnob', 'tasty', { days: 30 })
 *
 *   Reading a cookie:
 *   manageCookie('hobnob')
 *
 *   Deleting a cookie:
 *   manageCookie('hobnob', null)
 *
 * @param {string} name - manageCookie name
 * @param {string | false | null} [value=null] - manageCookie value
 * @param {{ days?: number }} [options={}] - manageCookie options
 * @returns {string | null | undefined} - Returns value when setting, getting, or deleting
 */
export function manageCookie(name, value = null, options = {}) {
  if (typeof value !== 'undefined') {
    if (value === false || value === null) {
      return deleteCookie(name) // Return result of deleteCookie
    }

    // Default expiry date of 30 days if options are not provided
    if (!options.days) {
      options.days = 30
    }

    return setCookie(name, value, options) // Return result of setCookie
  }

  return getCookie(name) // Return result of getCookie
}

/**
 * Return the user's cookie preferences.
 *
 * If the consent cookie is malformed, or not present,
 * returns null.
 *
 * @returns {ConsentPreferences | null} Consent preferences
 */
export function getConsentCookie() {
  const consentCookie = getCookie(CONSENT_COOKIE_NAME)
  let consentCookieObj

  if (consentCookie) {
    try {
      consentCookieObj = JSON.parse(consentCookie) // Attempt to parse the consent cookie
    } catch (error) {
      logger.error('Failed to parse consent cookie', error) // Log the error using logger.error
      return null // Return null if parsing fails
    }
  } else {
    return null // Return null if no consent cookie exists
  }

  return consentCookieObj // Return the parsed consent cookie object
}

/**
 * Check the cookie preferences object.
 *
 * If the consent object is not present, malformed, or incorrect version,
 * returns false, otherwise returns true.
 *
 * This is also duplicated in cookie-banner.njk - the two need to be kept in sync
 *
 * @param {ConsentPreferences | null} options - Consent preferences
 * @returns {boolean} True if consent cookie is valid
 */
export function isValidConsentCookie(options) {
  // @ts-expect-error Property does not exist on window
  return options && options.version >= window.AQ_CONSENT_COOKIE_VERSION
}

/**
 * Update the user's cookie preferences.
 *
 * @param {ConsentPreferences} options - Consent options to parse
 */
export function setConsentCookie(options) {
  const cookieConsent =
    getConsentCookie() ||
    // If no preferences or old version use the default
    JSON.parse(JSON.stringify(DEFAULT_COOKIE_CONSENT))

  // Merge current cookie preferences and new preferences
  for (const option in options) {
    cookieConsent[option] = options[option]
  }

  // Essential cookies cannot be deselected, ignore this cookie type
  delete cookieConsent.essential

  // @ts-expect-error Property does not exist on window
  cookieConsent.version = window.AQ_CONSENT_COOKIE_VERSION

  // Set the consent cookie
  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(cookieConsent), { days: 365 })

  // Update the other cookies
  resetCookies()
}

/**
 * Apply the user's cookie preferences
 *
 * Deletes any cookies the user has not consented to.
 */
export function resetCookies() {
  try {
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
        removeUACookies() // Remove UA cookies
      } else {
        window[`ga-disable-UA-${TRACKING_PREVIEW_ID}`] = true
        window[`ga-disable-UA-${TRACKING_LIVE_ID}`] = true
      }

      if (!options[cookieType]) {
        const cookiesInCategory = COOKIE_CATEGORIES[cookieType]
        cookiesInCategory.forEach((cookie) => {
          manageCookie(cookie, null) // Delete cookie
        })
      }
    }
  } catch (error) {
    logger.error('Failed to reset cookies', error) // Log the error using logger
  }
}

/**
 * Remove UA cookies for user and prevent Google setting them.
 *
 * We've migrated our analytics from UA (Universal Analytics) to GA4, however
 * users may still have the UA cookie set from our previous implementation.
 * Additionally, our UA properties are scheduled for deletion but until they are
 * entirely deleted, GTM is still setting UA cookies.
 */
export function removeUACookies() {
  for (const UACookie of [
    '_ga_8CMZBTDQBC',
    '_gid',
    '_gat_UA-26179049-17',
    '_gat_UA-116229859-1'
  ]) {
    manageCookie(UACookie, null)
  }
}

/**
 * Check if user allows cookie category
 *
 * @param {string} cookieCategory - manageCookie type
 * @param {ConsentPreferences} cookiePreferences - Consent preferences
 * @returns {string | boolean} manageCookie type value
 */
function userAllowsCookieCategory(cookieCategory, cookiePreferences) {
  if (cookieCategory === 'essential') {
    return true // Essential cookies are always allowed
  }

  try {
    return !!cookiePreferences[cookieCategory] // Return true if allowed
  } catch (error) {
    logger.error(`Failed to check cookie category: ${cookieCategory}`, error) // Log the error using logger.error
    return false // Return false if malformed
  }
}

/**
 * Check if user allows cookie
 *
 * @param {string} cookieName - manageCookie name
 * @returns {string | boolean} manageCookie type value
 */
function userAllowsCookie(cookieName) {
  // Always allow setting the consent cookie
  if (cookieName === CONSENT_COOKIE_NAME) {
    return true
  }

  // Get the current cookie preferences
  let cookiePreferences = getConsentCookie()

  // If no preferences or old version use the default
  if (!isValidConsentCookie(cookiePreferences)) {
    cookiePreferences = DEFAULT_COOKIE_CONSENT
  }

  for (const category in COOKIE_CATEGORIES) {
    if (Object.hasOwn(COOKIE_CATEGORIES, category)) { // Restrict loop to own properties
      const cookiesInCategory = COOKIE_CATEGORIES[category]

      if (cookiesInCategory.indexOf(cookieName) !== -1) {
        return userAllowsCookieCategory(category, cookiePreferences)
      }
    }
  }

  // Deny the cookie if it is not known to us
  return false
}

/**
 * Get cookie by name
 *
 * @param {string} name - manageCookie name
 * @returns {string | null} manageCookie value
 */
function getCookie(name) {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0, len = cookies.length; i < len; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.startsWith(nameEQ)) { // Use String#startsWith instead of String#indexOf
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return null
}

/**
 * Set cookie by name, value and options
 *
 * @param {string} name - manageCookie name
 * @param {string} value - manageCookie value
 * @param {{ days?: number }} [options] - manageCookie options
 */
function setCookie(name, value, options) {
  try {
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
  } catch (error) {
    logger.error(`Failed to set cookie: ${name}`, error) // Log the error using logger.error
  }
}

/**
 * Delete cookie by name.
 *
 * @param {string} name - manageCookie name
 * @returns {void}
 */
function deleteCookie(name) {
  try {
    if (manageCookie(name)) {
      const domain = window.location.hostname
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${domain};path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.${domain};path=/`
    }
  } catch (error) {
    logger.error(`Failed to delete cookie: ${name}`, error) // Log the error using logger
  }
}

/**
 * @typedef {object} ConsentPreferences
 * @property {boolean} [analytics] - Accept analytics cookies
 * @property {boolean} [essential] - Accept essential cookies
 *  * @property {string} [version] - Content cookie version
 */
