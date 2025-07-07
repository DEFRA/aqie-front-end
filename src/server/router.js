import inert from '@hapi/inert'
import { home } from './home/index.js'
import { homeCy } from './home/cy/index.js'
import { searchLocation } from './search-location/index.js'
import { searchLocationCy } from './search-location/cy/index.js'
import { locations } from './locations/index.js'
import { locationsCy } from './locations/cy/index.js'
import { locationId } from './location-id/index.js'
import { locationIdCy } from './location-id/cy/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { nitrogenDioxide } from './nitrogen-dioxide/index.js'
import { nitrogenDioxideCy } from './nitrogen-dioxide/cy/index.js'
import { ozone } from './ozone/index.js'
import { ozoneCy } from './ozone/cy/index.js'
import { particulateMatter10 } from './particulate-matter-10/index.js'
import { particulateMatter10Cy } from './particulate-matter-10/cy/index.js'
import { particulateMatter25 } from './particulate-matter-25/index.js'
import { particulateMatter25Cy } from './particulate-matter-25/cy/index.js'
import { sulphurDioxide } from './sulphur-dioxide/index.js'
import { sulphurDioxideCy } from './sulphur-dioxide/cy/index.js'
import { privacy } from './privacy/index.js'
import { privacyCy } from './privacy/cy/index.js'
import { cookies } from './cookies/index.js'
import { cookiesCy } from './cookies/cy/index.js'
import { accessibility } from './accessibility/index.js'
import { accessibilityCy } from './accessibility/cy/index.js'
import { health } from './health/index.js'
import { multipleResults } from './multiple-results/index.js'
import { multipleResultsCy } from './multiple-results/cy/index.js'
import { locationNotFound } from './location-not-found/index.js'
import path from 'node:path'
import { createLogger } from './common/helpers/logging/logger.js'
import { SERVER_DIRNAME } from './data/constants.js'

const logger = createLogger()

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert])

      const plugins = [
        home,
        homeCy,
        searchLocation,
        searchLocationCy,
        locations,
        locationsCy,
        locationId,
        locationIdCy,
        serveStaticFiles,
        nitrogenDioxide,
        nitrogenDioxideCy,
        ozone,
        ozoneCy,
        particulateMatter10,
        particulateMatter10Cy,
        particulateMatter25,
        particulateMatter25Cy,
        sulphurDioxide,
        sulphurDioxideCy,
        privacy,
        privacyCy,
        cookies,
        cookiesCy,
        accessibility,
        accessibilityCy,
        multipleResults,
        multipleResultsCy,
        locationNotFound,
        health
      ]

      for (const plugin of plugins) {
        const pluginName =
          plugin.name || plugin.plugin?.name || 'CustomPluginName'
        logger.info(`Registering plugin: ${pluginName}`)
        await server.register(plugin)
      }
      // Serve static files from .well-known directory
      server.route({
        method: 'GET',
        path: '/.well-known/{param*}',
        handler: {
          directory: {
            path: path.resolve(SERVER_DIRNAME, '../../.public/.well-known'),
            redirectToSlash: true,
            index: true
          }
        }
      })

      // Check for duplicate route registration
      const existingRoutes = server.table().map((route) => route.path)

      if (!existingRoutes.includes('/public/{param*}')) {
        // Serve static files from public directory
        server.route({
          method: 'GET',
          path: '/public/{param*}',
          handler: {
            directory: {
              path: path.resolve(SERVER_DIRNAME, '../../public'),
              redirectToSlash: true,
              index: true
            }
          }
        })
      } else {
        logger.warn(
          'Route /public/{param*} already exists. Skipping registration.'
        )
      }
    }
  }
}

export { router }
