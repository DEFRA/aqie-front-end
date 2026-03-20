/**
 * DAQI Testing Function - Test Different DAQI Levels with Colors
 *
 * This function allows you to test all DAQI levels (1-10) with their corresponding
 * colors and cell properties according to the UK Daily Air Quality Index system.
 *
 * Usage Examples:
 *   testDAQILevel(5)           // Test moderate level 5
 *   testAllDAQILevels()        // Test all levels 1-10
 *   getDAQIColorInfo(7)        // Get color info for level 7
 *   simulateDAQIDisplay(8)     // Simulate visual display for level 8
 */

// ''

const SUMMARY_SEPARATOR = '═'
const SUMMARY_SEPARATOR_LENGTH_SHORT = 50
const SUMMARY_SEPARATOR_LENGTH_MEDIUM = 60
const SUMMARY_SEPARATOR_LENGTH_LONG = 80
const OUTDOOR_ACTIVITIES_ADVICE = 'Enjoy your usual outdoor activities.'
const DAQI_LOW_MAX = 3
const DAQI_MODERATE_MIN = 4
const DAQI_MODERATE_MID = 5
const DAQI_MODERATE_MAX = 6
const DAQI_HIGH_MIN = 7
const DAQI_HIGH_MAX = 9
const DAQI_VERY_HIGH = 10
const PAD_VALUE_WIDTH = 5
const PAD_BAND_WIDTH = 9
const DEFAULT_RANGE_VALUES = [
  1,
  DAQI_MODERATE_MIN,
  DAQI_HIGH_MIN,
  DAQI_VERY_HIGH
]

// DAQI Color Mapping based on the actual CSS classes used in the application
const DAQI_COLORS = {
  // Low levels (1-3) - Green
  1: { background: '#00703c', color: 'white', level: 'Low', emoji: '🟢' },
  2: { background: '#00703c', color: 'white', level: 'Low', emoji: '🟢' },
  3: { background: '#00703c', color: 'white', level: 'Low', emoji: '🟢' },

  // Moderate levels (4-6) - Yellow
  4: { background: '#ffdd00', color: 'black', level: 'Moderate', emoji: '🟡' },
  5: { background: '#ffdd00', color: 'black', level: 'Moderate', emoji: '🟡' },
  6: { background: '#ffdd00', color: 'black', level: 'Moderate', emoji: '🟡' },

  // High levels (7-9) - Red
  7: { background: '#d4351c', color: 'white', level: 'High', emoji: '🔴' },
  8: { background: '#d4351c', color: 'white', level: 'High', emoji: '🔴' },
  9: { background: '#d4351c', color: 'white', level: 'High', emoji: '🔴' },

  // Very High level (10) - Purple
  10: { background: '#4c2c92', color: 'white', level: 'Very High', emoji: '🟣' }
}

// DAQI Band Information with advice and at-risk guidance
const DAQI_BANDS = {
  low: {
    values: [1, 2, DAQI_LOW_MAX],
    advice: OUTDOOR_ACTIVITIES_ADVICE,
    atrisk: {
      adults: OUTDOOR_ACTIVITIES_ADVICE,
      asthma: OUTDOOR_ACTIVITIES_ADVICE,
      oldPeople: OUTDOOR_ACTIVITIES_ADVICE
    },
    outlook:
      'The current spell of unsettled weather will continue, helping to keep air pollution levels low across the UK during today.'
  },
  moderate: {
    values: [DAQI_MODERATE_MIN, DAQI_MODERATE_MID, DAQI_MODERATE_MAX],
    advice:
      'For most people, short term exposure to moderate levels of air pollution is not an issue.',
    atrisk: {
      adults:
        'Adults who have heart problems and feel unwell should consider doing less strenuous exercise, especially outside.',
      asthma:
        'People with asthma should be prepared to use their reliever inhaler.',
      oldPeople:
        'Older people should consider doing less strenuous activity, especially outside.'
    },
    outlook:
      'The influx of warm air from the continent is resulting in moderate air pollution levels throughout many areas today.'
  },
  high: {
    values: [DAQI_HIGH_MIN, 8, DAQI_HIGH_MAX],
    advice:
      'Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.',
    atrisk: {
      adults:
        'Adults with heart problems should reduce strenuous physical exertion, particularly outdoors, especially if they experience symptoms.',
      asthma:
        'People with asthma may find they need to use their reliever inhaler more often.',
      oldPeople: 'Older people should reduce physical exertion.'
    },
    outlook:
      'Warm temperatures are expected to increase pollution levels to high across many areas today.'
  },
  veryHigh: {
    values: [DAQI_VERY_HIGH],
    advice:
      'Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.',
    atrisk: {
      adults:
        'Adults with heart problems should avoid strenuous physical activity.',
      asthma:
        'People with asthma may need to use their reliever inhaler more often.',
      oldPeople: 'Older people should avoid strenuous physical activity.'
    },
    outlook:
      'The current heatwave shows no signs of relenting, causing air pollution levels to remain very high across many areas today.'
  }
}

