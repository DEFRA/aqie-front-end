/**
 * Enhanced DAQI Tester - Immediate Fix for Purple Level 10
 *
 * This script provides enhanced testing with better DOM handling
 * and specific diagnostics for the Level 10 purple issue.
 */

// ''

console.log('🔧 Loading Enhanced DAQI Tester...')

// Enhanced testAll function that handles Level 10 purple correctly
window.enhancedDAQI = {
  async testAllEnhanced(delay = 1500) {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('❌ No .daqi-numbered container found')
      return
    }

    console.log('🧪 ENHANCED TESTALL - Better DOM handling for Level 10 Purple')
    console.log('═'.repeat(70))

    for (let level = 1; level <= 10; level++) {
      console.log(`\n🔍 Testing Level ${level}`)

      // Get all segments
      const segments = container.querySelectorAll('.daqi-bar-segment')

      // Reset ALL segments completely
      segments.forEach((segment) => {
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        segment.classList.add('daqi-0')
      })

      // Force DOM update
      container.offsetHeight // eslint-disable-line no-unused-expressions

      // Apply target level with special handling for level 10
      const targetSegment = segments[level - 1]

      if (level === 10) {
        console.log('   💜 Special Level 10 (Purple) handling...')

        // Step 1: Remove ALL classes
        targetSegment.className = targetSegment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

        // Step 2: Add ONLY daqi-10
        targetSegment.classList.add('daqi-10')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

        // Step 3: Add daqi-selected
        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      } else {
        // Normal handling for levels 1-9
        targetSegment.classList.remove('daqi-0')
        targetSegment.classList.add(`daqi-${level}`)
        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      }

      // Get final computed style
      const computedStyle = window.getComputedStyle(targetSegment)
      const bgColor = computedStyle.backgroundColor

      console.log(`   ✅ Applied: daqi-${level}`)
      console.log(`   🎨 Background: ${bgColor}`)
      console.log(`   📋 Classes: "${targetSegment.className}"`)

      // Special validation for level 10
      if (level === 10) {
        const isPurple =
          bgColor === 'rgb(76, 44, 146)' || bgColor.includes('76, 44, 146')
        console.log(
          `   💜 Purple Check: ${isPurple ? '✅ CORRECT!' : '❌ WRONG!'}`
        )

        if (!isPurple) {
          console.error(`   ❌ Expected: rgb(76, 44, 146), Got: ${bgColor}`)
        }
      }

      // Visual indicator
      targetSegment.style.outline = '2px solid black'

      // Wait for specified delay
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Remove visual indicator
      targetSegment.style.outline = ''
    }

    console.log('\n🔄 Enhanced test complete! Restoring original state...')

    // Restore original state
    if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
      window.testCurrentDAQI.restore()
    }
  },

  // Quick test for Level 10 only
  testLevel10Only() {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('❌ No .daqi-numbered container found')
      return
    }

    console.log('💜 TESTING LEVEL 10 PURPLE ONLY')
    console.log('═'.repeat(40))

    const segments = container.querySelectorAll('.daqi-bar-segment')
    const segment10 = segments[9]

    // Store original
    const originalClasses = segment10.className

    // Clean and apply Level 10
    segment10.className = segment10.className
      .replace(/daqi-\d+/g, '')
      .replace(/daqi-selected/g, '')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions

    segment10.classList.add('daqi-10')
    segment10.classList.add('daqi-selected')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions

    const style = window.getComputedStyle(segment10)
    const bgColor = style.backgroundColor

    console.log(`🎨 Background: ${bgColor}`)
    console.log(`📋 Classes: "${segment10.className}"`)
    console.log(
      `💜 Is Purple? ${bgColor === 'rgb(76, 44, 146)' ? '✅ YES!' : '❌ NO!'}`
    )

    // Visual highlight
    segment10.style.boxShadow = '0 0 20px purple'

    setTimeout(() => {
      segment10.style.boxShadow = ''
      segment10.className = originalClasses
      console.log('🔄 Restored original state')
    }, 3000)

    return {
      bgColor,
      isPurple: bgColor === 'rgb(76, 44, 146)',
      classes: segment10.className
    }
  },

  // Force reload the updated script
  reloadScript() {
    const script = document.createElement('script')
    script.src = '/daqi-current-implementation-tester.js?' + Date.now()
    document.head.appendChild(script)

    script.onload = function () {
      console.log('✅ Enhanced script reloaded!')
      if (window.testCurrentDAQI && window.testCurrentDAQI.init) {
        window.testCurrentDAQI.init()
      }
    }
  }
}

console.log('✅ Enhanced DAQI Tester loaded!')
console.log('Available enhanced commands:')
console.log(
  '  enhancedDAQI.testAllEnhanced(1500)  - Enhanced testAll with Level 10 fix'
)
console.log('  enhancedDAQI.testLevel10Only()      - Test only Level 10 purple')
console.log(
  '  enhancedDAQI.reloadScript()         - Reload the updated tester script'
)
console.log('\n💡 Try: enhancedDAQI.testAllEnhanced(1500)')
