// Routes for alerts success (email + sms reuse) ''
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

const alertsSuccessGetController = { handler: handleAlertsSuccessRequest }
const alertsSuccessPostController = { handler: handleAlertsSuccessPost }

const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/alerts-success',
    ...getController
  },
  {
    method: 'POST',
    path: '/notify/register/alerts-success',
    ...postController
  }
]

const routes = configureRoutes(
  alertsSuccessGetController,
  alertsSuccessPostController
)

export {
  routes,
  configureRoutes,
  alertsSuccessGetController,
  alertsSuccessPostController
}
// ''
