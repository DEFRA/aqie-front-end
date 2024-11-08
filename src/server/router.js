import inert from '@hapi/inert'
import yar from '@hapi/yar'
import { home } from '~/src/server/home/index'
import { homeCy } from '~/src/server/home/cy/index'
import { searchLocation } from '~/src/server/search-location/index'
import { searchLocationCy } from '~/src/server/search-location/cy/index'
import { locations } from '~/src/server/locations/index'
import { locationsCy } from '~/src/server/locations/cy/index'
import { locationId } from '~/src/server/location-id/index'
import { locationIdCy } from '~/src/server/location-id/cy/index'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files'
import { nitrogenDioxide } from '~/src/server/nitrogen-dioxide/index'
import { nitrogenDioxideCy } from '~/src/server/nitrogen-dioxide/cy/index'
import { ozone } from '~/src/server/ozone/index'
import { ozoneCy } from '~/src/server/ozone/cy/index'
import { particulateMatter10 } from '~/src/server/particulate-matter-10/index'
import { particulateMatter10Cy } from '~/src/server/particulate-matter-10/cy/index'
import { particulateMatter25 } from '~/src/server/particulate-matter-25/index'
import { particulateMatter25Cy } from '~/src/server/particulate-matter-25/cy/index'
import { sulphurDioxide } from '~/src/server/sulphur-dioxide/index'
import { sulphurDioxideCy } from '~/src/server/sulphur-dioxide/cy/index'
import { privacy } from '~/src/server/privacy/index'
import { privacyCy } from '~/src/server/privacy/cy/index'
import { cookies } from '~/src/server/cookies/index'
import { cookiesCy } from '~/src/server/cookies/cy/index'
import { accessibility } from '~/src/server/accessibility/index'
import { accessibilityCy } from '~/src/server/accessibility/cy/index'
import { health } from '~/src/server/health/index'
import { config } from '~/src/config'
import Boom from '@hapi/boom'

const sessionCookiePassword = config.get('sessionCookiePassword')

const options = {
  storeBlank: false,
  cookieOptions: {
    password: sessionCookiePassword,
    isSecure: true
  },
  errorOnCacheNotReady: true,
  maxCookieSize: 0,
  cache: {
    cache: 'session'
  }
}

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert])
      await server.register([
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
        health
      ])

      // Route to simulate a 500 error
      server.route({
        method: 'GET',
        path: '/simulate-500',
        handler: (request, h) => {
          throw Boom.internal('Simulated Internal Server Error')
        }
      })
      // Route to simulate a 404 error
      server.route({
        method: 'GET',
        path: '/simulate-404',
        handler: (request, h) => {
          throw Boom.notFound('Simulated Page Not Found')
        }
      })
      // Route to simulate a 403 error
      server.route({
        method: 'GET',
        path: '/simulate-403',
        handler: (request, h) => {
          throw Boom.forbidden('Simulated Forbidden Error')
        }
      })
      // Route to simulate a 401 error
      server.route({
        method: 'GET',
        path: '/simulate-401',
        handler: (request, h) => {
          throw Boom.unauthorized('Simulated Unauthorized Error')
        }
      })
      // Route to simulate a 400 error
      server.route({
        method: 'GET',
        path: '/simulate-400',
        handler: (request, h) => {
          throw Boom.badRequest('Simulated Bad Request Error')
        }
      })
      await server.register({
        plugin: yar,
        options
      })
    }
  }
}

export { router }
