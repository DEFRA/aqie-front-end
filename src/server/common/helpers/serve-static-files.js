import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../../../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serveStaticFiles = {
  plugin: {
    name: 'staticFiles',
    register: async (server) => {
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
          handler: function (request, h) {
            return h.response().code(204).type('image/x-icon')
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
          path: '/public/{param*}',
          handler: {
            directory: {
              path: '.', // Corrected to serve files from .public
              redirectToSlash: true,
              index: true
            }
          }
        }
      ])
    }
  }
}

export { serveStaticFiles }
