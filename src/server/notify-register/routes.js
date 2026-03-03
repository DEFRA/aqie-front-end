import {
  getConfirmAlertController,
  postConfirmAlertController,
  getSuccessController,
  getTextAlertsController,
  postTextAlertsController,
  getEmailAlertsController
} from './controller.js'
import smsJourneyRoutes from './sms-journey/routes.js'
import emailJourneyRoutes from './email-journey/routes.js'

const routes = [
  {
    method: 'GET',
    path: '/notify/text-alerts',
    ...getTextAlertsController
  },
  {
    method: 'POST',
    path: '/notify/text-alerts',
    ...postTextAlertsController
  },
  {
    method: 'GET',
    path: '/notify/email-alerts',
    ...getEmailAlertsController
  },
  ...smsJourneyRoutes,
  {
    method: 'GET',
    path: '/notify/confirm-alert',
    ...getConfirmAlertController
  },
  {
    method: 'POST',
    path: '/notify/confirm-alert',
    ...postConfirmAlertController
  },
  {
    method: 'GET',
    path: '/notify/success',
    ...getSuccessController
  },
  ...emailJourneyRoutes
]

export { routes }
