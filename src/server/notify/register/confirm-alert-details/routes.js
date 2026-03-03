// Routes for confirm alert details supporting both SMS and Email ''
import {
  handleConfirmAlertDetailsRequest,
  handleConfirmAlertDetailsPost
} from './controller.js'

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
// ''
