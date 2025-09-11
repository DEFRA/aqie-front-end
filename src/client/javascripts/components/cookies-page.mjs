import { getConsentCookie, setConsentCookie } from './cookie-functions.mjs'

/**
 * Website cookies page
 */
class CookiesPage {
  /**
   * @param {Element} $module - HTML element
   */
  constructor($module) {
    this.isValid = false // Initialize a flag to indicate validity

    if (
      !($module instanceof HTMLElement) ||
      !document.body.classList.contains('govuk-frontend-supported')
    ) {
      return // Exit early if the module is invalid
    }

    this.$page = $module

    const $cookieForm = this.$page.querySelector('.js-cookies-page-form')
    if (!($cookieForm instanceof HTMLFormElement)) {
      return // Exit early if the form is invalid
    }

    this.$cookieForm = $cookieForm

    /** @satisfies {NodeListOf<HTMLFieldSetElement>} */
    const $cookieFormFieldsets = this.$cookieForm.querySelectorAll(
      '.js-cookies-page-form-fieldset'
    )
    const $cookieFormButton = this.$cookieForm.querySelector(
      '.js-cookies-form-button'
    )

    if (
      !$cookieFormFieldsets.length ||
      !($cookieFormButton instanceof HTMLButtonElement)
    ) {
      return // Exit early if required elements are missing
    }

    this.$cookieFormFieldsets = $cookieFormFieldsets
    this.$cookieFormButton = $cookieFormButton

    const $successNotification = this.$page.querySelector(
      '.js-cookies-page-success'
    )
    if ($successNotification instanceof HTMLElement) {
      this.$successNotification = $successNotification
    }

    const cookieConsent = getConsentCookie()

    this.$cookieFormFieldsets.forEach(($cookieFormFieldset) => {
      this.showUserPreference($cookieFormFieldset, cookieConsent)
      $cookieFormFieldset.removeAttribute('hidden')
    })

    // Show submit button
    this.$cookieFormButton.removeAttribute('hidden')

    this.$cookieForm.addEventListener('submit', (event) =>
      this.savePreferences(event)
    )

    this.isValid = true // Set the flag to true if initialization is successful
  }

  /**
   * Save preferences
   *
   * @param {SubmitEvent} event - Form submit event
   * @returns {void}
   */
  savePreferences(event) {
    // Stop default form submission behaviour
    event.preventDefault()

    const preferences = {}

    this.$cookieFormFieldsets.forEach(($cookieFormFieldset) => {
      const cookieType = this.getCookieType($cookieFormFieldset)
      if (!cookieType) {
        return // Skip if cookie type is not found
      }

      const $selectedItem = $cookieFormFieldset.querySelector(
        `input[name="cookies[${cookieType}]"]:checked`
      )

      if ($selectedItem instanceof HTMLInputElement) {
        preferences[cookieType] = $selectedItem.value === 'yes'
      }
    })

    // Save preferences to cookie and show success notification
    setConsentCookie(preferences)
    return this.showSuccessNotification() // Return the result of showing the notification
  }

  /**
   * Show user preference
   *
   * @param {HTMLFieldSetElement} $cookieFormFieldset - Cookie form fieldset
   * @param {import('./cookie-functions.mjs').ConsentPreferences | null} preferences - Consent preferences
   * @returns {HTMLInputElement | null} The updated radio button or null
   */
  showUserPreference($cookieFormFieldset, preferences) {
    const cookieType = this.getCookieType($cookieFormFieldset)
    if (!cookieType) {
      return null // Exit early if the cookie type is not found
    }

    const preference = preferences?.[cookieType] ?? false // Use optional chaining and nullish coalescing
    const radioValue = preference ? 'yes' : 'no'

    /** @satisfies {HTMLInputElement | null} */
    const $radio = $cookieFormFieldset.querySelector(
      `input[name="cookies[${cookieType}]"][value=${radioValue}]`
    )
    if (!$radio) {
      return null // Exit early if the radio button is not found
    }

    $radio.checked = true
    return $radio // Return the updated radio button
  }

  /**
   * Show success notification
   * @returns {boolean} Returns true if the notification is shown, false otherwise
   */
  showSuccessNotification() {
    if (!this.$successNotification) {
      return false // Exit early if the success notification is not found
    }

    this.$successNotification.removeAttribute('hidden')

    // Set tabindex to -1 to make the element focusable with JavaScript.
    // GOV.UK Frontend will remove the tabindex on blur as the component doesn't
    // need to be focusable after the user has read the text.
    if (!this.$successNotification.getAttribute('tabindex')) {
      this.$successNotification.setAttribute('tabindex', '-1')
    }

    this.$successNotification.focus()

    // Scroll to the top of the page
    window.scrollTo(0, 0)

    return true // Return true to indicate the notification was shown
  }

  /**
   * Get cookie type
   *
   * @param {HTMLFieldSetElement} $cookieFormFieldset - Cookie form fieldset
   * @returns {string | null} Cookie type
   */
  getCookieType($cookieFormFieldset) {
    return $cookieFormFieldset.getAttribute('data-cookie-type') || null // Return the cookie type or null
  }
}

export default CookiesPage