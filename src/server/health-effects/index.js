// '' Hapi plugin for the Health Effects page (EN, dynamic route)
import { healthEffectsController } from './controller.js' // '' English controller
import { createLogger } from '../common/helpers/logging/logger.js' // '' Logger

const logger = createLogger() // '' Logger instance

const healthEffects = {
  name: 'healthEffects',
  version: '1.0.1',
  register: async (server) => {
    try {
      // '' English dynamic route: /location/{id}/health-effects
      server.route({
        method: 'GET',
        path: '/location/{id}/health-effects',
        handler: healthEffectsController.handler // ''
      })

      // '' Legacy redirect: /lleoliad/{id}/effeithiau-iechyd?lang=en -> /location/{id}/health-effects
      server.ext('onPreHandler', (request, h) => {
        try {
          // '' Match legacy Welsh path: /lleoliad/{id}/effeithiau-iechyd
          const m = request.path.match(/^\/lleoliad\/([^/]+)\/effeithiau-iechyd$/i) // '' Extract {id} from CY path
          const wantsEn = ((request.query.lang || '') + '').toLowerCase() === 'en' // '' Only redirect if lang=en
          if (m && m[1] && wantsEn) {
            const id = encodeURIComponent(m[1]) // '' URL-safe
            return h.redirect(`/location/${id}/health-effects`).takeover() // '' Redirect to EN dynamic
          }
        } catch (e) {
          logger.warn(e, "'' EN onPreHandler redirect failed")
          throw e // '' Propagate the error
        }
        return h.continue // ''
      })
      
      logger.info("'' Registered English route '/location/{id}/health-effects'") // ''
    } catch (error) {
      logger.error(error, "'' Failed to register English health effects route") // ''
      throw error // ''
    }
  }
}

export { healthEffects } // ''