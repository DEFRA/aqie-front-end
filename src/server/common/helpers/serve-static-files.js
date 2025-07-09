import path from 'node:path'
import { config } from '../../../config/index.js'
import { statusCodes } from '../constants/status-codes.js'

// ''
// Serve favicon.ico and favicon.svg from the correct build output location
export const serveStaticFiles = {
  plugin: {
    name: 'staticFiles',
    register(server) {
      server.route([
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: '/favicon.ico',
          handler(_request, h) {
            return h
              .file(
                path.resolve(process.cwd(), '.public/assets/images/favicon.ico')
              )
              .type('image/x-icon')
          }
        },
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: '/favicon.svg',
          handler(_request, h) {
            return h
              .file(
                path.resolve(process.cwd(), '.public/assets/images/favicon.svg')
              )
              .type('image/svg+xml')
          }
        },
        // Compatibility route for legacy /public/images/favicon.svg requests
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: '/public/images/favicon.svg',
          handler(_request, h) {
            return h
              .file(
                path.resolve(process.cwd(), '.public/assets/images/favicon.svg')
              )
              .type('image/svg+xml')
          }
        },
        // Compatibility route for legacy /public/images/favicon.ico requests
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: '/public/images/favicon.ico',
          handler(_request, h) {
            return h
              .file(
                path.resolve(process.cwd(), '.public/assets/images/favicon.ico')
              )
              .type('image/x-icon')
          }
        },
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get('staticCacheTimeout'),
              privacy: 'private'
            }
          },
          method: 'GET',
          path: `${config.get('assetPath')}/{param*}`,
          handler: {
            directory: {
              path: '.',
              redirectToSlash: true
            }
          }
        }
      ])
    }
  }
}
;('')
