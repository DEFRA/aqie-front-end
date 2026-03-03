import { STATUS_OK } from '../data/constants.js'

const healthController = {
  handler: (_request, h) => {
    return h.response({ message: 'success' }).code(STATUS_OK)
  }
}

export { healthController }
