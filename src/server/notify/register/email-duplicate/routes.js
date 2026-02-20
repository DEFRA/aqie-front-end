import { handleEmailDuplicateRequest } from './controller.js'
import { config } from '../../../../config/index.js'

// Define controllers with default handler behavior ''
const duplicateGetController = {
  handler: handleEmailDuplicateRequest
}

// Define the route configuration function ''
const configureRoutes = (getController) => {
  const emailDuplicatePath = config.get('notify.emailDuplicatePath')
  return [
    {
      method: 'GET',
      path: emailDuplicatePath,
      ...getController
    }
  ]
}

// Define the routes using the configuration function ''
const routes = configureRoutes(duplicateGetController)

export { routes, configureRoutes, duplicateGetController }
