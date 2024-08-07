import inert from '@hapi/inert'
import yar from '@hapi/yar'
import { checkLocalAirQuality } from '~/src/server/check-local-air-quality/index'
import { checkLocalAirQualityCy } from '~/src/server/check-local-air-quality/cy/index'
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
import { home } from '~/src/server/home/index'
import { cookies } from '~/src/server/cookies/index'
import { cookiesCy } from '~/src/server/cookies/cy/index'
import { accessibility } from '~/src/server/accessibility/index'
import { accessibilityCy } from '~/src/server/accessibility/cy/index'
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
        home,
        cookies,
        cookiesCy,
        accessibility,
        accessibilityCy,
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
