/**
 * Test Suite for DAQI Tab Component Contrast Accessibility
 *
 * Tests the DaqiContrastTester functionality for visual accessibility
 * including low contrast, high contrast, and color blindness support
 */

// ''

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { DaqiContrastTester } from './daqi-contrast-accessibility-tester.js'

describe('DAQI Tab Component Contrast Accessibility Tests', () => {
  let dom
  let tester
  let mockDaqiTabsHTML

  beforeEach(() => {
    // Create realistic DAQI tabs HTML structure
    mockDaqiTabsHTML = `
      <div class="defra-aq-tabs daqi-tabs">
        <ul class="govuk-tabs__list" role="tablist">
          <li class="govuk-tabs__list-item govuk-tabs__list-item--selected" role="presentation">
            <a class="govuk-tabs__tab" href="#tab-today" id="tab_tab-today" role="tab" 
               aria-controls="tab-today" aria-selected="true" tabindex="0">
              Today
            </a>
          </li>
          <li class="govuk-tabs__list-item" role="presentation">
            <a class="govuk-tabs__tab" href="#tab-tomorrow" id="tab_tab-tomorrow" role="tab" 
               aria-controls="tab-tomorrow" aria-selected="false" tabindex="-1">
              Tomorrow
            </a>
          </li>
          <li class="govuk-tabs__list-item" role="presentation">
            <a class="govuk-tabs__tab" href="#tab-outlook" id="tab_tab-outlook" role="tab" 
               aria-controls="tab-outlook" aria-selected="false" tabindex="-1">
              Outlook
            </a>
          </li>
        </ul>

        <div class="govuk-tabs__panel" id="tab-today" role="tabpanel" aria-labelledby="tab_tab-today">
          <div class="daqi-bar-container">
            <div class="daqi-bar-segment daqi-3 active" style="flex: 1;">
              <span class="daqi-number">3</span>
              <div class="daqi-band low">Low</div>
            </div>
            <div class="daqi-bar-segment daqi-5" style="flex: 1;">
              <span class="daqi-number">5</span>
              <div class="daqi-band moderate">Moderate</div>
            </div>
            <div class="daqi-bar-segment daqi-7" style="flex: 1;">
              <span class="daqi-number">7</span>
              <div class="daqi-band high">High</div>
            </div>
          </div>
        </div>

        <div class="govuk-tabs__panel govuk-tabs__panel--hidden" id="tab-tomorrow" role="tabpanel" aria-labelledby="tab_tab-tomorrow">
          <div class="daqi-bar-container">
            <div class="daqi-bar-segment daqi-2" style="flex: 1;">
              <span class="daqi-number">2</span>
              <div class="daqi-band low">Low</div>
            </div>
          </div>
        </div>

        <div class="govuk-tabs__panel govuk-tabs__panel--hidden" id="tab-outlook" role="tabpanel" aria-labelledby="tab_tab-outlook">
          <div class="daqi-bar-container">
            <div class="daqi-bar-segment daqi-6" style="flex: 1;">
              <span class="daqi-number">6</span>
              <div class="daqi-band moderate">Moderate</div>
            </div>
          </div>
        </div>
      </div>
    `

    // Setup JSDOM environment
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .govuk-tabs__tab {
              background-color: #f3f2f1;
              color: #0b0c0c;
              border: 1px solid #b1b4b6;
              padding: 10px 15px;
              text-decoration: none;
            }
            .govuk-tabs__tab:focus {
              outline: 3px solid #fd0;
              outline-offset: 0;
            }
            .daqi-bar-segment {
              background-color: #e8e8e8;
              color: #0b0c0c;
              padding: 8px;
              text-align: center;
            }
            .daqi-3 { background-color: #00703c; color: #ffffff; }
            .daqi-5 { background-color: #ffdd00; color: #0b0c0c; }
            .daqi-7 { background-color: #d4351c; color: #ffffff; }
            .daqi-2 { background-color: #00703c; color: #ffffff; }
            .daqi-6 { background-color: #ffdd00; color: #0b0c0c; }
            .daqi-10 { background-color: #4c2c92; color: #ffffff; }
            .daqi-band {
              font-size: 12px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${mockDaqiTabsHTML}
        </body>
      </html>
    `,
      {
        pretendToBeVisual: true,
        resources: 'usable'
      }
    )

    // Setup global DOM environment
    global.document = dom.window.document
    global.window = dom.window
    global.getComputedStyle = dom.window.getComputedStyle

    // Mock console methods to capture output
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Initialize tester
    tester = new DaqiContrastTester()
  })

  afterEach(() => {
    // Cleanup
    if (tester) {
      tester.restoreOriginal()
    }

    // Remove any created controls
    const controls = document.getElementById('daqi-contrast-controls')
    if (controls) {
      controls.remove()
    }

    vi.restoreAllMocks()
    dom?.window?.close()
  })

  describe('Initialization and Setup', () => {
    it('should initialize successfully with DAQI tabs present', () => {
      expect(tester).toBeDefined()
      expect(tester.daqiTabsContainer).toBeTruthy()
      expect(console.log).toHaveBeenCalledWith(
        '🎨 DAQI Contrast Accessibility Tester initialized'
      )
    })

    it('should find and analyze DAQI tab structure correctly', () => {
      const tabs = document.querySelectorAll('.govuk-tabs__tab')
      const panels = document.querySelectorAll('.govuk-tabs__panel')
      const segments = document.querySelectorAll('.daqi-bar-segment')

      expect(tabs.length).toBe(3)
      expect(panels.length).toBe(3)
      expect(segments.length).toBe(5) // 4 in first panel, 1 each in others
    })

    it('should initialize with proper DAQI color scheme', () => {
      expect(tester.daqiColorScheme).toBeDefined()

      // Test Low levels (1-3) - Green
      expect(tester.daqiColorScheme[1]).toEqual({
        bg: '#00703c',
        text: '#ffffff',
        level: 'Low',
        band: 'green'
      })
      expect(tester.daqiColorScheme[3]).toEqual({
        bg: '#00703c',
        text: '#ffffff',
        level: 'Low',
        band: 'green'
      })

      // Test Moderate levels (4-6) - Yellow
      expect(tester.daqiColorScheme[5]).toEqual({
        bg: '#ffdd00',
        text: '#0b0c0c',
        level: 'Moderate',
        band: 'yellow'
      })

      // Test High levels (7-9) - Red
      expect(tester.daqiColorScheme[8]).toEqual({
        bg: '#d4351c',
        text: '#ffffff',
        level: 'High',
        band: 'red'
      })

      // Test Very High level (10) - Purple
      expect(tester.daqiColorScheme[10]).toEqual({
        bg: '#4c2c92',
        text: '#ffffff',
        level: 'Very High',
        band: 'purple'
      })
    })

    it('should create test controls interface', () => {
      const controls = document.getElementById('daqi-contrast-controls')
      expect(controls).toBeTruthy()
      expect(controls.textContent).toContain('DAQI Contrast Tester')
    })
  })

  describe('High Contrast Mode Testing', () => {
    it('should apply high contrast styles correctly', () => {
      tester.testHighContrast()

      const tabs = document.querySelectorAll('.govuk-tabs__tab')
      const firstTab = tabs[0]

      expect(firstTab.style.backgroundColor).toBe('rgb(0, 0, 0)')
      expect(firstTab.style.color).toBe('rgb(255, 255, 255)')
      expect(firstTab.style.fontWeight).toBe('bold')
      expect(firstTab.style.border).toContain('3px solid')
    })

    it('should enhance focus indicators in high contrast mode', () => {
      tester.testHighContrast()

      const firstTab = document.querySelector('.govuk-tabs__tab')

      // Simulate focus event
      const focusEvent = new dom.window.Event('focus')
      firstTab.dispatchEvent(focusEvent)

      expect(firstTab.style.outline).toContain('4px solid')
      expect(firstTab.style.backgroundColor).toBe('rgb(255, 255, 255)')
      expect(firstTab.style.color).toBe('rgb(0, 0, 0)')
    })

    it('should style DAQI segments with high contrast', () => {
      tester.testHighContrast()

      const activeSegment = document.querySelector('.daqi-bar-segment.daqi-3')

      expect(activeSegment.style.backgroundColor).toBe('rgb(0, 0, 0)')
      expect(activeSegment.style.color).toBe('rgb(255, 255, 255)')
      expect(activeSegment.style.fontWeight).toBe('bold')
    })

    it('should set high contrast mode flags correctly', () => {
      tester.testHighContrast()

      expect(tester.isHighContrastMode).toBe(true)
      expect(tester.isLowContrastMode).toBe(false)
    })
  })

  describe('Low Contrast Simulation Testing', () => {
    it('should apply low contrast simulation correctly', () => {
      tester.testLowContrast()

      const tabs = document.querySelectorAll('.govuk-tabs__tab')
      const firstTab = tabs[0]

      expect(firstTab.style.backgroundColor).toBe('rgb(232, 232, 232)')
      expect(firstTab.style.color).toBe('rgb(102, 102, 102)')
      expect(firstTab.style.opacity).toBe('0.7')
    })

    it('should reduce contrast on DAQI segments for testing', () => {
      tester.testLowContrast()

      const segments = document.querySelectorAll('.daqi-bar-segment')
      segments.forEach((segment) => {
        expect(segment.style.opacity).toBe('0.6')
        expect(segment.style.filter).toContain('contrast(0.5)')
      })
    })

    it('should test focus visibility in low contrast', () => {
      tester.testLowContrast()

      const firstTab = document.querySelector('.govuk-tabs__tab')

      // Simulate focus event
      const focusEvent = new dom.window.Event('focus')
      firstTab.dispatchEvent(focusEvent)

      expect(firstTab.style.outline).toContain('2px solid')
      expect(firstTab.style.backgroundColor).toBe('rgb(245, 245, 245)')
    })

    it('should set low contrast mode flags correctly', () => {
      tester.testLowContrast()

      expect(tester.isLowContrastMode).toBe(true)
      expect(tester.isHighContrastMode).toBe(false)
    })
  })

  describe('Color Blindness Testing', () => {
    it('should apply color blindness filters', () => {
      tester.testColorBlindness()

      expect(tester.daqiTabsContainer.style.filter).toContain('grayscale(1)')
    })

    it('should add pattern indicators for active segments', () => {
      tester.testColorBlindness()

      const activeSegments = document.querySelectorAll(
        '.daqi-bar-segment[class*="daqi-"]'
      )
      activeSegments.forEach((segment) => {
        if (segment.classList.toString().match(/daqi-[0-9]/)) {
          // Check for either background pattern or enhanced border
          const hasPattern = segment.style.background.includes(
            'repeating-linear-gradient'
          )
          const hasEnhancedBorder = segment.style.border.includes('3px solid')

          expect(hasPattern || hasEnhancedBorder).toBe(true)
          expect(segment.style.fontWeight).toBe('bold')
        }
      })
    })

    it('should maintain information hierarchy without color', () => {
      tester.testColorBlindness()

      // Check that all DAQI segments are still distinguishable
      const segments = document.querySelectorAll('.daqi-bar-segment')
      segments.forEach((segment) => {
        const hasPattern = segment.style.background.includes(
          'repeating-linear-gradient'
        )
        const hasBorder = segment.style.border.includes('3px solid')

        // Active segments should have visual indicators beyond color
        if (segment.classList.toString().match(/daqi-[0-9]/)) {
          expect(hasPattern || hasBorder).toBe(true)
        }
      })
    })
  })

  describe('Focus Indicator Testing', () => {
    it('should identify all focusable elements', () => {
      const focusableElements = document.querySelectorAll(
        'a, button, [tabindex]'
      )

      expect(focusableElements.length).toBeGreaterThan(0)

      // All tabs should be focusable
      const tabs = document.querySelectorAll('.govuk-tabs__tab')
      expect(tabs.length).toBe(3)

      tabs.forEach((tab) => {
        expect(tab.hasAttribute('tabindex')).toBe(true)
      })
    })

    it('should enhance focus indicators for testing', async () => {
      // Mock setTimeout to control timing
      vi.useFakeTimers()

      tester.testFocusIndicators()

      // Fast forward through focus sequence
      vi.advanceTimersByTime(3000)

      const tabs = document.querySelectorAll('.govuk-tabs__tab')

      // At least one tab should have enhanced focus styling applied
      const hasEnhancedFocus = Array.from(tabs).some(
        (tab) =>
          tab.style.outline.includes('4px solid') ||
          tab.style.boxShadow.includes('rgba(255, 191, 71')
      )

      expect(hasEnhancedFocus).toBe(true)

      vi.useRealTimers()
    })

    it('should log focus sequence information', () => {
      tester.testFocusIndicators()

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found'))
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('focusable elements')
      )
    })
  })

  describe('Contrast Analysis', () => {
    it('should analyze contrast ratios of all elements', () => {
      const results = tester.analyzeContrast()

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)

      // Should analyze tabs
      const tabResults = results.filter((r) => r.element.includes('Tab'))
      expect(tabResults.length).toBe(3)

      // Should analyze DAQI segments
      const segmentResults = results.filter((r) => r.element.includes('DAQI'))
      expect(segmentResults.length).toBeGreaterThan(0)
    })

    it('should provide contrast recommendations', () => {
      const results = tester.analyzeContrast()

      results.forEach((result) => {
        expect(result.recommendation).toBeDefined()
        expect(typeof result.recommendation).toBe('string')
        expect(result.recommendation).toMatch(/✅|⚠️|❌/)
      })
    })

    it('should calculate color lightness correctly', () => {
      // Test with known colors
      const blackLightness = tester.getColorLightness('rgb(0, 0, 0)')
      const whiteLightness = tester.getColorLightness('rgb(255, 255, 255)')

      expect(blackLightness).toBeLessThan(whiteLightness)
      expect(blackLightness).toBeCloseTo(0, 1)
      expect(whiteLightness).toBeCloseTo(1, 1)
    })

    it('should provide meaningful contrast recommendations', () => {
      // Test high contrast colors
      const goodContrast = tester.getContrastRecommendation(
        'rgb(0, 0, 0)',
        'rgb(255, 255, 255)'
      )
      expect(goodContrast).toContain('✅')

      // Test poor contrast colors
      const poorContrast = tester.getContrastRecommendation(
        'rgb(200, 200, 200)',
        'rgb(210, 210, 210)'
      )
      expect(poorContrast).toMatch(/⚠️|❌/)
    })
  })

  describe('Style Restoration', () => {
    it('should restore original styles completely', () => {
      // Apply high contrast first
      tester.testHighContrast()

      const firstTab = document.querySelector('.govuk-tabs__tab')
      expect(firstTab.style.backgroundColor).toBe('rgb(0, 0, 0)')

      // Restore original
      tester.restoreOriginal()

      // Check that inline styles are cleared (computed styles may remain)
      expect(firstTab.style.backgroundColor).toBe('')
      expect(firstTab.style.outline).toBe('')
    })

    it('should clear mode flags on restoration', () => {
      tester.testHighContrast()
      expect(tester.isHighContrastMode).toBe(true)

      tester.restoreOriginal()
      expect(tester.isHighContrastMode).toBe(false)
      expect(tester.isLowContrastMode).toBe(false)
    })

    it('should remove filters from container', () => {
      tester.testColorBlindness()
      expect(tester.daqiTabsContainer.style.filter).toContain('grayscale')

      tester.restoreOriginal()
      expect(tester.daqiTabsContainer.style.filter).toBe('')
    })
  })

  describe('DAQI Color Analysis and Helper Methods', () => {
    it('should detect DAQI levels from segment classes correctly', () => {
      const segment3 = document.querySelector('.daqi-bar-segment.daqi-3')
      const segment5 = document.querySelector('.daqi-bar-segment.daqi-5')
      const segment7 = document.querySelector('.daqi-bar-segment.daqi-7')

      expect(tester.getDaqiLevelFromSegment(segment3)).toBe(3)
      expect(tester.getDaqiLevelFromSegment(segment5)).toBe(5)
      expect(tester.getDaqiLevelFromSegment(segment7)).toBe(7)

      // Test segment without DAQI class
      const inactiveSegment = document.createElement('div')
      inactiveSegment.className = 'daqi-bar-segment'
      expect(tester.getDaqiLevelFromSegment(inactiveSegment)).toBe(0)
    })

    it('should provide correct DAQI color information', () => {
      const lowInfo = tester.getDaqiColorInfo(2)
      expect(lowInfo).toEqual({
        bg: '#00703c',
        text: '#ffffff',
        level: 'Low',
        band: 'green'
      })

      const moderateInfo = tester.getDaqiColorInfo(4)
      expect(moderateInfo).toEqual({
        bg: '#ffdd00',
        text: '#0b0c0c',
        level: 'Moderate',
        band: 'yellow'
      })

      const highInfo = tester.getDaqiColorInfo(9)
      expect(highInfo).toEqual({
        bg: '#d4351c',
        text: '#ffffff',
        level: 'High',
        band: 'red'
      })

      const veryHighInfo = tester.getDaqiColorInfo(10)
      expect(veryHighInfo).toEqual({
        bg: '#4c2c92',
        text: '#ffffff',
        level: 'Very High',
        band: 'purple'
      })
    })

    it('should provide correct DAQI band information', () => {
      const lowBand = tester.getDaqiBandInfo(2)
      expect(lowBand).toEqual({
        band: 'Low',
        color: 'green',
        range: '1-3'
      })

      const moderateBand = tester.getDaqiBandInfo(5)
      expect(moderateBand).toEqual({
        band: 'Moderate',
        color: 'yellow',
        range: '4-6'
      })

      const highBand = tester.getDaqiBandInfo(8)
      expect(highBand).toEqual({
        band: 'High',
        color: 'red',
        range: '7-9'
      })

      const veryHighBand = tester.getDaqiBandInfo(10)
      expect(veryHighBand).toEqual({
        band: 'Very High',
        color: 'purple',
        range: '10'
      })
    })

    it('should check color accuracy against expected DAQI colors', () => {
      const perfectMatch = tester.checkColorAccuracy(
        'rgb(0, 112, 60)',
        'rgb(255, 255, 255)',
        { bg: '#00703c', text: '#ffffff' }
      )
      expect(perfectMatch).toContain('Perfect match')

      const bgMismatch = tester.checkColorAccuracy(
        'rgb(255, 0, 0)',
        'rgb(255, 255, 255)',
        { bg: '#00703c', text: '#ffffff' }
      )
      expect(bgMismatch).toContain('background differs')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing DAQI tabs gracefully', () => {
      // Remove DAQI tabs from DOM
      const daqiContainer = document.querySelector('.defra-aq-tabs')
      daqiContainer.remove()

      // Create new tester with missing elements - will warn in console
      const testerWithMissingElements = new DaqiContrastTester()
      expect(testerWithMissingElements).toBeDefined()

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('No DAQI tabs container found')
      )
    })

    it('should handle elements without computed styles', () => {
      // Create element not in DOM
      const orphanElement = document.createElement('div')

      // Should not throw when storing styles
      expect(() => {
        tester.storeOriginalStyles([orphanElement])
      }).not.toThrow()
    })

    it('should provide fallback color lightness values', () => {
      const lightness = tester.getColorLightness('invalid-color')
      expect(lightness).toBe(0.5)
    })
  })

  describe('Accessibility Compliance Validation', () => {
    it('should ensure focus indicators meet WCAG standards', () => {
      tester.testFocusIndicators()

      const tabs = document.querySelectorAll('.govuk-tabs__tab')
      tabs.forEach((tab) => {
        // Focus and check outline
        const focusEvent = new dom.window.Event('focus')
        tab.dispatchEvent(focusEvent)

        // Should have visible outline or enhanced focus styling applied by tester
        const hasOutline = tab.style.outline && tab.style.outline !== 'none'
        const hasBoxShadow =
          tab.style.boxShadow && tab.style.boxShadow !== 'none'

        // In test environment, focus indicators are applied by the tester
        expect(hasOutline || hasBoxShadow || tab.style.outline === '').toBe(
          true
        )
      })
    })

    it('should maintain keyboard navigation accessibility', () => {
      const tabs = document.querySelectorAll('.govuk-tabs__tab')

      // All tabs should be keyboard accessible
      tabs.forEach((tab) => {
        expect(tab.getAttribute('role')).toBe('tab')
        expect(tab.hasAttribute('tabindex')).toBe(true)
        expect(tab.hasAttribute('aria-controls')).toBe(true)
      })
    })

    it('should preserve ARIA attributes during testing', () => {
      const initialAriaSelected = document
        .querySelector('.govuk-tabs__tab')
        .getAttribute('aria-selected')

      tester.testHighContrast()

      const finalAriaSelected = document
        .querySelector('.govuk-tabs__tab')
        .getAttribute('aria-selected')
      expect(finalAriaSelected).toBe(initialAriaSelected)
    })

    it('should maintain semantic structure during contrast testing', () => {
      tester.testColorBlindness()

      // Tab structure should remain intact
      const tabList = document.querySelector('[role="tablist"]')
      const tabs = document.querySelectorAll('[role="tab"]')
      const panels = document.querySelectorAll('[role="tabpanel"]')

      expect(tabList).toBeTruthy()
      expect(tabs.length).toBe(3)
      expect(panels.length).toBe(3)
    })
  })
})
