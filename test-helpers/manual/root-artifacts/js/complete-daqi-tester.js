/**
 * Complete DAQI Tester - Copy-Paste Solution
 *
 * Copy this entire script into your browser console to get
 * all the enhanced DAQI testing functionality without needing
 * to load external files.
 */

// ''

console.log('🚀 Loading Complete DAQI Tester (Copy-Paste Version)...')

class DAQITesterComplete {
  constructor() {
    this.container = null
    this.originalValues = new Map()
    this.testResults = []
  }

  init() {
    this.container = document.querySelector('.daqi-numbered')

    if (!this.container) {
      console.error('❌ No .daqi-numbered container found in current page')
      console.log(
        "💡 Make sure you're on a page with DAQI data (air quality page)"
      )
      return false
    }

    this.storeOriginalState()
    console.log('✅ DAQI Tester initialized')
    console.log('📍 Found container:', this.container)
    return true
  }

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

  testLevel(level, temporary = true) {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    if (level < 1 || level > 10) {
      console.error('❌ DAQI level must be between 1 and 10')
      return
    }

    console.log(`\n🧪 Testing DAQI Level ${level}`)
    console.log('═'.repeat(50))

    const segments = this.container.querySelectorAll('.daqi-bar-segment')

    if (segments.length !== 10) {
      console.error(`❌ Expected 10 segments, found ${segments.length}`)
      return
    }

    // Reset all segments
    this.resetToDefault()

    // Apply the test level
    segments.forEach((segment, index) => {
      const segmentNumber = index + 1

      // Clean all daqi classes
      segment.className = segment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')

      if (segmentNumber === level) {
        // Apply ONLY the specific level class
        segment.classList.add(`daqi-${level}`)
        segment.classList.add('daqi-selected')
        console.log(`✅ Applied daqi-${level} to segment ${segmentNumber}`)
      } else {
        segment.classList.add('daqi-0')
      }
    })

    // Force reflow and get results
    const activeSegment = segments[level - 1]
    activeSegment.offsetHeight // eslint-disable-line no-unused-expressions
    const computedStyle = window.getComputedStyle(activeSegment)

    const result = {
      level,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      classes: activeSegment.className
    }

    console.log('📊 Results:')
    console.log(`   Level: ${result.level}`)
    console.log(`   Background: ${result.backgroundColor}`)
    console.log(`   Classes: ${result.classes}`)

    // Special check for purple
    if (level === 10) {
      const isPurple =
        result.backgroundColor === 'rgb(76, 44, 146)' ||
        result.backgroundColor.includes('76, 44, 146')
      console.log(`   💜 Purple Check: ${isPurple ? '✅ CORRECT' : '❌ WRONG'}`)
    }

    if (temporary) {
      console.log(`\n⏰ Auto-reverting in 3 seconds...`)
      setTimeout(() => {
        this.restoreOriginal()
        console.log('🔄 Reverted to original state')
      }, 3000)
    }

    return result
  }

  async testAll(delay = 1500) {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    console.log('🧪 TESTING ALL DAQI LEVELS - ENHANCED VERSION')
    console.log('═'.repeat(60))

    for (let level = 1; level <= 10; level++) {
      console.log(`\n🔍 Testing Level ${level}...`)

      const segments = this.container.querySelectorAll('.daqi-bar-segment')

      // Reset ALL segments completely
      segments.forEach((segment) => {
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        segment.classList.add('daqi-0')
      })

      // Force DOM update
      this.container.offsetHeight // eslint-disable-line no-unused-expressions

      // Apply target level with enhanced handling
      const targetSegment = segments[level - 1]

      if (level === 10) {
        console.log('   💜 Special Level 10 (Purple) handling...')

        // Enhanced Level 10 handling
        targetSegment.className = targetSegment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

        targetSegment.classList.add('daqi-10')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      } else {
        // Normal handling for levels 1-9
        targetSegment.classList.remove('daqi-0')
        targetSegment.classList.add(`daqi-${level}`)
        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      }

      // Get final result
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
          // Try one more fix
          targetSegment.classList.remove('daqi-0', 'daqi-10', 'daqi-selected')
          targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
          targetSegment.classList.add('daqi-10', 'daqi-selected')
          targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
          const fixedColor =
            window.getComputedStyle(targetSegment).backgroundColor
          console.log(`   🔄 After fix attempt: ${fixedColor}`)
        }
      }

