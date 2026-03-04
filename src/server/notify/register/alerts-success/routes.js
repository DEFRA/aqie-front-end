// Routes for alerts success (email + sms reuse) ''
import {
  handleAlertsSuccessRequest,
  handleAlertsSuccessPost
} from './controller.js'

// '' Welsh placeholder path for alerts-success
const ALERTS_SUCCESS_PATH_CY = '/hysbysiad/cofrestru/rhybuddion-llwyddiant'

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
  },
  {
    method: 'GET',
    path: ALERTS_SUCCESS_PATH_CY,
    ...getController
  },
  {
    method: 'POST',
    path: ALERTS_SUCCESS_PATH_CY,
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
