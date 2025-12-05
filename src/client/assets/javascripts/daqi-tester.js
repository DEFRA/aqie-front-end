/**
 * DAQI Current Implementation Tester
 *
 * This function tests the DAQI levels directly on your current implementation
 * by interacting with the actual       if (process.env.NODE_ENV === 'development') {
        console.log(`\n⏰ Auto-reverting in 3 seconds...`) // eslint-disable-line no-console
      }
      setTimeout(() => {
        this.revertToOriginal()
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Reverted to original state') // eslint-disable-line no-console
        }structure and CSS classes used in production.
 *
 * Compatible with the current structure:
 * - .daqi-numbered containers
 * - .daqi-bar with .daqi-bar-segment
 * - .daqi-# CSS classes (daqi-1, daqi-2, etc.)
 * - .daqi-labels with bands
 * - Current responsive behavior
 */

/**
 * Test DAQI implementation by directly manipulating the current DOM structure
 */
class DAQICurrentImplementationTester {
  constructor() {
    this.container = null
    this.originalValues = new Map()
    this.testResults = []
  }

  /**
   * Initialize the tester by finding the current DAQI container
   */
  init() {
    // Find the current DAQI container in the DOM
    this.container = document.querySelector('.daqi-numbered')

    if (!this.container) {
      console.error('❌ No .daqi-numbered container found in current page')
      if (process.env.NODE_ENV === 'development') {
        console.log(
          // eslint-disable-line no-console
          "💡 Make sure you're on a page with DAQI data (air quality page)"
        )
      }
      return false
    }

    // Store original state
    this.storeOriginalState()

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ DAQI Current Implementation Tester initialized') // eslint-disable-line no-console
      console.log('📍 Found container:', this.container) // eslint-disable-line no-console
    }
    return true
  }

  /**
   * Store the original state so we can restore it later
   */
  storeOriginalState() {
    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    segments.forEach((segment, index) => {
      this.originalValues.set(index + 1, {
        className: segment.className,
        innerHTML: segment.innerHTML,
        style: segment.getAttribute('style') || ''
      })
    })
  }

  /**
   * Test a specific DAQI level by applying it to the current implementation
   * @param {number} level - DAQI level (1-10)
   * @param {boolean} temporary - If true, will revert after 3 seconds
   */
  testDAQILevel(level, temporary = true) {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    if (level < 1 || level > 10) {
      console.error('❌ DAQI level must be between 1 and 10')
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🧪 Testing DAQI Level ${level} on Current Implementation`) // eslint-disable-line no-console
      console.log('═'.repeat(60)) // eslint-disable-line no-console
    }

    // Get the segments
    const segments = this.container.querySelectorAll('.daqi-bar-segment')

    if (segments.length !== 10) {
      console.error(`❌ Expected 10 segments, found ${segments.length}`)
      return
    }

    // Reset all segments to default state first
    this.resetToDefault()

    // Apply the test level
    segments.forEach((segment, index) => {
      const segmentNumber = index + 1

      // Remove any existing daqi-# classes
      segment.className = segment.className.replace(/daqi-\d+/g, '')

      if (segmentNumber === level) {
        // This is the active segment
        segment.classList.add(`daqi-${level}`)
        segment.classList.add('daqi-selected')
        if (process.env.NODE_ENV === 'development') {
          console.log(
            // eslint-disable-line no-console
            `🔧 Applying DAQI-${level} classes to segment ${i + 1}`
          )
        }
      } else {
        // This is an inactive segment
        segment.classList.add('daqi-0')
      }
    })

    // Get the computed styles and colors
    const activeSegment = segments[level - 1]
    const computedStyle = window.getComputedStyle(activeSegment)

    // Test results
    const testResult = {
      level: level,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      fontWeight: computedStyle.fontWeight,
      classes: activeSegment.className,
      segmentWidth: computedStyle.width,
      containerWidth: this.container.offsetWidth
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Current Implementation Test Results:') // eslint-disable-line no-console
      console.log(`   Level: ${testResult.level}`) // eslint-disable-line no-console
      console.log(`   Background: ${testResult.backgroundColor}`) // eslint-disable-line no-console
      console.log(`   Text Color: ${testResult.color}`) // eslint-disable-line no-console
      console.log(`   Font Weight: ${testResult.fontWeight}`) // eslint-disable-line no-console
      console.log(`   CSS Classes: ${testResult.classes}`) // eslint-disable-line no-console
      console.log(`   Segment Width: ${testResult.segmentWidth}`) // eslint-disable-line no-console
      console.log(`   Container Width: ${testResult.containerWidth}px`) // eslint-disable-line no-console
    }

    // Test the band labels
    this.testBandLabels(level)

    // Test accessibility features
    this.testAccessibility(level)

    // Store result
    this.testResults.push(testResult)

    // Auto-revert if temporary
    if (temporary) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n⏰ Auto-reverting in 3 seconds...`) // eslint-disable-line no-console
      }
      setTimeout(() => {
        this.restoreOriginal()
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Reverted to original state') // eslint-disable-line no-console
        }
      }, 3000)
    }

    return testResult
  }

  /**
   * Test band labels alignment and visibility
   */
  testBandLabels(level) {
    const labelsContainer = this.container.querySelector('.daqi-labels')
    if (!labelsContainer) {
      console.warn('⚠️ No .daqi-labels container found')
      return
    }

    const bands = {
      low: labelsContainer.querySelector('.daqi-band-low'),
      moderate: labelsContainer.querySelector('.daqi-band-moderate'),
      high: labelsContainer.querySelector('.daqi-band-high'),
      veryHigh: labelsContainer.querySelector('.daqi-band-very-high')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('\n🏷️ Band Labels Test:') // eslint-disable-line no-console
      Object.entries(bands).forEach(([bandName, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect()
          console.log(
            // eslint-disable-line no-console
            `   ${bandName}: "${element.textContent.trim()}" (${rect.width.toFixed(1)}px wide)`
          )
        } else {
          console.warn(`   ⚠️ Missing band: ${bandName}`) // eslint-disable-line no-console
        }
      })
    }

    // Determine which band this level belongs to
    let expectedBand = 'low'
    if (level >= 4 && level <= 6) expectedBand = 'moderate'
    else if (level >= 7 && level <= 9) expectedBand = 'high'
    else if (level === 10) expectedBand = 'veryHigh'

    if (process.env.NODE_ENV === 'development') {
      console.log(`   📍 Level ${level} should be in: ${expectedBand}`) // eslint-disable-line no-console
    }
  }

  /**
   * Test accessibility features if available
   */
  testAccessibility(level) {
    console.log('\n♿ Accessibility Test:')

    // Check aria-label
    const ariaLabel = this.container.getAttribute('aria-label')
    if (ariaLabel) {
      console.log(`   aria-label: "${ariaLabel}"`)
    }

    // Check role
    const role = this.container.getAttribute('role')
    if (role) {
      console.log(`   role: "${role}"`)
    }

    // Test screen reader announcement if function exists
    if (window.daqiAccessibility && window.daqiAccessibility.getDaqiLevelText) {
      const levelText = window.daqiAccessibility.getDaqiLevelText(level)
      console.log(`   Screen reader text: "${levelText}"`)
    }

    // Test if accessibility enhancements are loaded
    if (window.daqiAccessibility) {
      console.log('   ✅ DAQI accessibility module loaded')
    } else {
      console.log('   ⚠️ DAQI accessibility module not found')
    }
  }

  /**
   * Reset all segments to default state
   */
  resetToDefault() {
    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    segments.forEach((segment) => {
      // Remove all daqi-# classes
      segment.className = segment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')
      // Add default class
      segment.classList.add('daqi-0')
    })
  }

  /**
   * Restore original state
   */
  restoreOriginal() {
    if (!this.container) return

    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    segments.forEach((segment, index) => {
      const original = this.originalValues.get(index + 1)
      if (original) {
        segment.className = original.className
        segment.innerHTML = original.innerHTML
        if (original.style) {
          segment.setAttribute('style', original.style)
        }
      }
    })
  }

  /**
   * Test all DAQI levels sequentially
   * @param {number} delay - Delay between tests in milliseconds
   */
  async testAllLevels(delay = 2000) {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    console.log('🧪 TESTING ALL DAQI LEVELS ON CURRENT IMPLEMENTATION')
    console.log('═'.repeat(80))

    for (let level = 1; level <= 10; level++) {
      this.testDAQILevel(level, false)

      if (level < 10) {
        console.log(`\n⏳ Waiting ${delay}ms before next test...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    console.log('\n🔄 Restoring original state...')
    this.restoreOriginal()
    console.log('✅ All levels tested!')
  }

  /**
   * Test responsive behavior at different viewport widths
   */
  testResponsiveBehavior() {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    console.log('\n📱 TESTING RESPONSIVE BEHAVIOR')
    console.log('═'.repeat(50))

    // Test at current width
    const currentWidth = window.innerWidth
    console.log(`Current viewport: ${currentWidth}px`)

    // Get container measurements
    const containerRect = this.container.getBoundingClientRect()
    const segments = this.container.querySelectorAll('.daqi-bar-segment')

    console.log(`Container width: ${containerRect.width.toFixed(1)}px`)
    console.log(`Number of segments: ${segments.length}`)

    // Measure each segment
    segments.forEach((segment, index) => {
      const rect = segment.getBoundingClientRect()
      const segmentNumber = index + 1
      console.log(`   Segment ${segmentNumber}: ${rect.width.toFixed(1)}px`)

      // Special note for segment 10
      if (segmentNumber === 10) {
        console.log(
          `   📍 Segment 10 (Very High) width ratio: ${((rect.width / rect.width) * 100).toFixed(1)}%`
        )
      }
    })

    // Test CSS custom properties if they exist
    const computedStyle = window.getComputedStyle(this.container)
    const divider1 = computedStyle.getPropertyValue('--daqi-divider-1')
    const divider2 = computedStyle.getPropertyValue('--daqi-divider-2')
    const divider3 = computedStyle.getPropertyValue('--daqi-divider-3')

    if (divider1 || divider2 || divider3) {
      console.log('\n🔧 CSS Custom Properties:')
      if (divider1) console.log(`   --daqi-divider-1: ${divider1}`)
      if (divider2) console.log(`   --daqi-divider-2: ${divider2}`)
      if (divider3) console.log(`   --daqi-divider-3: ${divider3}`)
    }
  }

  /**
   * Compare current implementation with expected values
   */
  testColorAccuracy() {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    console.log('\n🎨 TESTING COLOR ACCURACY')
    console.log('═'.repeat(50))

    // Expected colors from the CSS
    const expectedColors = {
      1: { bg: 'rgb(0, 112, 60)', text: 'rgb(255, 255, 255)' }, // Green
      2: { bg: 'rgb(0, 112, 60)', text: 'rgb(255, 255, 255)' },
      3: { bg: 'rgb(0, 112, 60)', text: 'rgb(255, 255, 255)' },
      4: { bg: 'rgb(255, 221, 0)', text: 'rgb(11, 12, 12)' }, // Yellow
      5: { bg: 'rgb(255, 221, 0)', text: 'rgb(11, 12, 12)' },
      6: { bg: 'rgb(255, 221, 0)', text: 'rgb(11, 12, 12)' },
      7: { bg: 'rgb(212, 53, 28)', text: 'rgb(255, 255, 255)' }, // Red
      8: { bg: 'rgb(212, 53, 28)', text: 'rgb(255, 255, 255)' },
      9: { bg: 'rgb(212, 53, 28)', text: 'rgb(255, 255, 255)' },
      10: { bg: 'rgb(76, 44, 146)', text: 'rgb(255, 255, 255)' } // Purple
    }

    for (let level = 1; level <= 10; level++) {
      // Apply the level
      this.testDAQILevel(level, false)

      // Get the active segment
      const activeSegment = this.container.querySelector(`.daqi-${level}`)
      if (!activeSegment) {
        console.warn(`⚠️ Could not find active segment for level ${level}`)
        continue
      }

      const computedStyle = window.getComputedStyle(activeSegment)
      const actualBg = computedStyle.backgroundColor
      const actualText = computedStyle.color

      const expected = expectedColors[level]
      const bgMatch = actualBg === expected.bg
      const textMatch = actualText === expected.text

      console.log(`Level ${level}:`)
      console.log(
        `   Background: ${actualBg} ${bgMatch ? '✅' : '❌ Expected: ' + expected.bg}`
      )
      console.log(
        `   Text: ${actualText} ${textMatch ? '✅' : '❌ Expected: ' + expected.text}`
      )
    }

    this.restoreOriginal()
  }

  /**
   * Get current test results
   */
  getResults() {
    return {
      container: this.container,
      results: this.testResults,
      summary: {
        totalTests: this.testResults.length,
        containerWidth: this.container ? this.container.offsetWidth : 0,
        viewportWidth: window.innerWidth
      }
    }
  }
}

// Create global instance
const daqiTester = new DAQICurrentImplementationTester()

// Utility: Only select DAQI bar segments inside the main DAQI bar (application, not test/demo)
function getMainDaqiBarSegments() {
  // Prefer the main DAQI bar inside .daqi-numbered > .daqi-bar
  const mainBar = document.querySelector('.daqi-numbered .daqi-bar')
  if (!mainBar) return []
  const segments = Array.from(mainBar.querySelectorAll('.daqi-bar-segment'))
  // Only return if exactly 10 segments
  return segments.length === 10 ? segments : []
}

// If you use cycleDaqiBarSegmentColors, update it to use getMainDaqiBarSegments
window.cycleDaqiBarSegmentColors = function () {
  const daqiCells = getMainDaqiBarSegments()
  if (daqiCells.length !== 10) {
    console.warn(`Expected 10 DAQI bar segments, found ${daqiCells.length}.`)
    return
  }
  // List of DAQI colors for 10 cells, in order
  const colors = [
    '#00e400', // 1 Good
    '#a3ff00', // 2 Fair
    '#ffff00', // 3 Moderate
    '#ffc100', // 4 Poor
    '#ff7e00', // 5 Unhealthy for Sensitive Groups
    '#ff0000', // 6 Unhealthy
    '#99004c', // 7 Very Unhealthy
    '#7e0023', // 8 Hazardous
    '#b97b1b', // 9 Extra
    '#1e90ff' // 10 Extra
  ]
  let idx = 0
  function highlightNext() {
    daqiCells.forEach((cell, i) => {
      cell.style.transition = 'background 0.3s'
      cell.style.background = i === idx ? colors[i] : ''
    })
    console.log(`DAQI cell ${idx + 1} set to color: ${colors[idx]}`)
    idx++
    if (idx < daqiCells.length) {
      setTimeout(highlightNext, 900) // Highlight next cell every 900ms
    } else {
      setTimeout(() => {
        daqiCells.forEach((cell) => (cell.style.background = ''))
        console.log('DAQI cell color test complete.')
      }, 1200)
    }
  }
  highlightNext()
}
// Utility: Clean up the DOM by hiding extra DAQI bars (keep only the one inside #main-content or .govuk-main-wrapper with 10 segments)
function cleanUpDaqiBars() {
  const mainContent = document.querySelector(
    '#main-content, .govuk-main-wrapper'
  )
  let kept = false
  const allBars = Array.from(
    document.querySelectorAll('.daqi-bar, .daqi-numbered')
  )
  allBars.forEach((bar) => {
    const segments = bar.querySelectorAll('.daqi-bar-segment')
    const style = window.getComputedStyle(bar)
    // Only keep the bar inside main content area with 10 segments and visible
    const isInMain = mainContent && mainContent.contains(bar)
    if (
      !kept &&
      isInMain &&
      segments.length === 10 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    ) {
      kept = true
      bar.style.display = ''
      console.log('[DAQI CLEANUP] Keeping DAQI bar:', bar)
    } else {
      bar.style.display = 'none'
      console.log('[DAQI CLEANUP] Hiding extra DAQI bar:', bar)
    }
  })
}

// Expose cleanup for manual use
window.cleanUpDaqiBars = cleanUpDaqiBars

// Automatically clean up extra DAQI bars on desktop only, and observe DOM for changes
function autoCleanDaqiBarsDesktop() {
  if (window.innerWidth >= 641) {
    // GOV.UK Design System desktop breakpoint
    cleanUpDaqiBars()
    // Set up MutationObserver to keep DOM clean if new bars are added dynamically
    if (!window._daqibarObserver) {
      const observer = new MutationObserver(() => {
        cleanUpDaqiBars()
      })
      observer.observe(document.body, { childList: true, subtree: true })
      window._daqibarObserver = observer
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoCleanDaqiBarsDesktop)
} else {
  autoCleanDaqiBarsDesktop()
}

// Convenience functions for easy testing
window.testCurrentDAQI = {
  /**
   * Initialize the tester
   */
  init: () => daqiTester.init(),

  /**
   * Test a specific DAQI level
   * @param {number} level - DAQI level (1-10)
   * @param {boolean} temporary - Auto-revert after 3 seconds
   */
  testLevel: (level, temporary = true) =>
    daqiTester.testDAQILevel(level, temporary),

  /**
   * Test all levels with delay between each
   * @param {number} delay - Delay in milliseconds
   */
  testAll: (delay = 2000) => daqiTester.testAllLevels(delay),

  /**
   * Test responsive behavior
   */
  testResponsive: () => daqiTester.testResponsiveBehavior(),

  /**
   * Test color accuracy
   */
  testColors: () => daqiTester.testColorAccuracy(),

  /**
   * Restore original state
   */
  restore: () => daqiTester.restoreOriginal(),

  /**
   * Get test results
   */
  results: () => daqiTester.getResults()
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (daqiTester.init()) {
        console.log('\n🚀 DAQI Current Implementation Tester Ready!')
        console.log('Available commands:')
        console.log('  testCurrentDAQI.testLevel(5)     - Test level 5')
        console.log('  testCurrentDAQI.testAll()        - Test all levels')
        console.log(
          '  testCurrentDAQI.testResponsive() - Test responsive behavior'
        )
        console.log('  testCurrentDAQI.testColors()     - Test color accuracy')
        console.log(
          '  testCurrentDAQI.restore()        - Restore original state'
        )
      }
    }, 1000) // Wait for other scripts to load
  })
} else {
  // DOM already loaded
  setTimeout(() => {
    if (daqiTester.init()) {
      console.log('\n🚀 DAQI Current Implementation Tester Ready!')
      console.log('Available commands:')
      console.log('  testCurrentDAQI.testLevel(5)     - Test level 5')
      console.log('  testCurrentDAQI.testAll()        - Test all levels')
      console.log(
        '  testCurrentDAQI.testResponsive() - Test responsive behavior'
      )
      console.log('  testCurrentDAQI.testColors()     - Test color accuracy')
      console.log('  testCurrentDAQI.restore()        - Restore original state')
    }
  }, 1000)
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DAQICurrentImplementationTester
}
