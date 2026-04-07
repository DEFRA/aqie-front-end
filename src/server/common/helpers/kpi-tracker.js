import { v4 as uuidv4 } from 'uuid'
import { audit } from '@defra/cdp-auditing'

/**
 * KPI Tracker: A Hapi plugin that intercepts requests to log
 * transaction milestones to S3 (via log.level: info).
 */
export const kpiTracker = {
  name: 'kpiTracker',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onPreHandler', (request, h) => {
      // 1. Retrieve or initialize the Journey ID from the Yar session
      let journeyId = request.yar.get('journeyId')

      if (!journeyId) {
        journeyId = uuidv4()
        request.yar.set('journeyId', journeyId)
      }

      const path = request.path

      // 2. Define the milestones
      const isStart = path === '/'
      const isComplete =
        path.startsWith('/location/') || path.startsWith('/lleoliad/')

      // 3. If a milestone is hit, dispatch the telemetry
      if (isStart || isComplete) {
        audit({
          // CHANGED: 'info' routes to S3/CloudWatch, 'audit' routes to OpenSearch
          'log.level': 'info', 
          event_family: 'kpi_metric',
          event_name: isStart
            ? 'transaction_initiated'
            : 'transaction_completed',
          journey_id: journeyId,
          service: 'check-air-quality',
          metadata: {
            url_path: path,
            is_welsh: path.startsWith('/lleoliad/'),
            timestamp: new Date().toISOString()
          }
        })
      }

      return h.continue
    })
  }
}