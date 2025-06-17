// import { getLocationDataController } from '~/src/server/locations/controller'
// import { locations } from '~/src/server/locations/index'
// import { searchMiddleware } from '~/src/server/locations/middleware.js'
// import Hapi from '@hapi/hapi'

// describe.skip('location index plugin - en', () => {
//   // let server

//   // beforeEach(() => {
//   //   server = {
//   //     route: jest.fn()
//   //   }
//   // })
//   let server

//   beforeAll(async () => {
//     server = Hapi.server()
//     await locations.plugin.register(server)
//   })

//   beforeEach(() => {
//     jest.mock('./controller', () => ({
//       getLocationDataController: {
//         handler: jest.fn(),
//         options: {}
//       }
//     }))
//   })

//   test.skip('should register location route', () => {
//     const routes = server.table()
//     const locationRoute = routes.find(
//       (routes) => routes.path === '/location' && routes.method === 'get'
//       //   (routes) => routes.options.pre === expect(searchMiddleware).toBeDefined()
//     )
//     expect(locationRoute).toBeDefined()
//     expect(locationRoute.settings.handler).toBe(
//       getLocationDataController.handler
//     )
//   })

//   test.skip('should register routes correctly', async () => {
//     await locations.plugin.register(server)

//     expect(server.route).toHaveBeenCalledWith([
//       {
//         method: ['GET', 'POST'],
//         path: '/location',
//         options: {
//           pre: [{ method: searchMiddleware, assign: 'location' }]
//         },
//         ...getLocationDataController
//       }
//     ])
//   })
// })

import Hapi from '@hapi/hapi'
import { locations } from '~/src/server/locations/index'
import { getLocationDataController } from '~/src/server/locations/controller'
import { searchMiddleware } from '~/src/server/locations/middleware'

jest.mock('~/src/server/locations/controller')
jest.mock('~/src/server/locations/middleware')

describe('Location Plugin', () => {
  let server

  beforeAll(async () => {
    server = Hapi.server({ port: 3000 })
    await server.register(locations.plugin)
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should register the location route', async () => {
    const routes = server.table()
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/location')
    expect(routes[0].method).toEqual(['get', 'post'])
  })

  it('should call searchMiddleware and getLocationDataController', async () => {
    searchMiddleware.mockImplementation((request, h) => h.continue)
    getLocationDataController.handler = jest.fn((request, h) =>
      h.response('success')
    )

    const response = await server.inject({
      method: 'GET',
      url: '/location'
    })

    expect(searchMiddleware).toHaveBeenCalled()
    expect(getLocationDataController.handler).toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
    expect(response.result).toBe('success')
  })

  it('should handle POST requests to /location', async () => {
    searchMiddleware.mockImplementation((request, h) => h.continue)
    getLocationDataController.handler = jest.fn((request, h) =>
      h.response('success')
    )

    const response = await server.inject({
      method: 'POST',
      url: '/location'
    })

    expect(searchMiddleware).toHaveBeenCalled()
    expect(getLocationDataController.handler).toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
    expect(response.result).toBe('success')
  })
})
