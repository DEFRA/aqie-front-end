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
      return // Exit early if the module is invalid
    }

    this.$cookieBanner = $module

    if (!this.initializeElements() || !this.setupEventListeners()) {
      return // Exit early if initialization or event setup fails
    }

    this.showBannerIfNoConsent() // Show the banner if no valid consent exists
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
   * @returns {boolean} Returns true if all elements are initialized successfully
   */
  initializeElements() {
    this.$acceptButton = this.$cookieBanner.querySelector(cookieBannerAcceptSelector)
    this.$rejectButton = this.$cookieBanner.querySelector(cookieBannerRejectSelector)
    this.$cookieMessage = this.$cookieBanner.querySelector(cookieMessageSelector)
    this.$cookieConfirmationAccept = this.$cookieBanner.querySelector(
      cookieConfirmationAcceptSelector
    )
    this.$cookieConfirmationReject = this.$cookieBanner.querySelector(
      cookieConfirmationRejectSelector
    )
    this.$cookieBannerHideButtons = this.$cookieBanner.querySelectorAll(
      cookieBannerHideButtonSelector
    )

    console.log('CookieBanner Elements:', {
      acceptButton: this.$acceptButton,
      rejectButton: this.$rejectButton,
      cookieMessage: this.$cookieMessage,
      cookieConfirmationAccept: this.$cookieConfirmationAccept,
      cookieConfirmationReject: this.$cookieConfirmationReject,
      cookieBannerHideButtons: this.$cookieBannerHideButtons
    })

    const isValid =
      this.$acceptButton instanceof HTMLButtonElement &&
      this.$rejectButton instanceof HTMLButtonElement &&
      this.$cookieMessage instanceof HTMLElement &&
      this.$cookieConfirmationAccept instanceof HTMLElement &&
      this.$cookieConfirmationReject instanceof HTMLElement &&
      this.$cookieBannerHideButtons.length > 0

    return isValid // Return true if all elements are valid, otherwise false
  }

  /**
   * Set up event listeners for the cookie banner
   * @returns {boolean} Returns true if listeners are set up successfully
   */
  setupEventListeners() {
    if (!this.$acceptButton || !this.$rejectButton || !this.$cookieBannerHideButtons) {
      console.error('Missing elements for event listeners:', {
        acceptButton: this.$acceptButton,
        rejectButton: this.$rejectButton,
        cookieBannerHideButtons: this.$cookieBannerHideButtons
      })
      return false // Return false if required elements are missing
    }

    this.$acceptButton.addEventListener('click', () => {
      console.log('Accept button clicked')
      this.acceptCookies()
    })
    this.$rejectButton.addEventListener('click', () => {
      console.log('Reject button clicked')
      this.rejectCookies()
    })

    this.$cookieBannerHideButtons.forEach(($cookieBannerHideButton) => {
      $cookieBannerHideButton.addEventListener('click', () => {
        console.log('Hide button clicked')
        this.hideBanner()
      })
    })

    console.log('Event listeners set up successfully')
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