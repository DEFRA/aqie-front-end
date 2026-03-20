// Constants for validation ''
const UK_MOBILE_LENGTH_STANDARD = 11
const UK_MOBILE_LENGTH_INTERNATIONAL = 13
const ERROR_EMPTY = 'Enter your mobile phone number'
const ERROR_FORMAT = 'Enter a UK mobile phone number, like 07700 900000'
const UK_MOBILE_PREFIX = '07'
const INTERNATIONAL_UK_PREFIX = '+44'
const INTERNATIONAL_PREFIX_DIGIT_INDEX = 3
const INTERNATIONAL_LOCAL_DIGITS_OFFSET = 3
const INTERNATIONAL_NON_PLUS_LOCAL_DIGITS_OFFSET = 2
const DEFAULT_VALIDATION_ERRORS = Object.freeze({
  empty: ERROR_EMPTY,
  format: ERROR_FORMAT
})

function cleanPhoneNumber(phoneNumber) {
  return phoneNumber.trim().replaceAll(/[\s()-]/g, '')
}

function isValidUkMobileFormat(cleaned) {
  if (cleaned.startsWith(INTERNATIONAL_UK_PREFIX)) {
    return (
      cleaned.length === UK_MOBILE_LENGTH_INTERNATIONAL &&
      cleaned[INTERNATIONAL_PREFIX_DIGIT_INDEX] === '7' &&
      /^\d+$/.test(cleaned.slice(1))
    )
  }

  if (cleaned.startsWith('44')) {
    return (
      cleaned.length === UK_MOBILE_LENGTH_INTERNATIONAL - 1 &&
      cleaned[2] === '7' &&
      /^\d+$/.test(cleaned)
    )
  }

  return (
    cleaned.length === UK_MOBILE_LENGTH_STANDARD &&
    cleaned.startsWith(UK_MOBILE_PREFIX) &&
    /^\d+$/.test(cleaned)
  )
}

function normalizeToLocalFormat(cleaned) {
  if (cleaned.startsWith(INTERNATIONAL_UK_PREFIX)) {
    return `0${cleaned.substring(INTERNATIONAL_LOCAL_DIGITS_OFFSET)}`
  }

  if (
    cleaned.startsWith('44') &&
    cleaned.length === UK_MOBILE_LENGTH_INTERNATIONAL - 1
  ) {
    return `0${cleaned.substring(INTERNATIONAL_NON_PLUS_LOCAL_DIGITS_OFFSET)}`
  }

  return cleaned
}

/**
 * Validates UK mobile phone numbers
 * Accepts formats: 07XXX XXXXXX, 07XXXXXXXXX, +447XXXXXXXXX, +44 7XXX XXXXXX
 * @param {string} phoneNumber - The phone number to validate
 * @returns - { isValid: boolean, formatted: string, error: string }
 */
export function validateUKMobile(
  phoneNumber,
  errors = DEFAULT_VALIDATION_ERRORS
) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: errors.empty || ERROR_EMPTY
    }
  }

  // Remove all whitespace and common separators for validation ''
  const cleaned = cleanPhoneNumber(phoneNumber)

  // Check if empty after cleaning ''
  if (cleaned === '') {
    return {
      isValid: false,
      formatted: '',
      error: errors.empty || ERROR_EMPTY
    }
  }

  if (!isValidUkMobileFormat(cleaned)) {
    return {
      isValid: false,
      formatted: phoneNumber,
      error: errors.format || ERROR_FORMAT
    }
  }

  // Normalise to 07... local format for storage and display ''
  const formatted = normalizeToLocalFormat(cleaned)

  return {
    isValid: true,
    formatted,
    error: null
  }
}
