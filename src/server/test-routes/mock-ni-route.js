/**
 * Mock Northern Ireland Location Route
 *
 * Provides mock NI postcode lookup responses for local development.
 */

export default [
  {
    method: 'GET',
    path: '/results',
    handler: (request, h) => {
      const HTTP_OK = 200
      const postcode = request.query.postcode || ''

      // Mock response matching NI API format
      const mockResponse = {
        results: [
          {
            postcode: postcode.toUpperCase(),
            easting: 333500,
            northing: 374000,
            town: 'Belfast',
            district: 'Belfast',
            county: 'Antrim'
          }
        ]
      }

      return h.response(mockResponse).code(HTTP_OK)
    },
    options: {
      description: 'Mock Northern Ireland postcode lookup',
      tags: ['test', 'ni', 'mock']
    }
  }
]