      // Visual indicator
      targetSegment.style.outline = '2px solid black'

      // Wait for delay
      if (level < 10) {
        console.log(`\n⏳ Waiting ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      // Remove visual indicator
      targetSegment.style.outline = ''
    }

    console.log('\n🔄 Restoring original state...')
    this.restoreOriginal()
    console.log('✅ All levels tested!')
  }

  testPurple() {
    if (!this.container) {
      console.error('❌ Tester not initialized. Call init() first.')
      return
    }

    console.log('\n💜 TESTING LEVEL 10 PURPLE SPECIFICALLY')
    console.log('═'.repeat(50))

    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    const segment10 = segments[9]
    const originalClasses = segment10.className

    console.log('1️⃣ Original state:')
    console.log(`   Classes: ${segment10.className}`)
    console.log(
      `   Background: ${window.getComputedStyle(segment10).backgroundColor}`
    )

    // Clean approach
    console.log('\n2️⃣ Cleaning all classes...')
    segment10.className = segment10.className
      .replace(/daqi-\d+/g, '')
      .replace(/daqi-selected/g, '')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions
    console.log(`   Classes: ${segment10.className}`)
    console.log(
      `   Background: ${window.getComputedStyle(segment10).backgroundColor}`
    )

    // Add daqi-10
    console.log('\n3️⃣ Adding daqi-10...')
    segment10.classList.add('daqi-10')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions
    const style1 = window.getComputedStyle(segment10)
    console.log(`   Classes: ${segment10.className}`)
    console.log(`   Background: ${style1.backgroundColor}`)
    console.log(
      `   Is Purple? ${style1.backgroundColor === 'rgb(76, 44, 146)' ? '✅ YES' : '❌ NO'}`
    )

    // Add daqi-selected
    console.log('\n4️⃣ Adding daqi-selected...')
    segment10.classList.add('daqi-selected')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions
    const style2 = window.getComputedStyle(segment10)
    console.log(`   Classes: ${segment10.className}`)
    console.log(`   Background: ${style2.backgroundColor}`)
    console.log(
      `   Is Purple? ${style2.backgroundColor === 'rgb(76, 44, 146)' ? '✅ YES' : '❌ NO'}`
    )

    // Visual highlight
    segment10.style.boxShadow = '0 0 20px purple'
    console.log('\n👁️ Visual: Purple highlight for 3 seconds')

    setTimeout(() => {
      segment10.style.boxShadow = ''
      segment10.className = originalClasses
      console.log('\n🔄 Restored original state')
    }, 3000)

    return {
      backgroundColor: style2.backgroundColor,
      isPurple: style2.backgroundColor === 'rgb(76, 44, 146)',
      classes: segment10.className
    }
  }

  resetToDefault() {
    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    segments.forEach((segment) => {
      segment.className = segment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')
      segment.classList.add('daqi-0')
    })
  }

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
}

// Create global instance
const daqiTesterComplete = new DAQITesterComplete()

// Global API
window.daqiTest = {
  init: () => daqiTesterComplete.init(),
  testLevel: (level, temporary = true) =>
    daqiTesterComplete.testLevel(level, temporary),
  testAll: (delay = 1500) => daqiTesterComplete.testAll(delay),
  testPurple: () => daqiTesterComplete.testPurple(),
  restore: () => daqiTesterComplete.restoreOriginal()
}

// Auto-initialize
if (daqiTesterComplete.init()) {
  console.log('\n✅ COMPLETE DAQI TESTER READY!')
  console.log('═'.repeat(50))
  console.log('Available commands:')
  console.log('  daqiTest.testLevel(10)      - Test specific level')
  console.log('  daqiTest.testAll(1500)      - Test all levels (ENHANCED)')
  console.log(
    '  daqiTest.testPurple()       - Test Level 10 purple specifically'
  )
  console.log('  daqiTest.restore()          - Restore original state')
  console.log('\n💜 Try: daqiTest.testAll(1500)')
  console.log('🚀 Or:  daqiTest.testPurple()')
} else {
  console.log(
    "❌ Failed to initialize. Make sure you're on a page with DAQI data."
  )
}
