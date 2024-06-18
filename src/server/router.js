import inert from '@hapi/inert'
import yar from '@hapi/yar'
import { checkLocalAirQuality } from '~/src/server/check-local-air-quality/index'
import { checkLocalAirQualityCy } from '~/src/server/check-local-air-quality/cy/index'
import { searchLocation } from '~/src/server/search-location/index'
import { locations } from '~/src/server/locations/index'
import { locationId } from '~/src/server/location-id/index'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files'
import { nitrogenDioxide } from '~/src/server/nitrogen-dioxide/index'
import { ozone } from '~/src/server/ozone/index'
import { particulateMatter10 } from '~/src/server/particulate-matter-10/index'
import { particulateMatter25 } from '~/src/server/particulate-matter-25/index'
import { sulphurDioxide } from '~/src/server/sulphur-dioxide/index'
import { privacy } from '~/src/server/privacy/index'
import { home } from '~/src/server/home/index'
import { cookies } from '~/src/server/cookies/index'
import { accessibility } from '~/src/server/accessibility/index'
import { health } from '~/src/server/health/index'
import { config } from '~/src/config'

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
        checkLocalAirQuality,
        checkLocalAirQualityCy,
        searchLocation,
        locations,
        locationId,
        serveStaticFiles,
        nitrogenDioxide,
        ozone,
        particulateMatter10,
        particulateMatter25,
        sulphurDioxide,
        privacy,
        home,
        cookies,
        accessibility,
        health
      ])
      await server.register({
        plugin: yar,
        options
      })
    }
  }
}

export { router }
