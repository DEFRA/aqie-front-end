/**
 * Mock DAQI Test Route
 *
 * This route allows you to test different DAQI levels by passing a level parameter.
 * Add this to your routes to enable DAQI color testing.
 *
 * Usage: http://localhost:3000/test-daqi?level=7
 */

import { mockLevelColor } from '../common/helpers/mock-daqi-level.js'

export default [
  {
    method: 'GET',
    path: '/test-daqi',
    options: {
      description: 'Test DAQI levels and colors',
      notes: 'Pass ?level=0-10 to test different DAQI levels',
      tags: ['api', 'testing', 'daqi']
    },
    handler: async (request, h) => {
      const level = parseInt(request.query.level) || 0

      // Validate level
      if (level < 0 || level > 10) {
        return h
          .response({
            error: 'Invalid level',
            message: 'Level must be between 0 and 10',
            validLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          })
          .code(400)
      }

      // Generate mock data
      const mockData = mockLevelColor(level, {
        includeForecast: true,
        allSameLevel: request.query.vary !== 'true',
        logDetails: true
      })

      // Return as JSON or render view
      if (request.query.format === 'json') {
        return h
          .response({
            level,
            mockData,
            usage: {
              changeLevel: `/test-daqi?level=${level}`,
              varyForecast: `/test-daqi?level=${level}&vary=true`,
              jsonFormat: `/test-daqi?level=${level}&format=json`,
              viewFormat: `/test-daqi?level=${level}`
            }
          })
          .code(200)
      }

      // Render in location view with mock data
      return h.view('location', {
        airQuality: mockData,
        location: {
          name: `Mock DAQI Test - Level ${level}`,
          region: 'Test Region'
        },
        daqi: request.i18n.daqi || {},
        // Add other necessary view context
        isMockMode: true,
        mockLevel: level
      })
    }
  },

  {
    method: 'GET',
    path: '/test-daqi-all',
    options: {
      description: 'Test all DAQI levels at once',
      notes: 'Display all DAQI levels (0-10) for comparison',
      tags: ['api', 'testing', 'daqi']
    },
    handler: async (request, h) => {
      const allLevels = []

      for (let level = 0; level <= 10; level++) {
        const mockData = mockLevelColor(level, {
          includeForecast: false,
          logDetails: false
        })
        allLevels.push({
          level,
          data: mockData
        })
      }

      return h
        .response({
          message: 'All DAQI levels (0-10)',
          levels: allLevels,
          usage: {
            testSpecificLevel: '/test-daqi?level=7',
            documentation: 'Pass level parameter (0-10) to test specific level'
          }
        })
        .code(200)
    }
  }
]
