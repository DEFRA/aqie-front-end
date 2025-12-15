import {
  handleEmailDetailsRequest,
  handleEmailDetailsPost
} from './controller.js'

// Define controllers ''
const emailDetailsGetController = { handler: handleEmailDetailsRequest }
const emailDetailsPostController = { handler: handleEmailDetailsPost }

// Configure routes ''
const configureRoutes = (getController, postController) => [
  { method: 'GET', path: '/notify/register/email-details', ...getController },
  { method: 'POST', path: '/notify/register/email-details', ...postController }
]

const routes = configureRoutes(
  emailDetailsGetController,
  emailDetailsPostController
)

export {
  routes,
  configureRoutes,
  emailDetailsGetController,
  emailDetailsPostController
}
