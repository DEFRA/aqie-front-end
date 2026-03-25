// Client debug log route ''
import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../../config/index.js'
import { STATUS_NOT_FOUND, STATUS_OK } from '../data/constants.js'

const logger = createLogger()

const clientLogHandler = (request, h) => {
  if (config.get('isProduction')) {
    return h.response({ ok: false }).code(STATUS_NOT_FOUND)
  }

  const payload = request.payload || {}
  logger.info('Client debug log received', {
    path: request.path,
    ...payload
  })

  return h.response({ ok: true }).code(STATUS_OK)
}

const clientLogRoutes = [
  {
    method: 'POST',
    path: '/test/client-log',
    options: {
      auth: false,
      payload: {
        parse: true,
        allow: 'application/json'
      }
    },
    handler: clientLogHandler
  }
]

export { clientLogRoutes, clientLogHandler }
