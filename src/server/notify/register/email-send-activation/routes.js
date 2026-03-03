import {
  handleEmailSendActivationRequest,
  handleEmailSendActivationPost
} from './controller.js'

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/email-send-activation',
    handler: getController.handler
  },
  {
    method: 'POST',
    path: '/notify/register/email-send-activation',
    handler: postController.handler
  }
]

// Create controller objects with handlers ''
const emailSendActivationGetController = {
  handler: handleEmailSendActivationRequest
}

const emailSendActivationPostController = {
  handler: handleEmailSendActivationPost
}

// Export the routes using the configuration function ''
export const routes = configureRoutes(
  emailSendActivationGetController,
  emailSendActivationPostController
)

// Export individual items for testing ''
export {
  configureRoutes,
  emailSendActivationGetController,
  emailSendActivationPostController
}
