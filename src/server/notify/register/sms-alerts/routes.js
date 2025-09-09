import { handleNotifyRequest, handleNotifyPost } from './controller.js'

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-alerts',
    handler: getController
  },
  {
    method: 'POST',
    path: '/notify/register/sms-alerts',
    handler: postController
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(handleNotifyRequest, handleNotifyPost)

export { routes, configureRoutes }
