/**
 * Mock Pollutant Test Routes
 *
 * This provides test routes to mock different pollutant band levels for testing and visualization.
 * Add this to your routes to enable pollutant color testing.
 *
 * Usage:
 * - Test all pollutants with same band: http://localhost:3000/test-pollutants?band=high
 * - Test specific pollutants: http://localhost:3000/test-pollutants-custom?NO2=moderate&PM25=high&O3=low
 * - View all bands: http://localhost:3000/test-pollutants-all
 */

import {
  mockPollutantBand,
  mockPollutantLevel,
  getAvailableBands
} from '../common/helpers/mock-pollutant-level.js'

export default [
  {
    method: 'GET',
    path: '/test-pollutants',
    options: {
      description: 'Test pollutant band levels and colors',
      notes:
        'Pass ?band=low|moderate|high|very-high to test different pollutant bands',
      tags: ['api', 'testing', 'pollutants']
    },
    handler: async (request, h) => {
      const band = request.query.band || 'moderate'

      // Normalize band
      const normalizedBand = band.toLowerCase().replace(/\s+/g, '-')

      // Validate band
      const validBands = ['low', 'moderate', 'high', 'very-high']
      if (!validBands.includes(normalizedBand)) {
        return h
          .response({
            error: 'Invalid band',
            message: `Band must be one of: ${validBands.join(', ')}`,
            validBands,
            usage: {
              examples: [
                '/test-pollutants?band=low',
                '/test-pollutants?band=moderate',
                '/test-pollutants?band=high',
                '/test-pollutants?band=very-high'
              ]
            }
          })
          .code(400)
      }

      // Generate mock pollutants
      const mockPollutants = mockPollutantBand(normalizedBand, {
        logDetails: true
      })

      // Return as JSON or info page
      if (request.query.format === 'json') {
        return h
          .response({
            band: normalizedBand,
            mockPollutants,
            usage: {
              changeBand: `/test-pollutants?band=${normalizedBand}`,
              jsonFormat: `/test-pollutants?band=${normalizedBand}&format=json`,
              customPollutants: '/test-pollutants-custom',
              viewAll: '/test-pollutants-all'
            }
          })
          .code(200)
      }

      // Return HTML response
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock Pollutant Test - ${normalizedBand}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .band-selector { margin: 20px 0; }
        .band-selector a { 
            display: inline-block; 
            padding: 10px 15px; 
            margin: 5px; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
        }
        .band-selector a.active { background: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .daqi-tag { 
            padding: 5px 10px; 
            border-radius: 4px; 
            color: white; 
            font-weight: bold; 
            display: inline-block;
        }
        .daqi-tag--low { background: #00CC00; }
        .daqi-tag--moderate { background: #FFFF00; color: black; }
        .daqi-tag--high { background: #FF9900; }
        .daqi-tag--very-high { background: #FF0000; }
        .code-block { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        pre { margin: 0; }
    </style>
</head>
<body>
    <h1>🧪 Mock Pollutant Band Test</h1>
    <p>Testing band: <strong>${normalizedBand.toUpperCase()}</strong></p>
    
    <div class="band-selector">
        <h3>Quick Band Selection:</h3>
        <a href="/test-pollutants?band=low" ${normalizedBand === 'low' ? 'class="active"' : ''}>Low</a>
        <a href="/test-pollutants?band=moderate" ${normalizedBand === 'moderate' ? 'class="active"' : ''}>Moderate</a>
        <a href="/test-pollutants?band=high" ${normalizedBand === 'high' ? 'class="active"' : ''}>High</a>
        <a href="/test-pollutants?band=very-high" ${normalizedBand === 'very-high' ? 'class="active"' : ''}>Very High</a>
    </div>

    <h2>Mock Pollutant Data</h2>
    <table>
        <thead>
            <tr>
                <th>Pollutant</th>
                <th>Value (μg/m³)</th>
                <th>Band</th>
                <th>DAQI</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(mockPollutants)
              .map(
                ([type, data]) => `
                <tr>
                    <td><strong>${type}</strong></td>
                    <td>${data.value}</td>
                    <td><span class="daqi-tag daqi-tag--${normalizedBand}">${data.band}</span></td>
                    <td>${data.daqi}</td>
                </tr>
            `
              )
              .join('')}
        </tbody>
    </table>

    <h2>Usage in Real Application</h2>
    <p>To use this mock band in the real location pages, add the query parameter:</p>
    <div class="code-block">
        <pre>http://localhost:3000/location/123456?mockPollutantBand=${normalizedBand}</pre>
    </div>
    
    <h2>JSON Output</h2>
    <div class="code-block">
        <pre>${JSON.stringify(mockPollutants, null, 2)}</pre>
    </div>

    <h2>Other Test Routes</h2>
    <ul>
        <li><a href="/test-pollutants-custom">Custom Pollutant Levels</a> - Test specific pollutants individually</li>
        <li><a href="/test-pollutants-all">All Bands Comparison</a> - See all bands side by side</li>
        <li><a href="/test-pollutants?format=json">JSON Format</a> - Get raw JSON output</li>
    </ul>
</body>
</html>
      `

      return h.response(htmlContent).type('text/html').code(200)
    }
  },

  {
    method: 'GET',
    path: '/test-pollutants-custom',
    options: {
      description: 'Test specific pollutants with individual band levels',
      notes:
        'Pass pollutant parameters: ?NO2=moderate&PM25=high&PM10=low&O3=very-high&SO2=moderate',
      tags: ['api', 'testing', 'pollutants']
    },
    handler: async (request, h) => {
      const pollutantBands = {}

      // Extract pollutant parameters from query
      const validPollutants = ['NO2', 'PM25', 'PM10', 'O3', 'SO2']
      validPollutants.forEach((pollutant) => {
        if (request.query[pollutant]) {
          pollutantBands[pollutant] = request.query[pollutant]
        }
      })

      // If no pollutants specified, use defaults
      if (Object.keys(pollutantBands).length === 0) {
        pollutantBands.NO2 = 'moderate'
        pollutantBands.PM25 = 'high'
        pollutantBands.O3 = 'low'
      }

      // Generate mock pollutants
      const mockPollutants = mockPollutantLevel(pollutantBands, {
        logDetails: true,
        fillMissing: true
      })

      // Return as JSON
      if (request.query.format === 'json') {
        return h
          .response({
            pollutantBands,
            mockPollutants,
            usage: {
              example: '/test-pollutants-custom?NO2=moderate&PM25=high&O3=low',
              jsonFormat: '/test-pollutants-custom?format=json',
              uniformBand: '/test-pollutants?band=moderate'
            }
          })
          .code(200)
      }

      // Return HTML response
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Mock Pollutants Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .daqi-tag { 
            padding: 5px 10px; 
            border-radius: 4px; 
            color: white; 
            font-weight: bold; 
            display: inline-block;
        }
        .daqi-tag--low { background: #00CC00; }
        .daqi-tag--moderate { background: #FFFF00; color: black; }
        .daqi-tag--high { background: #FF9900; }
        .daqi-tag--very-high { background: #FF0000; }
        .form-group { margin: 10px 0; }
        label { display: inline-block; width: 100px; font-weight: bold; }
        select { padding: 5px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .code-block { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🧪 Custom Mock Pollutant Levels</h1>
    
    <h2>Select Individual Pollutant Bands</h2>
    <form method="GET" action="/test-pollutants-custom">
        ${validPollutants
          .map(
            (pollutant) => `
            <div class="form-group">
                <label for="${pollutant}">${pollutant}:</label>
                <select name="${pollutant}" id="${pollutant}">
                    <option value="low" ${pollutantBands[pollutant] === 'low' ? 'selected' : ''}>Low</option>
                    <option value="moderate" ${pollutantBands[pollutant] === 'moderate' ? 'selected' : ''}>Moderate</option>
                    <option value="high" ${pollutantBands[pollutant] === 'high' ? 'selected' : ''}>High</option>
                    <option value="very-high" ${pollutantBands[pollutant] === 'very-high' ? 'selected' : ''}>Very High</option>
                </select>
            </div>
        `
          )
          .join('')}
        <button type="submit">Apply</button>
    </form>

    <h2>Current Mock Data</h2>
    <table>
        <thead>
            <tr>
                <th>Pollutant</th>
                <th>Value (μg/m³)</th>
                <th>Band</th>
                <th>DAQI</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(mockPollutants)
              .map(([type, data]) => {
                const bandClass = data.band.toLowerCase().replace(/\s+/g, '-')
                return `
                    <tr>
                        <td><strong>${type}</strong></td>
                        <td>${data.value}</td>
                        <td><span class="daqi-tag daqi-tag--${bandClass}">${data.band}</span></td>
                        <td>${data.daqi}</td>
                    </tr>
                `
              })
              .join('')}
        </tbody>
    </table>

    <h2>URL Parameters</h2>
    <div class="code-block">
        <pre>${request.url.href}</pre>
    </div>

    <h2>Other Test Routes</h2>
    <ul>
        <li><a href="/test-pollutants?band=moderate">Uniform Band Test</a> - Test all pollutants with same band</li>
        <li><a href="/test-pollutants-all">All Bands Comparison</a> - See all bands side by side</li>
    </ul>
</body>
</html>
      `

      return h.response(htmlContent).type('text/html').code(200)
    }
  },

  {
    method: 'GET',
    path: '/test-pollutants-all',
    options: {
      description: 'Test all pollutant bands at once for comparison',
      notes: 'Display all bands (Low, Moderate, High, Very High) side by side',
      tags: ['api', 'testing', 'pollutants']
    },
    handler: async (request, h) => {
      const bands = ['low', 'moderate', 'high', 'very-high']
      const allBandsData = {}

      bands.forEach((band) => {
        allBandsData[band] = mockPollutantBand(band, { logDetails: false })
      })

      // Return as JSON
      if (request.query.format === 'json') {
        return h
          .response({
            message: 'All pollutant bands comparison',
            bands: allBandsData,
            usage: {
              testSpecificBand: '/test-pollutants?band=moderate',
              customPollutants: '/test-pollutants-custom'
            }
          })
          .code(200)
      }

      // Return HTML response
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Pollutant Bands Comparison</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; text-align: center; }
        .bands-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .band-card { border: 2px solid #ddd; border-radius: 8px; padding: 15px; background: white; }
        .band-card h2 { margin-top: 0; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        th { background-color: #f8f9fa; }
        .daqi-tag { 
            padding: 3px 8px; 
            border-radius: 4px; 
            color: white; 
            font-weight: bold; 
            display: inline-block;
            font-size: 12px;
        }
        .daqi-tag--low { background: #00CC00; }
        .daqi-tag--moderate { background: #FFFF00; color: black; }
        .daqi-tag--high { background: #FF9900; }
        .daqi-tag--very-high { background: #FF0000; }
        .band-low { border-color: #00CC00; }
        .band-moderate { border-color: #FFFF00; }
        .band-high { border-color: #FF9900; }
        .band-very-high { border-color: #FF0000; }
    </style>
</head>
<body>
    <h1>🧪 All Pollutant Bands Comparison</h1>
    
    <div class="bands-container">
        ${bands
          .map(
            (band) => `
            <div class="band-card band-${band}">
                <h2>${band.toUpperCase().replace('-', ' ')}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pollutant</th>
                            <th>Value</th>
                            <th>Band</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(allBandsData[band])
                          .map(
                            ([type, data]) => `
                            <tr>
                                <td><strong>${type}</strong></td>
                                <td>${data.value}</td>
                                <td><span class="daqi-tag daqi-tag--${band}">${data.band}</span></td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
        `
          )
          .join('')}
    </div>

    <h2 style="text-align: center; margin-top: 40px;">Available Bands</h2>
    <div style="text-align: center;">
        ${getAvailableBands()
          .map(
            (bandInfo) => `
            <a href="/test-pollutants?band=${bandInfo.key}" style="display: inline-block; padding: 10px 20px; margin: 5px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                ${bandInfo.label}
            </a>
        `
          )
          .join('')}
    </div>
</body>
</html>
      `

      return h.response(htmlContent).type('text/html').code(200)
    }
  },

  // Direct location test with mock pollutant band
  {
    method: 'GET',
    path: '/test/mock-pollutant/direct/{locationId}',
    options: {
      description: 'Direct access to location with mock pollutant band',
      notes:
        'Access location directly with mock pollutant band, bypassing search validation',
      tags: ['api', 'testing', 'pollutants']
    },
    handler: async (request, h) => {
      const locationId = request.params.locationId
      const mockPollutantBand = request.query.mockPollutantBand || 'high'

      // Set searchTermsSaved to bypass search redirect
      request.yar.set('searchTermsSaved', true)

      // Redirect to actual location page with mock parameter
      return h
        .redirect(
          `/location/${locationId}?mockPollutantBand=${encodeURIComponent(mockPollutantBand)}`
        )
        .code(302)
    }
  }
]
