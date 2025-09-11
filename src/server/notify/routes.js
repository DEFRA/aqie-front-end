import { notifyController, notifyPostController } from './controller.js'

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-mobile-number',
    handler: getController.handler
  },
  {
    method: 'POST',
    path: '/notify/register/sms-mobile-number',
    handler: postController.handler
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(notifyController, notifyPostController)

export { routes, configureRoutes }
