// Debug endpoint to clear mock alert storage (non-production only) ''
import {
  clearMockAlerts,
  getMockAlertStorageSnapshot
} from '../../common/services/notify.js'
import { config } from '../../../config/index.js'
import { HTTP_STATUS_OK } from '../../data/constants.js'

export default {
  plugin: {
    name: 'notify-debug-clear-mock-storage',
    register: async (server) => {
      const isProduction = config.get('env') === 'production'

      // Only register debug endpoints in non-production environments ''
      if (!isProduction) {
        server.route([
          {
            method: 'POST',
            path: '/notify/debug/clear-mock-storage',
            handler: async (_request, h) => {
              const count = clearMockAlerts()
              return h
                .response({
                  success: true,
                  message: `Cleared ${count} mock alerts from server memory`,
                  clearedCount: count
                })
                .code(HTTP_STATUS_OK)
            }
          },
          {
            method: 'GET',
            path: '/notify/debug/mock-storage',
            handler: async (_request, h) => {
              const snapshot = getMockAlertStorageSnapshot()
              return h
                .response({
                  success: true,
                  totalAlerts: snapshot.length,
                  alerts: snapshot
                })
                .code(HTTP_STATUS_OK)
            }
          }
        ])

        server.log(
          ['info'],
          'Debug endpoints registered: POST /notify/debug/clear-mock-storage, GET /notify/debug/mock-storage'
        )
      }
    }
  }
}
