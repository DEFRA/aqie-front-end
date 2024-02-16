import inert from '@hapi/inert'
import yar from '@hapi/yar'
import { health } from '~/src/server/health'
import { home } from '~/src/server/home/index'
import { searchLocation } from '~/src/server/search-location/index'
import { locations } from '~/src/server/locations/index'
import { locationId } from '~/src/server/location-id/index'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files'
import { nitrogenDioxide } from '~/src/server/nitrogen-dioxide/index'
import { ozone } from '~/src/server/ozone/index'
import { particulateMatter10 } from '~/src/server/particulate-matter-10/index'
import { particulateMatter25 } from '~/src/server/particulate-matter-25/index'
import { sulphurDioxide } from '~/src/server/sulphur-dioxide/index'
import { feedback } from '~/src/server/feedback/index'

const options = {
  storeBlank: false,
  cookieOptions: {
    password: 'the-password-must-be-at-least-32-characters-long',
    isSecure: true
  }
}

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert])
      await server.register([
        health,
        home,
        searchLocation,
        locations,
        locationId,
        serveStaticFiles,
        nitrogenDioxide,
        ozone,
        particulateMatter10,
        particulateMatter25,
        sulphurDioxide,
        feedback
      ])
      await server.register({
        plugin: yar,
        options
      })
    }
  }
}

export { router }
