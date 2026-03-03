// Routes for SMS send new code page ''
import {
  handleSendNewCodeRequest,
  handleSendNewCodePost
} from './controller.js'

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
  }
]

export { routes }
