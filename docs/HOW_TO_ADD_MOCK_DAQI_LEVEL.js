/**
 * How to Add Mock DAQI Level to Location Pages
 *
 * This guide shows how to add mock DAQI level functionality to your existing location pages
 * so you can test different DAQI levels and colors using a query parameter.
 */

/* eslint-disable no-undef */

// ==========================================
// STEP 1: Import the mock utility
// ==========================================

// Add this import at the top of your location-id/controller.js file:
// import { mockLevelColor } from '../common/helpers/mock-daqi-level.js'
// import { createLogger } from '../common/helpers/logging/logger.js'
// const logger = createLogger()

// ==========================================
// STEP 2: Add mock level helper function
// ==========================================

/**
 * Check if mock level is requested and override air quality data
 * Add this function to your controller.js file
 */
function applyMockLevel(request, airQuality) {
  // Note: In real implementation, logger and mockLevelColor are imported at the top
  const logger = console // This is just for documentation example

  const mockLevel = request.query.mockLevel

  if (mockLevel !== undefined && mockLevel !== null) {
    const level = parseInt(mockLevel, 10)

    // Validate level
    if (level >= 0 && level <= 10) {
      logger.info(`🎨 Mock DAQI Level ${level} applied`)

      // Generate mock data
      const mockData = mockLevelColor(level, {
        includeForecast: true,
        allSameLevel: true,
        logDetails: true
      })

      return mockData
    } else {
      logger.warn(`Invalid mock level: ${mockLevel}. Must be 0-10.`)
    }
  }

  // Return original data if no mock level
  return airQuality
}

// ==========================================
// STEP 3: Apply mock in buildLocationViewData
// ==========================================

/*
In your buildLocationViewData function, add the mock level check:

function buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  request  // Add request parameter
}) {
  let { title, headerTitle } = gazetteerEntryFilter(locationDetails)
  title = convertFirstLetterIntoUppercase(title)
  headerTitle = convertFirstLetterIntoUppercase(headerTitle)
  const { transformedDailySummary } = transformKeys(
    locationData.dailySummary,
    lang
  )
  
  // Get air quality values
  let { airQuality } = airQualityValues(forecastNum, lang)
  
  // ⭐ ADD THIS LINE - Apply mock level if requested
  airQuality = applyMockLevel(request, airQuality)
  
  return {
    result: locationDetails,
    airQuality,  // This will now contain mock data if mockLevel query param is present
    // ... rest of your return data
  }
}
*/

// ==========================================
// STEP 4: Pass request to buildLocationViewData
// ==========================================

/*
Find where you call buildLocationViewData and add request parameter:

const viewData = buildLocationViewData({
  locationDetails,
  nearestLocationsRange,
  locationData,
  forecastNum,
  lang,
  getMonth,
  metaSiteUrl,
  request  // ⭐ ADD THIS
})
*/

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
After implementing the above changes, you can test DAQI levels like this:

Normal page:
http://localhost:3000/location/n87ge

Test different DAQI levels:
http://localhost:3000/location/n87ge?mockLevel=0   // No data (grey)
http://localhost:3000/location/n87ge?mockLevel=1   // Low - Light green
http://localhost:3000/location/n87ge?mockLevel=2   // Low - Bright green
http://localhost:3000/location/n87ge?mockLevel=3   // Low - Medium green
http://localhost:3000/location/n87ge?mockLevel=4   // Moderate - Yellow
http://localhost:3000/location/n87ge?mockLevel=5   // Moderate - Orange-yellow
http://localhost:3000/location/n87ge?mockLevel=6   // Moderate - Orange
http://localhost:3000/location/n87ge?mockLevel=7   // High - Light red
http://localhost:3000/location/n87ge?mockLevel=8   // High - Red
http://localhost:3000/location/n87ge?mockLevel=9   // High - Dark red
http://localhost:3000/location/n87ge?mockLevel=10  // Very High - Purple

Test with other query parameters:
http://localhost:3000/location/n87ge?mockLevel=7&lang=en
http://localhost:3000/location/n87ge?searchTerms=London&mockLevel=5
*/

// ==========================================
// ALTERNATIVE: Environment Variable Control
// ==========================================

/*
If you want to enable/disable mock mode based on environment:

function applyMockLevel(request, airQuality) {
  // Only allow mocking in development
  if (process.env.NODE_ENV !== 'development') {
    return airQuality
  }
  
  const mockLevel = request.query.mockLevel
  
  if (mockLevel !== undefined && mockLevel !== null) {
    const level = parseInt(mockLevel)
    
    if (level >= 0 && level <= 10) {
      logger.info(`🎨 Mock DAQI Level ${level} applied`)
      const mockData = mockLevelColor(level, {
        includeForecast: true,
        allSameLevel: true,
        logDetails: true
      })
      return mockData
    }
  }
  
  return airQuality
}
*/

// ==========================================
// QUICK TEST
// ==========================================

/*
To quickly test if it's working:

1. Add the import and helper function to your controller
2. Add the mock level check in buildLocationViewData
3. Restart your server
4. Visit: http://localhost:3000/location/n87ge?mockLevel=7
5. You should see the DAQI bar colored in light red (level 7)
6. Check your console logs for the message: "🎨 Mock DAQI Level 7 applied"
*/

export default {
  applyMockLevel
}

/* eslint-enable no-undef */
