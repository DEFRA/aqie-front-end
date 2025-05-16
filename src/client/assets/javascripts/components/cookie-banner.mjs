import * as CookieFunctions from './cookie-functions.mjs'

const cookieBannerAcceptSelector = '.js-cookie-banner-accept'
const cookieBannerRejectSelector = '.js-cookie-banner-reject'
const cookieBannerHideButtonSelector = '.js-cookie-banner-hide'
const cookieMessageSelector = '.js-cookie-banner-message'
const cookieConfirmationAcceptSelector = '.js-cookie-banner-confirmation-accept'
const cookieConfirmationRejectSelector = '.js-cookie-banner-confirmation-reject'

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

  this.initializeElements($module)
  this.setupEventListeners()

  // Show the cookie banner if no valid consent cookie exists
  return this.showBannerIfNoConsent()
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
   */
  setupEventListeners() {
    if (!this.$acceptButton || !this.$rejectButton || !this.$cookieBannerHideButtons) {
      return // Exit early if required elements are missing
    }
  
    this.$acceptButton.addEventListener('click', () => this.acceptCookies())
    this.$rejectButton.addEventListener('click', () => this.rejectCookies())
  
    this.$cookieBannerHideButtons.forEach(($cookieBannerHideButton) => {
      $cookieBannerHideButton.addEventListener('click', () =>
        this.hideBanner()
      )
    })
  }

  /**
   * Show the cookie banner if no valid consent cookie exists
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
   */
  hideBanner() {
    if (this.$cookieBanner) {
      this.$cookieBanner.setAttribute('hidden', 'true') // Hide the cookie banner
    }
  }

  /**
   * Accept cookies
   */
  acceptCookies() {
    CookieFunctions.setConsentCookie({ analytics: true })
    this.$cookieMessage.setAttribute('hidden', 'true')
    this.revealConfirmationMessage(this.$cookieConfirmationAccept)
  }

  /**
   * Reject cookies
   */
  rejectCookies() {
    CookieFunctions.setConsentCookie({ analytics: false })
    this.$cookieMessage.setAttribute('hidden', 'true')
    this.revealConfirmationMessage(this.$cookieConfirmationReject)
  }

  /**
   * Reveal confirmation message
   *
   * @param {HTMLElement} confirmationMessage - Confirmation message
   */
  revealConfirmationMessage(confirmationMessage) {
    confirmationMessage.removeAttribute('hidden')

    if (!confirmationMessage.getAttribute('tabindex')) {
      confirmationMessage.setAttribute('tabindex', '-1')

      confirmationMessage.addEventListener('blur', () => {
        confirmationMessage.removeAttribute('tabindex')
      })
    }

    confirmationMessage.focus()
  }

  /**
   * Check if on the Cookies page
   *
   * @returns {boolean} Returns true if on the Cookies page
   */
  onCookiesPage() {
    return window.location.pathname === '/cookies/'
  }
}

export default CookieBanner