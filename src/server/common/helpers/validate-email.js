// Constants for validation ''
const ERROR_EMPTY = 'Enter your email address'
const ERROR_FORMAT =
  'Enter an email address in the correct format, like name@example.com'
const ERROR_TOO_LONG = 'Email address must be 256 characters or less'
const MAX_EMAIL_LENGTH = 256

/**
 * Validates email addresses
 * @param {string} email - The email address to validate
 * @returns {Object} - { isValid: boolean, formatted: string, error: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: ERROR_EMPTY
    }
  }

  // Trim whitespace ''
  const trimmed = email.trim()

  // Check if empty after trimming ''
  if (trimmed === '') {
    return {
      isValid: false,
      formatted: '',
      error: ERROR_EMPTY
    }
  }

  // Check length ''
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return {
      isValid: false,
      formatted: trimmed,
      error: ERROR_TOO_LONG
    }
  }

  // Basic email pattern validation ''
  // This pattern follows GOV.UK Design System recommendations
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(trimmed)) {
    return {
      isValid: false,
      formatted: trimmed,
      error: ERROR_FORMAT
    }
  }

  // Convert to lowercase for consistency ''
  const formatted = trimmed.toLowerCase()

  return {
    isValid: true,
    formatted,
    error: null
  }
}
