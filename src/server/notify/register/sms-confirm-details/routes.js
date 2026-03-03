import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

// Define controllers with default handler behavior
const confirmAlertDetailsGetController = {
  handler: handleConfirmAlertDetailsRequest
}

const confirmAlertDetailsPostController = {
  handler: handleConfirmAlertDetailsPost
}

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-confirm-details',
    ...getController
  },
  {
    method: 'POST',
    path: '/notify/register/sms-confirm-details',
    ...postController
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(
  confirmAlertDetailsGetController,
  confirmAlertDetailsPostController
)

export {
  routes,
  configureRoutes,
  confirmAlertDetailsGetController,
  confirmAlertDetailsPostController
}
