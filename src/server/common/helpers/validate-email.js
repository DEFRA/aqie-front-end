// Constants for validation ''
const ERROR_EMPTY = 'Enter your email address'
const ERROR_FORMAT =
  'Enter an email address in the correct format, like name@example.com'
const ERROR_TOO_LONG = 'Email address must be 256 characters or less'
const MAX_EMAIL_LENGTH = 256

function hasValidEmailStructure(value) {
  if (value.includes(' ')) {
    return false
  }

  const atIndex = value.indexOf('@')
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false
  }

  const localPart = value.slice(0, atIndex)
  const domainPart = value.slice(atIndex + 1)
  if (!localPart || !domainPart || domainPart.startsWith('.')) {
    return false
  }

  const lastDotIndex = domainPart.lastIndexOf('.')
  if (lastDotIndex <= 0 || lastDotIndex === domainPart.length - 1) {
    return false
  }

  return true
}

/**
 * Validates email addresses
 * @param {string} email - The email address to validate
 * @returns - { isValid: boolean, formatted: string, error: string }
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

  // Basic email structure validation using linear-time string checks
  if (!hasValidEmailStructure(trimmed)) {
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
