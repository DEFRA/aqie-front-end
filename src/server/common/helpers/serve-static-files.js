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
