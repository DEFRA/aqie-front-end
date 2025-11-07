/**
 * Mock DAQI Level - Usage Examples
 *
 * This file demonstrates how to use the mock DAQI level utility
 * to test and visualize different DAQI levels with their corresponding colors.
 */

import {
  mockLevelColor,
  mockAllLevels,
  getDaqiColor,
  getDaqiLevelInfo
} from '../src/server/common/helpers/mock-daqi-level.js'

// ==========================================
// Example 1: Mock a specific DAQI level
// ==========================================
console.log('\n📊 Example 1: Mock DAQI Level 7 (High - Light Red)')
console.log('='.repeat(60))

const level7Data = mockLevelColor(7)
console.log('Mock Data for Level 7:', JSON.stringify(level7Data, null, 2))

// ==========================================
// Example 2: Mock with different options
// ==========================================
console.log('\n📊 Example 2: Mock Level 5 with varied forecast')
console.log('='.repeat(60))

const level5Varied = mockLevelColor(5, {
  includeForecast: true,
  allSameLevel: false, // Each day will have slightly different levels
  logDetails: true
})
console.log('Mock Data (varied):', JSON.stringify(level5Varied, null, 2))

// ==========================================
// Example 3: Get all DAQI levels
// ==========================================
console.log('\n📊 Example 3: Generate all DAQI levels (0-10)')
console.log('='.repeat(60))

const allLevels = mockAllLevels()
allLevels.forEach(({ level, info }) => {
  console.log(`Level ${level}: ${info.description} - Color: ${info.color}`)
})

// ==========================================
// Example 4: Get specific level information
// ==========================================
console.log('\n📊 Example 4: Get information for Level 10')
console.log('='.repeat(60))

const level10Info = getDaqiLevelInfo(10)
console.log('Level 10 Info:', level10Info)
console.log('Level 10 Color:', getDaqiColor(10))

// ==========================================
// Example 5: Testing each level visually
// ==========================================
console.log('\n📊 Example 5: Visual Test - All Levels')
console.log('='.repeat(60))

for (let level = 0; level <= 10; level++) {
  const info = getDaqiLevelInfo(level)
  console.log(
    `Level ${level.toString().padStart(2)}: ${info.band.padEnd(12)} | Color: ${info.color.padEnd(12)} | ${info.description}`
  )
}

// ==========================================
// Example 6: Use in route handler (pseudocode)
// ==========================================
console.log('\n📊 Example 6: Route Handler Integration')
console.log('='.repeat(60))
console.log(`
// In your route handler:
handler: async (request, h) => {
  // Option 1: Use query parameter to set mock level
  const mockLevel = request.query.mockLevel
  
  if (mockLevel) {
    const mockData = mockLevelColor(parseInt(mockLevel))
    // Use mockData instead of real API data
    return h.view('location', {
      airQuality: mockData,
      // ... other view data
    })
  }
  
  // Option 2: Use middleware to inject mock
  // injectMockLevel(request, 7)
  
  // Proceed with normal API call
  const realData = await fetchAirQualityData()
  return h.view('location', { airQuality: realData })
}

// Example URL: http://localhost:3000/location/12345?mockLevel=7
`)

// ==========================================
// Example 7: Color Testing for Accessibility
// ==========================================
console.log('\n📊 Example 7: Color Contrast Testing')
console.log('='.repeat(60))

const colorGroups = {
  'Low (Green)': [1, 2, 3],
  'Moderate (Yellow/Orange)': [4, 5, 6],
  'High (Red)': [7, 8, 9],
  'Very High (Purple)': [10]
}

Object.entries(colorGroups).forEach(([group, levels]) => {
  console.log(`\n${group}:`)
  levels.forEach((level) => {
    const info = getDaqiLevelInfo(level)
    console.log(`  Level ${level}: ${info.color}`)
  })
})

// ==========================================
// Example 8: Generate Test Data Set
// ==========================================
console.log('\n📊 Example 8: Generate Complete Test Dataset')
console.log('='.repeat(60))

const testDataset = {
  location: 'Mock Location - Testing',
  dateGenerated: new Date().toISOString(),
  levels: {}
}

for (let level = 0; level <= 10; level++) {
  testDataset.levels[`level${level}`] = mockLevelColor(level, {
    includeForecast: true,
    allSameLevel: true,
    logDetails: false
  })
}

console.log(
  'Test Dataset generated with',
  Object.keys(testDataset.levels).length,
  'levels'
)
console.log(
  'Sample (Level 0):',
  JSON.stringify(testDataset.levels.level0, null, 2)
)

// ==========================================
// Example 9: Quick Level Switcher
// ==========================================
console.log('\n📊 Example 9: Quick Level Switcher Function')
console.log('='.repeat(60))

function quickTestLevel(level) {
  console.log(`\n🎨 Testing Level ${level}`)
  const data = mockLevelColor(level, {
    includeForecast: false,
    logDetails: false
  })
  const info = getDaqiLevelInfo(level)
  console.log(`Band: ${info.band}`)
  console.log(`Color: ${info.color}`)
  console.log(`Data:`, data.today)
  return data
}

// Test a few levels
quickTestLevel(1)
quickTestLevel(4)
quickTestLevel(7)
quickTestLevel(10)

console.log('\n✅ All examples completed!')
console.log('='.repeat(60))
