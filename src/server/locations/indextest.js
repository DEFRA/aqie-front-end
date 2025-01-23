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
