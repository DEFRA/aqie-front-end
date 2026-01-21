import { handleDuplicateSubscriptionRequest } from './controller.js'

// Define controllers with default handler behavior ''
const duplicateGetController = {
  handler: handleDuplicateSubscriptionRequest
}

// Define the route configuration function ''
const configureRoutes = (getController) => [
  {
    method: 'GET',
    path: '/notify/register/duplicate-subscription',
    ...getController
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(duplicateGetController)

export { routes, configureRoutes, duplicateGetController }
