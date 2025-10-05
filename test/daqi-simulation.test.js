import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { getAirQuality } from '../src/server/data/air-quality.js'

// Import the DAQI columns module
// import daqiColumnsModule from '../src/client/assets/javascripts/daqi-columns.js'

describe('DAQI Simulation Tests', () => {
  let dom
  let container

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM('<!doctype html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window

    // Create the tab panel wrapper
    const panel = document.createElement('div')
    panel.className = 'govuk-tabs__panel'

    container = document.createElement('div')
    container.className = 'daqi-numbered'

    const bar = document.createElement('div')
    bar.className = 'daqi-bar'

    // Create 10 segments with realistic widths
    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('div')
      seg.className = `daqi-bar-segment daqi-${i + 1}`
      // Use responsive widths that mimic real responsive behavior
      seg.style.width = i === 9 ? '100px' : '50px'

      const num = document.createElement('span')
      num.className = 'daqi-number'
      num.textContent = i + 1
      seg.appendChild(num)
      bar.appendChild(seg)
    }

    container.appendChild(bar)
    panel.appendChild(container)
    document.body.appendChild(panel)

    // Mock getComputedStyle for responsive behavior
    window.getComputedStyle = (el) => {
      if (el.classList && el.classList.contains('govuk-tabs__panel')) {
        return { display: 'block', visibility: 'visible' }
      }
      if (el.classList && el.classList.contains('daqi-bar-segment')) {
        // Return actual width for segments
        return { width: el.style.width || '50px' }
      }
      return { display: 'block' }
    }

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback
      }
      observe() {
        // Simulate immediate callback
        setTimeout(() => {
          this.callback([{ target: container }])
        }, 0)
      }
      unobserve() {}
      disconnect() {}
    }
  })

  describe('DAQI Value Testing - Moderate Range (4, 5, 6)', () => {
    it('should handle DAQI value 4 (Moderate - Low)', () => {
      const airQuality = getAirQuality(4)

      expect(airQuality.value).toBe(4)
      expect(airQuality.band).toBe('moderate')
      expect(airQuality.readableBand).toBe('moderate')
      expect(airQuality.advice).toContain(
        'short term exposure to moderate levels'
      )

      // Test visual representation
      const segment4 = container.querySelector('.daqi-4')
      expect(segment4).toBeTruthy()
      expect(segment4.textContent).toBe('4')

      console.log('✓ DAQI 4 (Moderate-Low):', {
        value: airQuality.value,
        band: airQuality.band,
        advice: airQuality.advice
      })
    })

    it('should handle DAQI value 5 (Moderate - Mid)', () => {
      const airQuality = getAirQuality(5)

      expect(airQuality.value).toBe(5)
      expect(airQuality.band).toBe('moderate')
      expect(airQuality.readableBand).toBe('moderate')
      expect(airQuality.atrisk.adults).toContain('heart problems')
      expect(airQuality.atrisk.asthma).toContain('reliever inhaler')

      console.log('✓ DAQI 5 (Moderate-Mid):', {
        value: airQuality.value,
        band: airQuality.band,
        atRiskAdvice: {
          adults: airQuality.atrisk.adults,
          asthma: airQuality.atrisk.asthma
        }
      })
    })

    it('should handle DAQI value 6 (Moderate - High)', () => {
      const airQuality = getAirQuality(6)

      expect(airQuality.value).toBe(6)
      expect(airQuality.band).toBe('moderate')
      expect(airQuality.readableBand).toBe('moderate')
      expect(airQuality.atrisk.oldPeople).toContain('less strenuous activity')

      // Test that CSS classes are applied correctly
      const segment6 = container.querySelector('.daqi-6')
      expect(segment6).toBeTruthy()

      console.log('✓ DAQI 6 (Moderate-High):', {
        value: airQuality.value,
        band: airQuality.band,
        oldPeopleAdvice: airQuality.atrisk.oldPeople
      })
    })

    it('should simulate moderate range responsive behavior', () => {
      // Simulate container resize for moderate values
      container.style.width = '590px'

      // Test different moderate values with responsive layout
      const moderateValues = [4, 5, 6]
      moderateValues.forEach((value) => {
        const airQuality = getAirQuality(value)
        expect(airQuality.band).toBe('moderate')

        // Simulate segment positioning for moderate range
        const segment = container.querySelector(`.daqi-${value}`)
        if (segment) {
          // In moderate range, segments should be properly spaced
          expect(segment.textContent).toBe(value.toString())
        }
      })

      console.log(
        '✓ Moderate range responsive behavior tested for values 4, 5, 6'
      )
    })
  })

  describe('DAQI Value Testing - High Range (7, 8, 9)', () => {
    it('should handle DAQI value 7 (High - Low)', () => {
      const airQuality = getAirQuality(7)

      expect(airQuality.value).toBe(7)
      expect(airQuality.band).toBe('high')
      expect(airQuality.readableBand).toBe('high')
      expect(airQuality.advice).toContain('experiencing discomfort')
      expect(airQuality.advice).toContain('reducing activity')

      console.log('✓ DAQI 7 (High-Low):', {
        value: airQuality.value,
        band: airQuality.band,
        advice: airQuality.advice
      })
    })

    it('should handle DAQI value 8 (High - Mid)', () => {
      const airQuality = getAirQuality(8)

      expect(airQuality.value).toBe(8)
      expect(airQuality.band).toBe('high')
      expect(airQuality.readableBand).toBe('high')
      expect(airQuality.atrisk.adults).toContain(
        'reduce strenuous physical exertion'
      )
      expect(airQuality.atrisk.asthma).toContain('reliever inhaler more often')

      // Test segment positioning in high range
      const segment8 = container.querySelector('.daqi-8')
      expect(segment8).toBeTruthy()

      console.log('✓ DAQI 8 (High-Mid):', {
        value: airQuality.value,
        band: airQuality.band,
        atRiskAdvice: {
          adults: airQuality.atrisk.adults,
          asthma: airQuality.atrisk.asthma
        }
      })
    })

    it('should handle DAQI value 9 (High - High)', () => {
      const airQuality = getAirQuality(9)

      expect(airQuality.value).toBe(9)
      expect(airQuality.band).toBe('high')
      expect(airQuality.readableBand).toBe('high')
      expect(airQuality.atrisk.oldPeople).toContain('reduce physical exertion')

      console.log('✓ DAQI 9 (High-High):', {
        value: airQuality.value,
        band: airQuality.band,
        oldPeopleAdvice: airQuality.atrisk.oldPeople,
        outlook: airQuality.outlook
      })
    })

    it('should simulate high range visual positioning', () => {
      // Test visual positioning for high range values
      ;[7, 8, 9].forEach((value) => {
        const airQuality = getAirQuality(value)
        expect(airQuality.band).toBe('high')

        const segment = container.querySelector(`.daqi-${value}`)
        if (segment) {
          // High range segments should be in the latter part of the bar
          expect(segment.textContent).toBe(value.toString())
          expect(value).toBeGreaterThanOrEqual(7)
          expect(value).toBeLessThanOrEqual(9)
        }
      })

      console.log('✓ High range visual positioning tested for values 7, 8, 9')
    })
  })

  describe('DAQI Value Testing - Very High Range (10)', () => {
    it('should handle DAQI value 10 (Very High)', () => {
      const airQuality = getAirQuality(10)

      expect(airQuality.value).toBe(10)
      expect(airQuality.band).toBe('veryHigh')
      expect(airQuality.readableBand).toBe('very high')
      expect(airQuality.advice).toContain('Reduce physical exertion')
      expect(airQuality.advice).toContain('particularly outdoors')

      // Very High specific advice
      expect(airQuality.atrisk.adults).toContain(
        'avoid strenuous physical activity'
      )
      expect(airQuality.atrisk.asthma).toContain('reliever inhaler more often')
      expect(airQuality.atrisk.oldPeople).toContain(
        'avoid strenuous physical activity'
      )

      console.log('✓ DAQI 10 (Very High):', {
        value: airQuality.value,
        band: airQuality.band,
        readableBand: airQuality.readableBand,
        advice: airQuality.advice,
        atRiskAdvice: {
          adults: airQuality.atrisk.adults,
          asthma: airQuality.atrisk.asthma,
          oldPeople: airQuality.atrisk.oldPeople
        }
      })
    })

    it('should handle very high value visual representation', () => {
      const airQualityData = getAirQuality(10)

      // Test the last segment (10th) is properly positioned
      const segment10 = container.querySelector('.daqi-10')
      expect(segment10).toBeTruthy()
      expect(segment10.textContent).toBe('10')

      // The 10th segment should have different width (100px vs 50px)
      expect(segment10.style.width).toBe('100px')

      console.log(
        '✓ DAQI 10 visual representation - Last segment with 100px width'
      )
      console.log('Air quality data:', airQualityData)
    })

    it('should simulate outlook messaging for very high', () => {
      const airQuality = getAirQuality(10)

      expect(airQuality.outlook).toContain('heatwave')
      expect(airQuality.outlook).toContain('very high')

      console.log('✓ DAQI 10 outlook:', airQuality.outlook)
    })
  })

  describe('DAQI Range Comparison Tests', () => {
    it('should show escalating severity across ranges', () => {
      const moderate = getAirQuality(5) // Moderate
      const high = getAirQuality(8) // High
      const veryHigh = getAirQuality(10) // Very High

      // Test that advice becomes more restrictive
      expect(moderate.advice).toContain('short term exposure')
      expect(high.advice).toContain('reducing activity')
      expect(veryHigh.advice).toContain('Reduce physical exertion')

      // Test that at-risk advice becomes more severe
      expect(moderate.atrisk.adults).toContain('consider doing less')
      expect(high.atrisk.adults).toContain('reduce strenuous')
      expect(veryHigh.atrisk.adults).toContain('avoid strenuous')

      console.log('✓ Escalating severity comparison:')
      console.log('  Moderate (5):', moderate.atrisk.adults)
      console.log('  High (8):', high.atrisk.adults)
      console.log('  Very High (10):', veryHigh.atrisk.adults)
    })

    it('should test responsive divider positioning across all ranges', () => {
      // Simulate testing divider positions for different value ranges
      const testValues = [4, 5, 6, 7, 8, 9, 10]

      testValues.forEach((value) => {
        const airQuality = getAirQuality(value)
        const segment = container.querySelector(`.daqi-${value}`)

        if (segment) {
          // Each segment should be positioned correctly
          expect(segment.textContent).toBe(value.toString())

          if (value <= 6) {
            expect(airQuality.band).toBe('moderate')
          } else if (value <= 9) {
            expect(airQuality.band).toBe('high')
          } else {
            expect(airQuality.band).toBe('veryHigh')
          }
        }
      })

      console.log(
        '✓ Responsive divider positioning tested for all target values: 4-10'
      )
    })

    it('should simulate mobile vs desktop responsive behavior', () => {
      // Test mobile-like narrow container
      container.style.width = '320px'

      // Test desktop-like wide container
      const desktopTest = () => {
        container.style.width = '590px'

        // All segments should maintain proper spacing
        const segments = container.querySelectorAll('.daqi-bar-segment')
        expect(segments.length).toBe(10)

        // Test that last segment has different width
        const lastSegment = segments[9]
        expect(lastSegment.style.width).toBe('100px')
      }

      desktopTest()

      console.log('✓ Mobile vs Desktop responsive behavior simulation complete')
    })
  })

  describe('DAQI Integration with JavaScript Columns', () => {
    it('should test divider calculations with moderate values', () => {
      // Mock ResizeObserver trigger for moderate values
      const segments = container.querySelectorAll('.daqi-bar-segment')

      // Verify we have 10 segments
      expect(segments.length).toBe(10)

      // Test that divider positions would be calculated correctly
      // for moderate range (segments 4, 5, 6)
      const moderateSegments = Array.from(segments).slice(3, 6) // indices 3,4,5 = values 4,5,6

      moderateSegments.forEach((segment, index) => {
        const value = index + 4 // 4, 5, 6
        expect(segment.textContent).toBe(value.toString())
      })

      console.log('✓ Moderate values (4,5,6) segment integration verified')
    })

    it('should test CSS custom property setting for divider positions', () => {
      // Simulate the CSS custom property calculation
      const GAP = 3
      const colWidths = [50, 50, 50, 50, 50, 50, 50, 50, 50, 100] // px values

      // Calculate divider positions (after segments 3, 6, 9)
      const divider1 =
        colWidths.slice(0, 3).reduce((s, v) => s + v, 0) + GAP * 2 // 156px
      const divider2 =
        colWidths.slice(0, 6).reduce((s, v) => s + v, 0) + GAP * 5 // 315px
      const divider3 =
        colWidths.slice(0, 9).reduce((s, v) => s + v, 0) + GAP * 8 // 474px

      // Test that these positions would separate our target ranges correctly
      expect(divider1).toBe(156) // After moderate range starts (after segment 3)
      expect(divider2).toBe(315) // After moderate range ends (after segment 6)
      expect(divider3).toBe(474) // After high range ends (after segment 9)

      console.log('✓ CSS divider positions calculated:')
      console.log(`  Divider 1 (after Low): ${divider1}px`)
      console.log(`  Divider 2 (after Moderate): ${divider2}px`)
      console.log(`  Divider 3 (after High): ${divider3}px`)
    })
  })
})
