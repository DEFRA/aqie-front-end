/**
 * Mock Alert Storage Test Route
 *
 * Exposes the in-memory mock alert storage used when the backend setup-alert
 * endpoint is unavailable (502/503/504) and mock setup is enabled.
 *
 * This route is registered only via the test-routes plugin in dev/test.
 *
 * Usage:
 * - View JSON: http://localhost:3000/test-mock-alerts
 */

import { STATUS_OK } from '../data/constants.js'
import { getMockAlertStorageSnapshot } from '../common/services/notify.js'

export default [
  {
    method: 'GET',
    path: '/test-mock-alerts',
    options: {
      description: 'Inspect in-memory mock alert storage',
      notes: 'Returns masked phone numbers and stored location/coordinates',
      tags: ['api', 'testing', 'notify']
    },
    handler: async (_request, h) => {
      const snapshot = getMockAlertStorageSnapshot()
      return h
        .response({
          count: snapshot.length,
          alerts: snapshot
        })
        .code(STATUS_OK)
    }
  }
]
