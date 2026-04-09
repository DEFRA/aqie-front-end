// Hapi plugin for the Health Effects page (EN, dynamic route)
import { healthEffectsController } from './controller.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

const healthEffects = {
  name: 'healthEffects',
  version: '1.0.1',
  register: async (server) => {
    try {
      // English dynamic route: /location/{id}/health-effects
      server.route({
        method: 'GET',
        path: '/location/{id}/health-effects',
        handler: healthEffectsController.handler
      })

      // Legacy redirect: /lleoliad/{id}/effeithiau-iechyd?lang=en -> /location/{id}/health-effects
      server.ext('onPreHandler', (request, h) => {
        try {
          // Match legacy Welsh path: /lleoliad/{id}/effeithiau-iechyd
          const m = request.path.match(
            /^\/lleoliad\/([^/]+)\/effeithiau-iechyd$/i
          )
          const wantsEn =
            ((request.query.lang || '') + '').toLowerCase() === 'en'
          if (m?.[1] && wantsEn) {
            const id = encodeURIComponent(m[1])
            return h.redirect(`/location/${id}/health-effects`).takeover()
          }
        } catch (e) {
          logger.warn(e, "'' EN onPreHandler redirect failed")
          throw e
        }
        return h.continue
      })

      logger.info("'' Registered English route '/location/{id}/health-effects'")
    } catch (error) {
      logger.error(error, "'' Failed to register English health effects route")
      throw error
    }
  }
}

export { healthEffects }
