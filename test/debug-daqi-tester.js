/**
 * Debug DAQI Tester
 *
 * This debug version helps identify why testAll() isn't showing colors
 * while testLevel(10) works correctly.
 */

// ''

// Debug version of the testAll function
window.debugDAQI = {
  /**
   * Debug version of testAll that provides more detailed logging
   */
  async debugTestAll(delay = 2000) {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('❌ No .daqi-numbered container found')
      return
    }

    console.log('🐛 DEBUG: Starting testAll diagnostic')
    console.log('═'.repeat(60))

    for (let level = 1; level <= 10; level++) {
      console.log(`\n🔍 DEBUG Level ${level} - BEFORE applying:`)

      // Check current state before applying
      const segments = container.querySelectorAll('.daqi-bar-segment')
      segments.forEach((segment, index) => {
        const segmentNum = index + 1
        console.log(`   Segment ${segmentNum}: classes="${segment.className}"`)
        if (segmentNum === level) {
          const computedStyle = window.getComputedStyle(segment)
          console.log(
            `   Segment ${segmentNum} background BEFORE: ${computedStyle.backgroundColor}`
          )
        }
      })

      // Reset all segments first
      console.log(`\n🔄 DEBUG: Resetting all segments to daqi-0`)
      segments.forEach((segment) => {
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        segment.classList.add('daqi-0')
      })

      // Apply the test level
      console.log(`\n✅ DEBUG: Applying daqi-${level} to segment ${level}`)
      const targetSegment = segments[level - 1]
      targetSegment.classList.remove('daqi-0')
      targetSegment.classList.add(`daqi-${level}`)
      targetSegment.classList.add('daqi-selected')

      // Check state after applying
      console.log(`\n📊 DEBUG Level ${level} - AFTER applying:`)
      console.log(`   Target segment classes: "${targetSegment.className}"`)

      // Force a reflow to ensure styles are applied
      targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

      const computedStyle = window.getComputedStyle(targetSegment)
      console.log(`   Computed background: ${computedStyle.backgroundColor}`)
      console.log(`   Computed color: ${computedStyle.color}`)
      console.log(`   Computed font-weight: ${computedStyle.fontWeight}`)

      // Check if any CSS transitions are interfering
      console.log(`   CSS transition: ${computedStyle.transition}`)
      console.log(
        `   CSS transition-property: ${computedStyle.transitionProperty}`
      )
      console.log(
        `   CSS transition-duration: ${computedStyle.transitionDuration}`
      )

      // Visual check - highlight the active segment
      const originalBorder = targetSegment.style.border
      targetSegment.style.border = '3px solid black'
      targetSegment.style.outline = '2px solid white'

      console.log(
        `\n⏰ DEBUG: Waiting ${delay}ms (segment should be visible with black border)`
      )
      console.log(
        `   👁️ Visual check: Level ${level} segment should now show the correct color`
      )

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Remove visual highlight
      targetSegment.style.border = originalBorder
      targetSegment.style.outline = ''
    }

    console.log('\n🔄 DEBUG: Test sequence complete, restoring original state')

    // Restore original state if testCurrentDAQI is available
    if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
      window.testCurrentDAQI.restore()
    }
  },

  /**
   * Test if CSS classes are properly defined
   */
  testCSSClasses() {
    console.log('🎨 DEBUG: Testing CSS class definitions')
    console.log('═'.repeat(50))

    const testElement = document.createElement('div')
    testElement.className = 'daqi-bar-segment'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.innerHTML = 'Test'
    document.body.appendChild(testElement)

    for (let level = 1; level <= 10; level++) {
      testElement.className = `daqi-bar-segment daqi-${level}`
      const computedStyle = window.getComputedStyle(testElement)

      console.log(`Level ${level} CSS:`)
      console.log(`   Background: ${computedStyle.backgroundColor}`)
      console.log(`   Color: ${computedStyle.color}`)
      console.log(`   Font-weight: ${computedStyle.fontWeight}`)
    }

    document.body.removeChild(testElement)
  },

  /**
   * Test individual segment manipulation
   */
  testSegmentManipulation(level = 5) {
    console.log(
      `🔧 DEBUG: Testing direct segment manipulation for level ${level}`
    )
    console.log('═'.repeat(60))

    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('❌ No container found')
      return
    }

    const segments = container.querySelectorAll('.daqi-bar-segment')
    const targetSegment = segments[level - 1]

    console.log('📝 BEFORE manipulation:')
    console.log(`   Classes: "${targetSegment.className}"`)
    console.log(
      `   Background: ${window.getComputedStyle(targetSegment).backgroundColor}`
    )

    // Clear all daqi classes
    targetSegment.className = targetSegment.className.replace(/daqi-\d+/g, '')
    console.log('\n🧹 After clearing daqi classes:')
    console.log(`   Classes: "${targetSegment.className}"`)
    console.log(
      `   Background: ${window.getComputedStyle(targetSegment).backgroundColor}`
    )

    // Add the target class
    targetSegment.classList.add(`daqi-${level}`)
    console.log(`\n✅ After adding daqi-${level}:`)
    console.log(`   Classes: "${targetSegment.className}"`)

    // Force reflow
    targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

    const finalStyle = window.getComputedStyle(targetSegment)
    console.log(`   Background: ${finalStyle.backgroundColor}`)
    console.log(`   Color: ${finalStyle.color}`)
    console.log(`   Font-weight: ${finalStyle.fontWeight}`)

    // Add visual indicator
    targetSegment.style.boxShadow = '0 0 10px red'
    setTimeout(() => {
      targetSegment.style.boxShadow = ''
    }, 3000)
  },

  /**
   * Compare testLevel vs testAll behavior
   */
  async compareTestMethods() {
    console.log('🔄 DEBUG: Comparing testLevel() vs testAll() behavior')
    console.log('═'.repeat(60))

    // Test using testLevel (which works)
    console.log('\n1️⃣ Testing with testCurrentDAQI.testLevel(10):')
    if (window.testCurrentDAQI && window.testCurrentDAQI.testLevel) {
      window.testCurrentDAQI.testLevel(10, false)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Test using our debug method
    console.log('\n2️⃣ Testing with direct manipulation (like testAll):')
    const container = document.querySelector('.daqi-numbered')
    const segments = container.querySelectorAll('.daqi-bar-segment')

    // Reset all
    segments.forEach((segment) => {
      segment.className = segment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')
      segment.classList.add('daqi-0')
    })

    // Apply level 10
    const segment10 = segments[9]
    segment10.classList.remove('daqi-0')
    segment10.classList.add('daqi-10')
    segment10.classList.add('daqi-selected')

    // Check result
    const computedStyle = window.getComputedStyle(segment10)
    console.log(`   Result: ${computedStyle.backgroundColor}`)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Restore
    if (window.testCurrentDAQI && window.testCurrentDAQI.restore) {
      window.testCurrentDAQI.restore()
    }
  }
}

console.log('🐛 Debug DAQI Tester loaded!')
console.log('Available debug commands:')
console.log('  debugDAQI.debugTestAll(1500)        - Debug version of testAll')
console.log('  debugDAQI.testCSSClasses()           - Test if CSS classes work')
console.log(
  '  debugDAQI.testSegmentManipulation(5) - Test direct segment manipulation'
)
console.log(
  '  debugDAQI.compareTestMethods()       - Compare testLevel vs testAll'
)
