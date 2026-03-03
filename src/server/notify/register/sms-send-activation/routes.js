import {
  handleSendActivationRequest,
  handleSendActivationPost
} from './controller.js'

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-send-activation',
    handler: getController.handler
  },
  {
    method: 'POST',
    path: '/notify/register/sms-send-activation',
    handler: postController.handler
  }
]

// Create controller objects with handlers ''
const sendActivationGetController = {
  handler: handleSendActivationRequest
}

const sendActivationPostController = {
  handler: handleSendActivationPost
}

// Export the routes using the configuration function ''
export const routes = configureRoutes(
  sendActivationGetController,
  sendActivationPostController
)

// Export individual items for testing ''
export {
  configureRoutes,
  sendActivationGetController,
  sendActivationPostController
}
