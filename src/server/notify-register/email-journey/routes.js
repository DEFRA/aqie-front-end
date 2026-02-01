import {
  getEnterEmailController,
  postEnterEmailController
} from './controller.js'

const routes = [
  {
    method: 'GET',
    path: '/notify/enter-email',
    ...getEnterEmailController
  },
  {
    method: 'POST',
    path: '/notify/enter-email',
    ...postEnterEmailController
  }
]

export default routes
