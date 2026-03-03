import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

// Define controllers with default handler behavior
const alertsSuccessGetController = {
  handler: handleAlertsSuccessRequest
}

const alertsSuccessPostController = {
  handler: handleAlertsSuccessPost
}

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-success',
    ...getController
  },
  {
    method: 'POST',
    path: '/notify/register/sms-success',
    ...postController
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(
  alertsSuccessGetController,
  alertsSuccessPostController
)

export {
  routes,
  configureRoutes,
  alertsSuccessGetController,
  alertsSuccessPostController
}
