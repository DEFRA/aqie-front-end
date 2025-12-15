// Constants for validation ''
const UK_MOBILE_LENGTH_STANDARD = 11
const UK_MOBILE_LENGTH_INTERNATIONAL = 13
const ERROR_EMPTY = 'Enter your mobile phone number'
const ERROR_FORMAT = 'Enter a UK mobile phone number, like 07700 900000'

/**
 * Validates UK mobile phone numbers
 * Accepts formats: 07XXX XXXXXX, 07XXXXXXXXX, +447XXXXXXXXX, +44 7XXX XXXXXX
 * @param {string} phoneNumber - The phone number to validate
 * @returns {Object} - { isValid: boolean, formatted: string, error: string }
 */
export function validateUKMobile(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: ERROR_EMPTY
    }
  }

  // Remove all whitespace and common separators for validation ''
  const cleaned = phoneNumber.trim().replaceAll(/[\s()-]/g, '')

  // Check if empty after cleaning ''
  if (cleaned === '') {
    return {
      isValid: false,
      formatted: '',
      error: ERROR_EMPTY
    }
  }

  // UK mobile number patterns ''
  const ukMobilePattern = /^(?:(?:\+44|0)7\d{9})$/

  if (!ukMobilePattern.test(cleaned)) {
    return {
      isValid: false,
      formatted: phoneNumber,
      error: ERROR_FORMAT
    }
  }

  // Format to +44 format for storage ''
  let formatted
  if (cleaned.startsWith('+44')) {
    formatted = cleaned
  } else if (cleaned.startsWith('44')) {
    formatted = `+${cleaned}`
  } else if (cleaned.startsWith('07')) {
    const ONE = 1
    formatted = `+44${cleaned.substring(ONE)}`
  } else {
    formatted = cleaned
  }

  return {
    isValid: true,
    formatted,
    error: null
  }
}
