import { handleDuplicateSubscriptionRequest } from './controller.js'
import { config } from '../../../../config/index.js'

// Define controllers with default handler behavior ''
const duplicateGetController = {
  handler: handleDuplicateSubscriptionRequest
}

// Define the route configuration function ''
const configureRoutes = (getController) => {
  const duplicateSubscriptionPath = config.get(
    'notify.duplicateSubscriptionPath'
  )
  return [
    {
      method: 'GET',
      path: duplicateSubscriptionPath,
      ...getController
    }
  ]
}

// Define the routes using the configuration function ''
const routes = configureRoutes(duplicateGetController)

export { routes, configureRoutes, duplicateGetController }
