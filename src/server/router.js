import inert from '@hapi/inert'

import { health } from '~/src/server/health'
import { home } from '~/src/server/home/index'
import { searchLocation } from '~/src/server/search-location/index'
import { serveStaticFiles } from '~/src/server/common/helpers/serve-static-files'

const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register([inert])
      await server.register([health, home, searchLocation, serveStaticFiles])
    }
  }
}

export { router }
