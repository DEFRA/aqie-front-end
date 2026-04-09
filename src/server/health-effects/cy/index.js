// Hapi plugin for Welsh Health Effects page (CY, dynamic route)
import { healthEffectsController } from '../controller.js'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()

const healthEffectsCy = {
  name: 'healthEffectsCy',
  version: '1.0.1',
  register: async (server) => {
    try {
      // Welsh dynamic route: /lleoliad/{id}/effeithiau-iechyd
      server.route({
        method: 'GET',
        path: '/lleoliad/{id}/effeithiau-iechyd',
        handler: healthEffectsController.handler
      })

      // Legacy redirect: /location/{id}/health-effects?lang=cy -> /lleoliad/{id}/effeithiau-iechyd
      server.ext('onPreHandler', (request, h) => {
        try {
          const wantsCy =
            ((request.query.lang || '') + '').toLowerCase() === 'cy'
          const m = request.path.match(/^\/location\/([^/]+)\/health-effects$/i)
          if (wantsCy && m?.[1]) {
            const id = encodeURIComponent(m[1])
            return h.redirect(`/lleoliad/${id}/effeithiau-iechyd`).takeover()
          }
        } catch (e) {
          logger.warn(e, "'' CY onPreHandler redirect failed")
        }
        return h.continue
      })

      logger.info(
        "'' Registered Welsh route '/lleoliad/{id}/effeithiau-iechyd'"
      )
    } catch (error) {
      logger.error(error, "'' Failed to register Welsh health effects route")
      throw error
    }
  }
}

export { healthEffectsCy }
