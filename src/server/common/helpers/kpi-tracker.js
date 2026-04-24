import { v4 as uuidv4 } from 'uuid'
import { createLogger } from './logging/logger.js'

const logger = createLogger()

/**
 * KPI Tracker: plugin that intercepts logs and stores them in OpenSearch.
 */
export const kpiTracker = {
  name: 'kpiTracker',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onPreHandler', (request, h) => {
      // 1. Clean the path and initialize Journey ID
      // Using trim() and a fallback to '/' handles empty strings from the trailing slash stripper
      const path = request.path.trim() || '/'

      let journeyId = request.yar.get('journeyId')

      if (!journeyId) {
        journeyId = uuidv4()
        request.yar.set('journeyId', journeyId)
      }

      // 2. Define milestones using .includes for better proxy/subfolder resilience
      const isStart = path === '/'
      const isComplete =
        path.includes('/location/') || path.includes('/lleoliad/')

      // 3. If a milestone is hit, dispatch the telemetry
      if (isStart || isComplete) {
        const payload = {
          'log.level': 'info', // Explicitly setting this at the root of our object
          event_family: 'kpi_metric',
          event_name: isStart
            ? 'transaction_initiated'
            : 'transaction_completed',
          journey_id: journeyId,
          service: 'check-air-quality',
          metadata: {
            url_path: path,
            is_welsh: path.includes('/lleoliad/'),
            timestamp: new Date().toISOString()
          }
        }

        logger.info(payload)
      }

      return h.continue
    })
  }
}
