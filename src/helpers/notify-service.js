/**
 * GOV.UK Notify Service
 *
 * This is a stub implementation for frontend development.
 * API integration will be added later.
 */

import { createLogger } from '../server/common/helpers/logging/logger.js'

const logger = createLogger('notify-service')

// Verification code length constant
const VERIFICATION_CODE_LENGTH = 5

/**
 * Stub implementation of Notify Service
 * API integration will be added later
 */
export const notifyService = {
  /**
   * Send SMS verification code
   * @param {string} phoneNumber - The recipient's phone number
   * @param {string} code - The verification code
   * @returns {Promise<Object>} Response object
   */
  async sendSmsCode(phoneNumber, code) {
    logger.info(`[STUB] Would send SMS code ${code} to ${phoneNumber}`)
    return {
      success: true,
      messageId: `stub-${Date.now()}`,
      message: 'SMS sent (stub)'
    }
  },

  /**
   * Send email verification code
   * @param {string} email - The recipient's email address
   * @param {string} code - The verification code
   * @returns {Promise<Object>} Response object
   */
  async sendEmailCode(email, code) {
    logger.info(`[STUB] Would send email code ${code} to ${email}`)
    return {
      success: true,
      messageId: `stub-${Date.now()}`,
      message: 'Email sent (stub)'
    }
  },

  /**
   * Verify a code
   * @param {string} code - The code to verify
   * @returns {Promise<boolean>} Whether the code is valid
   */
  async verifyCode(code) {
    logger.info(`[STUB] Would verify code ${code}`)
    // For frontend testing, accept any code with correct length
    return code?.length === VERIFICATION_CODE_LENGTH
  }
}
