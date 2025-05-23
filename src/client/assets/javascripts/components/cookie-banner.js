import * as CookieFunctions from './cookie-functions.js'

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
    try {
      if (!this.isValidModule($module)) {
        this.isValid = false // Set a flag to indicate invalid initialization
        return // Exit early without returning a value
      }

      this.isValid = true // Set a flag to indicate valid initialization
      this.$cookieBanner = $module

      if (!this.initializeElements($module)) {
        this.isValid = false // Set the flag to invalid
        return // Exit early without returning a value
      }

      this.initializeBanner()
    } catch (error) {
      console.error('Failed to initialize CookieBanner:', error) // eslint-disable-line no-console
      this.isValid = false // Set the flag to invalid in case of an error
    }
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
      !this.onCookiesPage() // Avoid initializing on the cookies page
    )
  }

  /**
   * Initialize elements in the cookie banner
   *
   * @param {Element} $module - HTML element
   * @returns {boolean} Returns true if all elements are initialized successfully
   */
  initializeElements($module) {
    const $acceptButton = $module.querySelector(cookieBannerAcceptSelector)
    const $rejectButton = $module.querySelector(cookieBannerRejectSelector)
    const $cookieMessage = $module.querySelector(cookieMessageSelector)
    const $cookieConfirmationAccept = $module.querySelector(
      cookieConfirmationAcceptSelector
    )
    const $cookieConfirmationReject = $module.querySelector(
      cookieConfirmationRejectSelector
    )
    const $cookieBannerHideButtons = $module.querySelectorAll(
      cookieBannerHideButtonSelector
    )

    if (
      !($acceptButton instanceof HTMLButtonElement) ||
      !($rejectButton instanceof HTMLButtonElement) ||
      !($cookieMessage instanceof HTMLElement) ||
      !($cookieConfirmationAccept instanceof HTMLElement) ||
      !($cookieConfirmationReject instanceof HTMLElement) ||
      !$cookieBannerHideButtons.length
    ) {
      return false // Return false if any element is invalid
    }

    this.$acceptButton = $acceptButton
    this.$rejectButton = $rejectButton
    this.$cookieMessage = $cookieMessage
    this.$cookieConfirmationAccept = $cookieConfirmationAccept
    this.$cookieConfirmationReject = $cookieConfirmationReject
    this.$cookieBannerHideButtons = $cookieBannerHideButtons

    return true // Return true if all elements are valid
  }

  /**
   * Initialize the cookie banner
   */
  initializeBanner() {
    if (!this.isValid) {
      return // Ensure the banner is valid before initializing
    }
    const currentConsentCookie = CookieFunctions.getConsentCookie()

    if (
      !currentConsentCookie ||
      !CookieFunctions.isValidConsentCookie(currentConsentCookie)
    ) {
      // Reset cookies if the consent cookie is invalid
      CookieFunctions.resetCookies()
      this.$cookieBanner.removeAttribute('hidden')
    }

    this.$acceptButton.addEventListener('click', () => this.acceptCookies())
    this.$rejectButton.addEventListener('click', () => this.rejectCookies())

    this.$cookieBannerHideButtons.forEach(($cookieBannerHideButton) => {
      $cookieBannerHideButton.addEventListener('click', () => this.hideBanner())
    })
  }

  /**
   * Hide banner
   */
  hideBanner() {
    this.$cookieBanner.setAttribute('hidden', 'true')
  }

  /**
   * Accept cookies
   */
  acceptCookies() {
    // Do actual cookie consent bit
    CookieFunctions.setConsentCookie({ analytics: true })

    // Hide banner and show confirmation message
    this.$cookieMessage.setAttribute('hidden', 'true')
    this.revealConfirmationMessage(this.$cookieConfirmationAccept)
  }

  /**
   * Reject cookies
   */
  rejectCookies() {
    // Do actual cookie consent bit
    CookieFunctions.setConsentCookie({ analytics: false })

    // Hide banner and show confirmation message
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

    // Set tabindex to -1 to make the confirmation banner focusable with JavaScript
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
