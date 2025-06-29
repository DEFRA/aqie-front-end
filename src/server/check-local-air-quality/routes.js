import { homeController } from '../home/controller.js'

// Define the route configuration function
const configureRoutes = (controller) => [
  {
    method: 'GET',
    path: '/',
    ...controller
  }
]

// Define the routes using the configuration function
const routes = configureRoutes(homeController)

export { routes, configureRoutes }
