import * as CookieFunctions from './cookie-functions.mjs'

const cookieBannerAcceptSelector = '.js-cookie-banner-accept' // ''
const cookieBannerRejectSelector = '.js-cookie-banner-reject' // ''
const cookieBannerHideButtonSelector = '.js-cookie-banner-hide' // ''
const cookieMessageSelector = '.js-cookie-banner-message' // ''
const cookieConfirmationAcceptSelector = '.js-cookie-banner-confirmation-accept' // ''
const cookieConfirmationRejectSelector = '.js-cookie-banner-confirmation-reject' // ''

/**
 * Website cookie banner
 */
class CookieBanner {
  /**
   * @param {Element} $module - HTML element
   */
  constructor($module) {
    if (!this.isValidModule($module)) {
      return undefined // Explicitly return undefined for invalid cases
    }

    const elementsInitialized = this.initializeElements($module)
    if (!elementsInitialized) {
      return undefined // Explicitly return undefined if elements cannot be initialized
    }

    const listenersSetUp = this.setupEventListeners()
    if (!listenersSetUp) {
      return undefined // Explicitly return undefined if event listeners cannot be set up
    }

    // Show the cookie banner if no valid consent cookie exists
    this.showBannerIfNoConsent()
  }

  /**
   * Validate the module element
   *
   * @param {Element} $module - HTML element
   * @returns {boolean} Returns true if the module is valid
   */
  isValidModule($module) {
    return (
      $module instanceof HTMLElement && // Validate $module
      document.body.classList.contains('govuk-frontend-supported') && // Check GOV.UK frontend support
      !this.onCookiesPage() // Ensure not on the Cookies page
    )
  }

  /**
   * Initialize DOM elements
   *
   * @param {Element} $module - HTML element
   * @returns {boolean} Returns true if all elements are initialized successfully
   */
  initializeElements($module) {
    this.$cookieBanner = $module

    this.$acceptButton = $module.querySelector(cookieBannerAcceptSelector)
    this.$rejectButton = $module.querySelector(cookieBannerRejectSelector)
    this.$cookieMessage = $module.querySelector(cookieMessageSelector)
    this.$cookieConfirmationAccept = $module.querySelector(
      cookieConfirmationAcceptSelector
    )
    this.$cookieConfirmationReject = $module.querySelector(
      cookieConfirmationRejectSelector
    )
    this.$cookieBannerHideButtons = $module.querySelectorAll(
      cookieBannerHideButtonSelector
    )

    const isValid =
      this.$acceptButton instanceof HTMLButtonElement &&
      this.$rejectButton instanceof HTMLButtonElement &&
      this.$cookieMessage instanceof HTMLElement &&
      this.$cookieConfirmationAccept instanceof HTMLElement &&
      this.$cookieConfirmationReject instanceof HTMLElement &&
      this.$cookieBannerHideButtons.length

    return isValid // Return true if all elements are valid, otherwise false
  }

  /**
   * Set up event listeners for the cookie banner
   * @returns {boolean} Returns true if listeners are set up successfully
   */
  setupEventListeners() {
    if (!this.$acceptButton || !this.$rejectButton || !this.$cookieBannerHideButtons) {
      return false // Return false if required elements are missing
    }

    this.$acceptButton.addEventListener('click', () => this.acceptCookies())
    this.$rejectButton.addEventListener('click', () => this.rejectCookies())

    this.$cookieBannerHideButtons.forEach(($cookieBannerHideButton) => {
      $cookieBannerHideButton.addEventListener('click', () =>
        this.hideBanner()
      )
    })

    return true // Return true if listeners are set up successfully
  }

  /**
   * Show the cookie banner if no valid consent cookie exists
   * @returns {boolean} Returns true if the banner is shown, false otherwise
   */
  showBannerIfNoConsent() {
    const currentConsentCookie = CookieFunctions.getConsentCookie()

    if (!currentConsentCookie) {
      CookieFunctions.resetCookies()
      this.$cookieBanner.removeAttribute('hidden')
      return true // Return true if the banner is shown
    }

    return false // Return false if the banner is not shown
  }

  /**
   * Hide banner
   * @returns {void}
   */
  hideBanner() {
    if (this.$cookieBanner) {
      this.$cookieBanner.setAttribute('hidden', 'true') // Hide the cookie banner
    }
  }

  /**
   * Accept cookies
   * @returns {void}
   */
  acceptCookies() {
    CookieFunctions.setConsentCookie({ analytics: true }) // Set consent for analytics cookies
    this.$cookieMessage.setAttribute('hidden', 'true') // Hide the cookie message
    this.revealConfirmationMessage(this.$cookieConfirmationAccept) // Show confirmation message
  }

  /**
   * Reject cookies
   * @returns {void}
   */
  rejectCookies() {
    CookieFunctions.setConsentCookie({ analytics: false }) // Deny consent for analytics cookies
    this.$cookieMessage.setAttribute('hidden', 'true') // Hide the cookie message
    this.revealConfirmationMessage(this.$cookieConfirmationReject) // Show confirmation message
  }

  /**
   * Reveal confirmation message
   *
   * @param {HTMLElement} confirmationMessage - Confirmation message
   * @returns {void}
   */
  revealConfirmationMessage(confirmationMessage) {
    confirmationMessage.removeAttribute('hidden') // Show the confirmation message

    if (!confirmationMessage.getAttribute('tabindex')) {
      confirmationMessage.setAttribute('tabindex', '-1') // Make it focusable

      confirmationMessage.addEventListener('blur', () => {
        confirmationMessage.removeAttribute('tabindex') // Remove tabindex after blur
      })
    }

    confirmationMessage.focus() // Focus on the confirmation message
  }

  /**
   * Check if on the Cookies page
   *
   * @returns {boolean} Returns true if on the Cookies page
   */
  onCookiesPage() {
    return window.location.pathname === '/cookies/' // Check if the current page is the cookies page
  }
}

export default CookieBanner