/**
 * Get DAQI band information from a value (1-10)
 * @param {number} value - DAQI value between 1 and 10
 * @returns {string} - Band name (low, moderate, high, veryHigh)
 */
function getDAQIBand(value) {
  if (value >= 1 && value <= DAQI_LOW_MAX) {
    return 'low'
  }

  if (value >= DAQI_MODERATE_MIN && value <= DAQI_MODERATE_MAX) {
    return 'moderate'
  }

  if (value >= DAQI_HIGH_MIN && value <= DAQI_HIGH_MAX) {
    return 'high'
  }

  if (value === DAQI_VERY_HIGH) {
    return 'veryHigh'
  }

  return 'unknown'
}

/**
 * Get complete DAQI color and styling information for a specific value
 * @param {number} value - DAQI value between 1 and 10
 * @returns - Color, level, and styling information
 */
function getDAQIColorInfo(value) {
  if (value < 1 || value > 10) {
    return { error: 'DAQI value must be between 1 and 10' }
  }

  const colorInfo = DAQI_COLORS[value]
  const band = getDAQIBand(value)
  const bandInfo = DAQI_BANDS[band]

  return {
    value,
    band,
    level: colorInfo.level,
    colors: {
      background: colorInfo.background,
      text: colorInfo.color,
      emoji: colorInfo.emoji
    },
    css: {
      backgroundColor: colorInfo.background,
      color: colorInfo.color,
      border: `2px solid ${colorInfo.background}`,
      borderRadius: '4px',
      padding: '8px 12px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    advice: bandInfo?.advice,
    atrisk: bandInfo?.atrisk,
    outlook: bandInfo?.outlook
  }
}

/**
 * Test a specific DAQI level and display all its properties
 * @param {number} value - DAQI value between 1 and 10
 * @returns - Complete DAQI information for testing
 */
function testDAQILevel(value) {
  const info = getDAQIColorInfo(value)

  if (info.error) {
    console.error('❌ Error:', info.error)
    return info
  }

  console.log(
    `\n${info.colors.emoji} DAQI Level ${value} - ${info.level} (${info.band.toUpperCase()})`
  )
  console.log(SUMMARY_SEPARATOR.repeat(SUMMARY_SEPARATOR_LENGTH_SHORT))
  console.log(`🎨 Background Color: ${info.colors.background}`)
  console.log(`📝 Text Color: ${info.colors.text}`)
  console.log(`💡 General Advice: ${info.advice}`)
  console.log('\n👥 At-Risk Groups:')
  console.log(`   Adults: ${info.atrisk.adults}`)
  console.log(`   Asthma: ${info.atrisk.asthma}`)
  console.log(`   Older People: ${info.atrisk.oldPeople}`)
  console.log(`\n🌤️  Outlook: ${info.outlook}`)

  return info
}

/**
 * Test all DAQI levels from Low to Very High
 * @returns {array} - Array of all DAQI level information
 */
function testAllDAQILevels() {
  console.log('🧪 TESTING ALL DAQI LEVELS (1-10)')
  console.log(SUMMARY_SEPARATOR.repeat(SUMMARY_SEPARATOR_LENGTH_MEDIUM))

  const results = []

  for (let i = 1; i <= 10; i++) {
    const result = testDAQILevel(i)
    results.push(result)
  }

  // Summary table
  console.log('\n📊 DAQI LEVELS SUMMARY TABLE')
  console.log(SUMMARY_SEPARATOR.repeat(SUMMARY_SEPARATOR_LENGTH_LONG))
  console.log('| Value | Level     | Band      | Background | Text  | Emoji |')
  console.log('|-------|-----------|-----------|------------|-------|-------|')

  for (let i = 1; i <= 10; i++) {
    const info = getDAQIColorInfo(i)
    const value = i.toString().padEnd(PAD_VALUE_WIDTH)
    const level = info.level.padEnd(PAD_BAND_WIDTH)
    const band = info.band.padEnd(PAD_BAND_WIDTH)
    const bg = info.colors.background.padEnd(10)
    const text = info.colors.text.padEnd(PAD_VALUE_WIDTH)
    console.log(
      `| ${value} | ${level} | ${band} | ${bg} | ${text} | ${info.colors.emoji}     |`
    )
  }

  return results
}

/**
 * Simulate a visual DAQI display cell with proper styling
 * @param {number} value - DAQI value between 1 and 10
 * @returns - HTML and CSS for visual simulation
 */
function simulateDAQIDisplay(value) {
  const info = getDAQIColorInfo(value)

  if (info.error) {
    return { error: info.error }
  }

  const html = `
    <div class="daqi-cell" style="
      background-color: ${info.css.backgroundColor};
      color: ${info.css.color};
      border: ${info.css.border};
      border-radius: ${info.css.borderRadius};
      padding: ${info.css.padding};
      font-weight: ${info.css.fontWeight};
      text-align: ${info.css.textAlign};
      display: inline-block;
      margin: 5px;
      min-width: 40px;
      min-height: 40px;
      line-height: 1.2;
    ">
      ${value}
    </div>
  `

  console.log(`\n📱 Visual Simulation for DAQI ${value}:`)
  console.log(html)

  return {
    value,
    html,
    css: info.css,
    info
  }
}

/**
 * Create a complete DAQI bar visualization (1-10)
 * @returns {string} - HTML for complete DAQI bar
 */
function createDAQIBar() {
  let barHTML =
    '<div class="daqi-bar" style="display: flex; gap: 2px; margin: 20px 0;">\n'

  for (let i = 1; i <= 10; i++) {
    const info = getDAQIColorInfo(i)
    barHTML += `  <div class="daqi-segment daqi-${i}" style="
      background-color: ${info.colors.background};
      color: ${info.colors.text};
      width: ${i === 10 ? '100px' : '50px'};
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    ">${i}</div>\n`
  }

  barHTML += '</div>'

  console.log('\n🎨 Complete DAQI Bar Visualization:')
  console.log(barHTML)

  return barHTML
}

/**
 * Test DAQI responsiveness across different ranges
 * @param {array} values - Array of DAQI values to test
 * @returns - Comparison results
 */
function testDAQIRange(values = DEFAULT_RANGE_VALUES) {
  console.log('\n🔍 DAQI RANGE COMPARISON TEST')
  console.log(SUMMARY_SEPARATOR.repeat(SUMMARY_SEPARATOR_LENGTH_SHORT))

  const results = values.map((value) => {
    const info = getDAQIColorInfo(value)
    console.log(
      `${info.colors.emoji} DAQI ${value} (${info.level}): ${info.colors.background}`
    )
    return info
  })

  return results
}

/**
 * Export functions for use in testing or browser console
 */
if (globalThis.window !== undefined) {
  // Browser environment
  globalThis.DAQITesting = {
    testDAQILevel,
    testAllDAQILevels,
    getDAQIColorInfo,
    simulateDAQIDisplay,
    createDAQIBar,
    testDAQIRange
  }

  console.log('🚀 DAQI Testing Functions loaded! Available functions:')
  console.log('   • DAQITesting.testDAQILevel(5)')
  console.log('   • DAQITesting.testAllDAQILevels()')
  console.log('   • DAQITesting.getDAQIColorInfo(7)')
  console.log('   • DAQITesting.simulateDAQIDisplay(8)')
  console.log('   • DAQITesting.createDAQIBar()')
  console.log('   • DAQITesting.testDAQIRange([4, 7, 10])')
}

// Node.js environment exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDAQILevel,
    testAllDAQILevels,
    getDAQIColorInfo,
    simulateDAQIDisplay,
    createDAQIBar,
    testDAQIRange,
    DAQI_COLORS,
    DAQI_BANDS
  }
}

// Example usage and quick test
console.log('📋 DAQI Testing Function Ready!')
console.log('Try: testDAQILevel(5) or testAllDAQILevels()')
