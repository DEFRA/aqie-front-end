import { homeController } from './controller.js'

// Define the route configuration function
const configureRoutes = (controller) => [
  {
    method: 'GET',
    path: '/cy',
    ...controller
  }
]

// Define the routes using the configuration function
const routes = configureRoutes(homeController)

export { routes, configureRoutes }
