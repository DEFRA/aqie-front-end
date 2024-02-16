import inert from '@hapi/inert'
import yar from '@hapi/yar'
import { health } from '~/src/server/health'
import { home } from '~/src/server/home/index'
import { searchLocation } from '~/src/server/search-location/index'
import { locations } from '~/src/server/locations/index'
import { locationId } from '~/src/server/location-id/index'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files'

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
        serveStaticFiles
      ])
      await server.register({
        plugin: yar,
        options
      })
    }
  }
}

export { router }
