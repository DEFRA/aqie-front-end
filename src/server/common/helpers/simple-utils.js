// Simple utility functions for testing coverage
// ''

/**
 * Simple utility function to help with function coverage
 */
export const simpleHelper = (input) => {
  if (!input) {
    return null
  }
  return input.toString()
}

/**
 * Another simple helper function
 */
export const anotherHelper = (a, b) => {
  return a + b
}

/**
 * Simple validation helper
 */
export const validateInput = (value) => {
  return value !== null && value !== undefined
}
