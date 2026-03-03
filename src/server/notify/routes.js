import { notifyController, notifyPostController } from './controller.js'
import { config } from '../../config/index.js'

// Define the route configuration function ''
const configureRoutes = (getController, postController) => {
  const smsMobileNumberPath = config.get('notify.smsMobileNumberPath')
  return [
    {
      method: 'GET',
      path: smsMobileNumberPath,
      handler: getController.handler
    },
    {
      method: 'POST',
      path: smsMobileNumberPath,
      handler: postController.handler
    }
  ]
}

// Define the routes using the configuration function ''
const routes = configureRoutes(notifyController, notifyPostController)

export { routes, configureRoutes }
