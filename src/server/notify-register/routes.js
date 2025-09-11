import { 
  getMobilePhoneController,
  postMobilePhoneController,
  getConfirmMobileController,
  postConfirmMobileController,
  getActivationCodeController,
  postActivationCodeController,
  getConfirmAlertController,
  postConfirmAlertController,
  getSuccessController,
  getTextAlertsController,
  postTextAlertsController,
  getEmailAlertsController
} from './controller.js'

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
  {
    method: 'GET',
    path: '/notify/mobile-phone',
    ...getMobilePhoneController
  },
  {
    method: 'POST',
    path: '/notify/mobile-phone',
    ...postMobilePhoneController
  },
  {
    method: 'GET',
    path: '/notify/confirm-mobile',
    ...getConfirmMobileController
  },
  {
    method: 'POST',
    path: '/notify/confirm-mobile',
    ...postConfirmMobileController
  },
  {
    method: 'GET',
    path: '/notify/activation-code',
    ...getActivationCodeController
  },
  {
    method: 'POST',
    path: '/notify/activation-code',
    ...postActivationCodeController
  },
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
  }
]

export { routes }
