// ''
/**
 * JavaScript Detection Plugin for Hapi.js
 * Simple AJAX-based approach: defaults to FALSE, JavaScript AJAX call sets to TRUE
 *
 * This approach is clean and reliable:
 * 1. Every request assumes JavaScript is DISABLED by default
 * 2. If JavaScript is enabled, it makes an AJAX call to signal this
 * 3. The AJAX call sets a session flag that subsequent requests can use
 */

const jsDetectionMiddleware = async (request, h) => {
  // Default assumption: JavaScript is DISABLED
  request.jsEnabled = false

  // Check if JavaScript has been confirmed via AJAX call
  const sessionJsEnabled = request.yar.get('jsEnabled')
  if (sessionJsEnabled === true) {
    request.jsEnabled = true
  }

  const logger = request.logger || request.server.logger || console
  logger.info(
    `JS Detection: ${request.method} ${request.path} -> jsEnabled: ${request.jsEnabled}`
  )

  return h.continue
}

const jsDetectionPlugin = {
  name: 'jsDetection',
  version: '1.0.0',
  register: async (server, options) => {
    const logger = server.logger || console

    // Register the middleware to run on every request
    server.ext('onPreAuth', jsDetectionMiddleware)

    // AJAX endpoint for JavaScript to signal it's enabled
    server.route({
      method: 'POST',
      path: '/api/js-enabled',
      options: {
        auth: false
      },
      handler: async (request, h) => {
        try {
          const logger = request.logger || request.server.logger || console
          logger.info('✅ AJAX call received - JavaScript is ENABLED')

          // Set session flag to TRUE when JavaScript executes
          request.yar.set('jsEnabled', true)
          request.yar.set('jsLastUpdated', Date.now())

          return h
            .response({
              success: true,
              message: 'JavaScript status updated to enabled',
              timestamp: Date.now()
            })
            .code(200)
        } catch (error) {
          const logger = request.logger || request.server.logger || console
          logger.error('❌ Error in js-enabled endpoint:', error)
          return h
            .response({
              success: false,
              error: 'Failed to update JS status'
            })
            .code(500)
        }
      }
    })

    // Optional: Endpoint to explicitly disable JS (useful for testing)
    server.route({
      method: 'POST',
      path: '/api/js-disabled',
      options: {
        auth: false
      },
      handler: async (request, h) => {
        try {
          const logger = request.logger || request.server.logger || console
          logger.info('❌ JS disabled endpoint called')

          // Set session flag to FALSE
          request.yar.set('jsEnabled', false)
          request.yar.set('jsLastUpdated', Date.now())

          return h
            .response({
              success: true,
              message: 'JavaScript status updated to disabled',
              timestamp: Date.now()
            })
            .code(200)
        } catch (error) {
          const logger = request.logger || request.server.logger || console
          logger.error('❌ Error in js-disabled endpoint:', error)
          return h
            .response({
              success: false,
              error: 'Failed to update JS status'
            })
            .code(500)
        }
      }
    })

    // Development endpoints for testing and debugging
    if (process.env.NODE_ENV !== 'production') {
      // Debug endpoint to check current status
      server.route({
        method: 'GET',
        path: '/api/js-status',
        options: {
          auth: false
        },
        handler: async (request, h) => {
          const sessionJsEnabled = request.yar.get('jsEnabled')
          const lastUpdated = request.yar.get('jsLastUpdated')

          return {
            sessionJsEnabled,
            requestJsEnabled: request.jsEnabled,
            lastUpdated: lastUpdated
              ? new Date(lastUpdated).toISOString()
              : null,
            timestamp: new Date().toISOString(),
            sessionId: request.yar.id
          }
        }
      })

      // Clear JS session data for testing
      server.route({
        method: 'POST',
        path: '/api/clear-js-session',
        options: {
          auth: false
        },
        handler: async (request, h) => {
          try {
            const logger = request.logger || request.server.logger || console

            // Clear only JS-related session keys
            request.yar.clear('jsEnabled')
            request.yar.clear('jsLastUpdated')

            logger.info('🧹 JS session data cleared for testing')

            return h
              .response({
                success: true,
                message: 'JS session data cleared',
                clearedKeys: ['jsEnabled', 'jsLastUpdated'],
                timestamp: Date.now()
              })
              .code(200)
          } catch (error) {
            const logger = request.logger || request.server.logger || console
            logger.error('❌ Error clearing JS session data:', error)
            return h
              .response({
                success: false,
                error: 'Failed to clear JS session data'
              })
              .code(500)
          }
        }
      })
    }

    logger.info(
      '✅ JavaScript Detection Plugin registered (Simple AJAX approach)'
    )
  }
}

export { jsDetectionPlugin, jsDetectionMiddleware }
