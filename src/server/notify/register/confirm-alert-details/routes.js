// Routes for confirm alert details supporting both SMS and Email ''
import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

// Welsh placeholder path for confirm-alert-details
const CONFIRM_ALERT_DETAILS_PATH_CY =
  '/hysbysiad/cofrestru/cadarnhau-manylion-rhybudd'

const confirmAlertDetailsGetController = {
  handler: handleConfirmAlertDetailsRequest
}
const confirmAlertDetailsPostController = {
  handler: handleConfirmAlertDetailsPost
}

const configureRoutes = (getController, postController) => [
  {
    method: 'GET',
    path: '/notify/register/confirm-alert-details',
    ...getController
  },
  {
    method: 'POST',
    path: '/notify/register/confirm-alert-details',
    ...postController
  },
  {
    method: 'GET',
    path: CONFIRM_ALERT_DETAILS_PATH_CY,
    ...getController
  },
  {
    method: 'POST',
    path: CONFIRM_ALERT_DETAILS_PATH_CY,
    ...postController
  }
]

const routes = configureRoutes(
  confirmAlertDetailsGetController,
  confirmAlertDetailsPostController
)

export {
  routes,
  configureRoutes,
  confirmAlertDetailsGetController,
  confirmAlertDetailsPostController
}
