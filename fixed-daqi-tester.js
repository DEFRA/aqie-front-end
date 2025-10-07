/**
 * Fixed DAQI Tester
 *
 * This version fixes the testAll() function to properly remove conflicting classes
 * and ensure colors show correctly during sequential testing.
 */

// ''

// Fixed version that properly handles class conflicts
window.fixedDAQI = {
  /**
   * Fixed version of testAll that properly manages CSS classes
   */
  async fixedTestAll(delay = 1500) {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('❌ No .daqi-numbered container found')
      return
    }

    console.log('✅ FIXED: Starting testAll with proper class management')
    console.log('═'.repeat(60))

    for (let level = 1; level <= 10; level++) {
      console.log(`\n🧪 Testing Level ${level}`)

      // Get all segments
      const segments = container.querySelectorAll('.daqi-bar-segment')

      // Reset ALL segments to neutral state (remove all daqi classes)
      segments.forEach((segment) => {
        // Remove ALL daqi-related classes
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        // Add back the base class
        segment.classList.add('daqi-0')
      })

      // Apply the target level to the specific segment
      const targetSegment = segments[level - 1]

      // IMPORTANT: Remove daqi-0 before adding the specific level class
      targetSegment.classList.remove('daqi-0')
      targetSegment.classList.add(`daqi-${level}`)
      targetSegment.classList.add('daqi-selected')

      // Force browser to recalculate styles
      targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

      // Get the computed style
      const computedStyle = window.getComputedStyle(targetSegment)

      console.log(`   ✅ Applied: daqi-${level}`)
      console.log(`   🎨 Background: ${computedStyle.backgroundColor}`)
      console.log(`   📝 Classes: "${targetSegment.className}"`)

      // Visual debugging: add a temporary border
      targetSegment.style.border = '2px solid black'
      targetSegment.style.outline = '1px solid white'

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Remove visual debugging
      targetSegment.style.border = ''
      targetSegment.style.outline = ''
    }

    console.log('\n🔄 Restoring original state...')

    // Restore original state
    if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
      window.testCurrentDAQI.restore()
    } else {
      // Manual restore if needed
      const segments = container.querySelectorAll('.daqi-bar-segment')
      segments.forEach((segment) => {
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        segment.classList.add('daqi-0')
      })
    }

    console.log('✅ Fixed testAll complete!')
  },

  /**
   * Test the class conflict issue specifically
   */
  testClassConflict() {
    console.log('🔍 Testing CSS class conflict issue')
    console.log('═'.repeat(50))

    const container = document.querySelector('.daqi-numbered')
    const segments = container.querySelectorAll('.daqi-bar-segment')
    const testSegment = segments[9] // Segment 10

    console.log('\n1️⃣ Testing with conflicting classes (like broken testAll):')

    // Add conflicting classes (like the broken version does)
    testSegment.className = testSegment.className.replace(/daqi-\d+/g, '')
    testSegment.classList.add('daqi-0') // This gets added first
    testSegment.classList.add('daqi-10') // This gets added second
    testSegment.classList.add('daqi-selected')

    console.log(`   Classes: "${testSegment.className}"`)

    testSegment.offsetHeight // eslint-disable-line no-unused-expressions
    const conflictStyle = window.getComputedStyle(testSegment)
    console.log(`   Background: ${conflictStyle.backgroundColor}`)
    console.log(
      `   ${conflictStyle.backgroundColor === 'rgb(76, 44, 146)' ? '✅ Correct (purple)' : '❌ Wrong color'}`
    )

    // Wait a moment
    setTimeout(() => {
      console.log('\n2️⃣ Testing with clean classes (fixed version):')

      // Clean approach
      testSegment.className = testSegment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')
      testSegment.classList.add('daqi-10') // Only the specific class
      testSegment.classList.add('daqi-selected')

      console.log(`   Classes: "${testSegment.className}"`)

      testSegment.offsetHeight // eslint-disable-line no-unused-expressions
      const cleanStyle = window.getComputedStyle(testSegment)
      console.log(`   Background: ${cleanStyle.backgroundColor}`)
      console.log(
        `   ${cleanStyle.backgroundColor === 'rgb(76, 44, 146)' ? '✅ Correct (purple)' : '❌ Wrong color'}`
      )

      // Restore
      setTimeout(() => {
        if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
          window.testCurrentDAQI.restore()
        }
      }, 2000)
    }, 2000)
  },

  /**
   * Quick test single level with proper class management
   */
  quickTest(level = 10) {
    console.log(`🚀 Quick test level ${level} with fixed class management`)

    const container = document.querySelector('.daqi-numbered')
    const segments = container.querySelectorAll('.daqi-bar-segment')
    const targetSegment = segments[level - 1]

    // Clean approach - remove ALL daqi classes first
    targetSegment.className = targetSegment.className
      .replace(/daqi-\d+/g, '')
      .replace(/daqi-selected/g, '')

    // Add only the target class
    targetSegment.classList.add(`daqi-${level}`)
    targetSegment.classList.add('daqi-selected')

    // Force reflow and check
    targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
    const style = window.getComputedStyle(targetSegment)

    console.log(`   Applied: daqi-${level}`)
    console.log(`   Classes: "${targetSegment.className}"`)
    console.log(`   Background: ${style.backgroundColor}`)

    // Visual highlight
    targetSegment.style.boxShadow = '0 0 15px yellow'

    // Auto restore after 3 seconds
    setTimeout(() => {
      targetSegment.style.boxShadow = ''
      if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
        window.testCurrentDAQI.restore()
      }
    }, 3000)
  }
}

console.log('🔧 Fixed DAQI Tester loaded!')
console.log('Available fixed commands:')
console.log('  fixedDAQI.fixedTestAll(1500)     - Fixed version of testAll')
console.log(
  '  fixedDAQI.testClassConflict()    - Test the class conflict issue'
)
console.log(
  '  fixedDAQI.quickTest(10)          - Quick test with proper classes'
)
