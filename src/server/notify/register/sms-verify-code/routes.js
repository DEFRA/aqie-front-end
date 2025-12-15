// Routes for SMS verify code page ''
import {
  handleCheckMessageRequest,
  handleCheckMessagePost
} from './controller.js'

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
  }
]

export { routes }
