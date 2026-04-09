// Routes for SMS send new code page ''
import {
  handleSendNewCodeRequest,
  handleSendNewCodePost
} from './controller.js'

// Welsh placeholder path for sms-send-new-code
const SMS_SEND_NEW_CODE_PATH_CY = '/hysbysiad/cofrestru/sms-anfon-cod-newydd'

const routes = [
  {
    method: 'GET',
    path: '/notify/register/sms-send-new-code',
    handler: handleSendNewCodeRequest,
    options: {
      description: 'Get SMS send new code page'
    }
  },
  {
    method: 'POST',
    path: '/notify/register/sms-send-new-code',
    handler: handleSendNewCodePost,
    options: {
      description: 'Post SMS send new code page'
    }
  },
  {
    method: 'GET',
    path: SMS_SEND_NEW_CODE_PATH_CY,
    handler: handleSendNewCodeRequest,
    options: {
      description: 'Get SMS send new code page (Welsh)'
    }
  },
  {
    method: 'POST',
    path: SMS_SEND_NEW_CODE_PATH_CY,
    handler: handleSendNewCodePost,
    options: {
      description: 'Post SMS send new code page (Welsh)'
    }
  }
]

export { routes }
