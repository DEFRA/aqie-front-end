// Routes for SMS verify code page ''
import {
  handleCheckMessageRequest,
  handleCheckMessagePost
} from './controller.js'

// Welsh placeholder path for sms-verify-code
const SMS_VERIFY_CODE_PATH_CY = '/hysbysiad/cofrestru/sms-dilysu-cod'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/sms-verify-code',
    handler: handleCheckMessageRequest,
    options: {
      description: 'Get SMS verify code page'
    }
  },
  {
    method: 'POST',
    path: '/notify/register/sms-verify-code',
    handler: handleCheckMessagePost,
    options: {
      description: 'Post SMS verify code page'
    }
  },
  {
    method: 'GET',
    path: SMS_VERIFY_CODE_PATH_CY,
    handler: handleCheckMessageRequest,
    options: {
      description: 'Get SMS verify code page (Welsh)'
    }
  },
  {
    method: 'POST',
    path: SMS_VERIFY_CODE_PATH_CY,
    handler: handleCheckMessagePost,
    options: {
      description: 'Post SMS verify code page (Welsh)'
    }
  }
]

export { routes }
