/**
 * DAQI Tester - Clean Production Version
 *
 * Clean version without debugging logs for production use.
 * Copy this into browser console for streamlined DAQI testing.
 */

// ''

class DAQITester {
  constructor() {
    this.container = null
    this.originalValues = new Map()
  }

  init() {
    this.container = document.querySelector('.daqi-numbered')

    if (!this.container) {
      console.error('❌ No .daqi-numbered container found')
      return false
    }

    this.storeOriginalState()
    console.log('✅ DAQI Tester ready')
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
    if (!this.container || level < 1 || level > 10) return

    const segments = this.container.querySelectorAll('.daqi-bar-segment')

    // Reset all segments
    segments.forEach((segment) => {
      segment.className = segment.className
        .replace(/daqi-\d+/g, '')
        .replace(/daqi-selected/g, '')
      segment.classList.add('daqi-0')
    })

    // Apply target level
    const targetSegment = segments[level - 1]
    targetSegment.classList.remove('daqi-0')
    targetSegment.classList.add(`daqi-${level}`)
    targetSegment.classList.add('daqi-selected')
    targetSegment.offsetHeight // eslint-disable-line no-unused-expressions

    if (temporary) {
      setTimeout(() => this.restoreOriginal(), 3000)
    }

    return {
      level,
      backgroundColor: window.getComputedStyle(targetSegment).backgroundColor,
      classes: targetSegment.className
    }
  }

  async testAll(delay = 1500) {
    if (!this.container) return

    for (let level = 1; level <= 10; level++) {
      const segments = this.container.querySelectorAll('.daqi-bar-segment')

      // Reset all segments
      segments.forEach((segment) => {
        segment.className = segment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        segment.classList.add('daqi-0')
      })
      this.container.offsetHeight // eslint-disable-line no-unused-expressions

      // Apply target level with special handling for level 10
      const targetSegment = segments[level - 1]

      if (level === 10) {
        // Enhanced Level 10 handling for purple color
        targetSegment.className = targetSegment.className
          .replace(/daqi-\d+/g, '')
          .replace(/daqi-selected/g, '')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
        targetSegment.classList.add('daqi-10')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      } else {
        targetSegment.classList.remove('daqi-0')
        targetSegment.classList.add(`daqi-${level}`)
        targetSegment.classList.add('daqi-selected')
        targetSegment.offsetHeight // eslint-disable-line no-unused-expressions
      }

      // Wait between levels
      if (level < 10) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    // Brief pause before restoring
    await new Promise((resolve) => setTimeout(resolve, delay))
    this.restoreOriginal()
  }

  testPurple() {
    if (!this.container) return

    const segments = this.container.querySelectorAll('.daqi-bar-segment')
    const segment10 = segments[9]
    const originalClasses = segment10.className

    // Clean and apply Level 10
    segment10.className = segment10.className
      .replace(/daqi-\d+/g, '')
      .replace(/daqi-selected/g, '')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions
    segment10.classList.add('daqi-10')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions
    segment10.classList.add('daqi-selected')
    segment10.offsetHeight // eslint-disable-line no-unused-expressions

    const bgColor = window.getComputedStyle(segment10).backgroundColor
    const isPurple = bgColor === 'rgb(76, 44, 146)'

    console.log(`Purple test: ${isPurple ? '✅ PASS' : '❌ FAIL'} (${bgColor})`)

    // Visual highlight
    segment10.style.boxShadow = '0 0 20px purple'

    setTimeout(() => {
      segment10.style.boxShadow = ''
      segment10.className = originalClasses
    }, 3000)

    return { bgColor, isPurple }
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
const daqiTester = new DAQITester()

// Clean API
window.daqi = {
  init: () => daqiTester.init(),
  test: (level, temporary = true) => daqiTester.testLevel(level, temporary),
  testAll: (delay = 1500) => daqiTester.testAll(delay),
  testPurple: () => daqiTester.testPurple(),
  restore: () => daqiTester.restoreOriginal()
}

// Auto-initialize
if (daqiTester.init()) {
  console.log('DAQI Testing Commands:')
  console.log('  daqi.test(10)        - Test level 10')
  console.log('  daqi.testAll(1500)   - Test all levels')
  console.log('  daqi.testPurple()    - Test purple specifically')
  console.log('  daqi.restore()       - Restore original state')
}
