import {
  getMobilePhoneController,
  postMobilePhoneController,
  getConfirmMobileController,
  postConfirmMobileController,
  getActivationCodeController,
  postActivationCodeController
} from './controller.js'

const routes = [
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
  }
]

export default routes
