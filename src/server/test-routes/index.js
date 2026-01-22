/**
 * Test Routes Plugin
 *
 * Registers test routes for DAQI and pollutant level mocking.
 * Only available in development/test environments.
 */

import mockDaqiRoutes from './mock-daqi-route.js'
import mockPollutantRoutes from './mock-pollutant-route.js'
import mockAlertStorageRoutes from './mock-alert-storage-route.js'

export const testRoutes = {
  plugin: {
    name: 'test-routes',
    register: async (server) => {
      // Register mock DAQI routes
      server.route(mockDaqiRoutes)

      // Register mock pollutant routes
      server.route(mockPollutantRoutes)

      // Register mock alert storage inspection routes
      server.route(mockAlertStorageRoutes)

      server.log(['info', 'test-routes'], 'Test routes registered successfully')
    }
  }
}
