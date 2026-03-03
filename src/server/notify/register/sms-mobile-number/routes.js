import { handleNotifyRequest, handleNotifyPost } from './controller.js'

// Define controllers with default handler behavior
const notifyGetController = {
  handler: handleNotifyRequest
}

const notifyPostController = {
  handler: handleNotifyPost
}

// Define the route configuration function ''
const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/sms-mobile-number',
    ...getController
  },
  {
    method: 'POST',
    path: '/notify/register/sms-mobile-number',
    ...postController
  }
]

// Define the routes using the configuration function ''
const routes = configureRoutes(notifyGetController, notifyPostController)

export { routes, configureRoutes, notifyGetController, notifyPostController }
