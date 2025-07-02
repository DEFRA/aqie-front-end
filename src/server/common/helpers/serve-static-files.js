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
          path: '/public/images/{param*}',
          handler: {
            directory: {
              path: path.join(__dirname, '../../../../.public/assets/images'),
              redirectToSlash: true,
              index: true
            }
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
          path: '/public/javascripts/{param*}',
          handler: {
            directory: {
              path: path.join(
                __dirname,
                '../../../../.public/assets/javascripts'
              ),
              redirectToSlash: true,
              index: true
            }
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
          path: '/public/stylesheets/{param*}',
          handler: {
            directory: {
              path: path.join(
                __dirname,
                '../../../../.public/assets/stylesheets'
              ),
              redirectToSlash: true,
              index: true
            }
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
              path: path.join(__dirname, '../../../../.public'),
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
