/**
 * DAQI Tab Component Contrast Accessibility Tester
 *
 * Tests the DAQI tab component for low and high contrast accessibility
 * for people with visual disabilities including:
 * - Low vision users who need enhanced contrast
 * - Users with color blindness
 * - Users with light sensitivity
 * - Users who rely on high contrast mode
 */

// ''

class DaqiContrastTester {
  constructor() {
    this.originalStyles = new Map()
    this.testContainer = null
    this.isHighContrastMode = false
    this.isLowContrastMode = false
    // Official DAQI color scheme based on GOVUK design system
    this.daqiColorScheme = {
      // DAQI levels 1-3: Low (Green)
      1: { bg: '#00703c', text: '#ffffff', level: 'Low', band: 'green' },
      2: { bg: '#00703c', text: '#ffffff', level: 'Low', band: 'green' },
      3: { bg: '#00703c', text: '#ffffff', level: 'Low', band: 'green' },
      // DAQI levels 4-6: Moderate (Yellow)
      4: { bg: '#ffdd00', text: '#0b0c0c', level: 'Moderate', band: 'yellow' },
      5: { bg: '#ffdd00', text: '#0b0c0c', level: 'Moderate', band: 'yellow' },
      6: { bg: '#ffdd00', text: '#0b0c0c', level: 'Moderate', band: 'yellow' },
      // DAQI levels 7-9: High (Red)
      7: { bg: '#d4351c', text: '#ffffff', level: 'High', band: 'red' },
      8: { bg: '#d4351c', text: '#ffffff', level: 'High', band: 'red' },
      9: { bg: '#d4351c', text: '#ffffff', level: 'High', band: 'red' },
      // DAQI level 10: Very High (Purple)
      10: { bg: '#4c2c92', text: '#ffffff', level: 'Very High', band: 'purple' }
    }
    this.init()
  }

  init() {
    if (typeof document === 'undefined') {
      console.warn('DOM not available. Tests require browser environment.')
      return
    }

    this.findDaqiTabs()
    this.createTestControls()
    console.log('🎨 DAQI Contrast Accessibility Tester initialized')
    console.log('📋 Available commands:')
    console.log(
      '  window.daqiContrastTester.testHighContrast() - Enable high contrast mode'
    )
    console.log(
      '  window.daqiContrastTester.testLowContrast() - Enable low contrast simulation'
    )
    console.log(
      '  window.daqiContrastTester.testColorBlindness() - Simulate color blindness'
    )
    console.log(
      '  window.daqiContrastTester.testFocusIndicators() - Test keyboard focus visibility'
    )
    console.log(
      '  window.daqiContrastTester.analyzeContrast() - Analyze current contrast ratios'
    )
    console.log(
      '  window.daqiContrastTester.restoreOriginal() - Restore original styling'
    )
  }

  findDaqiTabs() {
    this.daqiTabsContainer = document.querySelector('.defra-aq-tabs.daqi-tabs')

    if (!this.daqiTabsContainer) {
      console.warn('⚠️ No DAQI tabs container found. Looking for any tabs...')
      this.daqiTabsContainer = document.querySelector('.daqi-tabs, .govuk-tabs')
    }

    if (this.daqiTabsContainer) {
      console.log('✅ Found DAQI tabs container')
      this.analyzeTabStructure()
    } else {
      console.error('❌ No DAQI tabs found. Cannot run accessibility tests.')
    }
  }

  analyzeTabStructure() {
    const tabs = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__tab')
    const panels = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__panel')
    const daqiSegments =
      this.daqiTabsContainer.querySelectorAll('.daqi-bar-segment')

    console.log('📊 Tab Structure Analysis:')
    console.log(`   Tabs found: ${tabs.length}`)
    console.log(`   Panels found: ${panels.length}`)
    console.log(`   DAQI segments found: ${daqiSegments.length}`)

    // Store original styles for restoration
    this.storeOriginalStyles(tabs)
    this.storeOriginalStyles(panels)
    this.storeOriginalStyles(daqiSegments)
    this.storeOriginalStyles([this.daqiTabsContainer])
  }

  storeOriginalStyles(elements) {
    elements.forEach((element, index) => {
      if (element) {
        const computedStyle = window.getComputedStyle(element)
        this.originalStyles.set(element, {
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          borderColor: computedStyle.borderColor,
          boxShadow: computedStyle.boxShadow,
          opacity: computedStyle.opacity,
          filter: computedStyle.filter
        })
      }
    })
  }

  createTestControls() {
    // Create floating test controls
    const controlsContainer = document.createElement('div')
    controlsContainer.id = 'daqi-contrast-controls'
    controlsContainer.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border: 2px solid #0b0c0c;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
        font-family: 'GDS Transport', arial, sans-serif;
        font-size: 16px;
        line-height: 1.25;
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
          🎨 DAQI Contrast Tester
        </h3>
        <button onclick="window.daqiContrastTester.testHighContrast()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #1d70b8; color: white; border: none; border-radius: 3px; cursor: pointer;">
          High Contrast Mode
        </button>
        <button onclick="window.daqiContrastTester.testLowContrast()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #5694ca; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Low Contrast Simulation
        </button>
        <button onclick="window.daqiContrastTester.testColorBlindness()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #f47738; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Color Blindness Test
        </button>
        <button onclick="window.daqiContrastTester.testFocusIndicators()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #00703c; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Focus Indicators
        </button>
        <button onclick="window.daqiContrastTester.analyzeContrast()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #6f777b; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Analyze Contrast
        </button>
        <button onclick="window.daqiContrastTester.restoreOriginal()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #d4351c; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Restore Original
        </button>
        <div id="contrast-results" style="margin-top: 10px; font-size: 14px;"></div>
      </div>
    `
    document.body.appendChild(controlsContainer)
  }

  testHighContrast() {
    console.log('🔆 Testing High Contrast Mode for Visual Accessibility')
    this.restoreOriginal()
    this.isHighContrastMode = true
    this.isLowContrastMode = false

    if (!this.daqiTabsContainer) return

    // Apply high contrast styles to tabs
    const tabs = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__tab')
    const panels = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__panel')
    const daqiSegments =
      this.daqiTabsContainer.querySelectorAll('.daqi-bar-segment')
    const labels = this.daqiTabsContainer.querySelectorAll('.daqi-band')

    // High contrast tab styling
    tabs.forEach((tab) => {
      tab.style.backgroundColor = '#000000'
      tab.style.color = '#ffffff'
      tab.style.border = '3px solid #ffffff'
      tab.style.fontWeight = 'bold'

      // Enhanced focus indicators
      tab.addEventListener('focus', () => {
        tab.style.outline = '4px solid #ffff00'
        tab.style.outlineOffset = '2px'
        tab.style.backgroundColor = '#ffffff'
        tab.style.color = '#000000'
      })

      tab.addEventListener('blur', () => {
        tab.style.outline = 'none'
        tab.style.backgroundColor = '#000000'
        tab.style.color = '#ffffff'
      })
    })

    // High contrast panel styling
    panels.forEach((panel) => {
      panel.style.backgroundColor = '#ffffff'
      panel.style.color = '#000000'
      panel.style.border = '3px solid #000000'
    })

    // High contrast DAQI segments with proper level detection
    daqiSegments.forEach((segment, index) => {
      const daqiLevel = this.getDaqiLevelFromSegment(segment)

      if (daqiLevel > 0) {
        // Active DAQI segment - high contrast styling
        segment.style.backgroundColor = '#000000'
        segment.style.color = '#ffffff'
        segment.style.border = '3px solid #ffffff'

        // Add visual indicator for DAQI level category
        const colorInfo = this.daqiColorScheme[daqiLevel]
        if (colorInfo) {
          segment.style.borderColor =
            colorInfo.band === 'green'
              ? '#00ff00'
              : colorInfo.band === 'yellow'
                ? '#ffff00'
                : colorInfo.band === 'red'
                  ? '#ff0000'
                  : colorInfo.band === 'purple'
                    ? '#ff00ff'
                    : '#ffffff'
          segment.setAttribute('data-daqi-band', colorInfo.band)
          segment.setAttribute('data-daqi-level', colorInfo.level)
        }
      } else {
        // Inactive segment
        segment.style.backgroundColor = '#ffffff'
        segment.style.color = '#000000'
        segment.style.border = '2px solid #000000'
      }

      segment.style.fontWeight = 'bold'
      segment.style.fontSize = '16px'
    })

    // High contrast labels
    labels.forEach((label) => {
      label.style.backgroundColor = '#000000'
      label.style.color = '#ffffff'
      label.style.padding = '4px 8px'
      label.style.fontWeight = 'bold'
      label.style.border = '2px solid #ffffff'
    })

    this.logContrastResults('High Contrast Mode Applied', {
      mode: 'High Contrast',
      background: '#000000',
      foreground: '#ffffff',
      contrastRatio: '21:1 (AAA)',
      focusIndicator: '4px yellow outline'
    })
  }

  testLowContrast() {
    console.log('🔅 Testing Low Contrast Simulation for Visual Accessibility')
    this.restoreOriginal()
    this.isLowContrastMode = true
    this.isHighContrastMode = false

    if (!this.daqiTabsContainer) return

    // Apply low contrast styles to simulate what users with low vision might see
    const tabs = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__tab')
    const panels = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__panel')
    const daqiSegments =
      this.daqiTabsContainer.querySelectorAll('.daqi-bar-segment')

    // Low contrast simulation - reduce contrast to test readability
    tabs.forEach((tab) => {
      tab.style.backgroundColor = '#e8e8e8'
      tab.style.color = '#666666'
      tab.style.border = '1px solid #cccccc'
      tab.style.opacity = '0.7'

      // Test if focus is still visible in low contrast
      tab.addEventListener('focus', () => {
        tab.style.outline = '2px solid #999999'
        tab.style.backgroundColor = '#f5f5f5'
        tab.style.color = '#333333'
      })

      tab.addEventListener('blur', () => {
        tab.style.outline = 'none'
        tab.style.backgroundColor = '#e8e8e8'
        tab.style.color = '#666666'
      })
    })

    // Low contrast panels
    panels.forEach((panel) => {
      panel.style.backgroundColor = '#f9f9f9'
      panel.style.color = '#555555'
      panel.style.opacity = '0.8'
    })

    // Low contrast DAQI segments - test if colors are still distinguishable
    daqiSegments.forEach((segment) => {
      segment.style.opacity = '0.6'
      segment.style.filter = 'contrast(0.5) brightness(1.2)'

      const numberElement = segment.querySelector('.daqi-number')
      if (numberElement) {
        numberElement.style.color = '#888888'
        numberElement.style.fontWeight = 'normal'
      }
    })

    this.logContrastResults('Low Contrast Simulation Applied', {
      mode: 'Low Contrast Simulation',
      opacity: '0.6-0.8',
      filter: 'contrast(0.5) brightness(1.2)',
      purpose: 'Test readability for users with low vision'
    })
  }

  testColorBlindness() {
    console.log('🌈 Testing Color Blindness Accessibility')
    this.restoreOriginal()

    if (!this.daqiTabsContainer) return

    // Apply color blindness simulation filters
    const daqiSegments =
      this.daqiTabsContainer.querySelectorAll('.daqi-bar-segment')

    // Test different types of color blindness
    const colorBlindnessFilters = {
      protanopia: 'contrast(1) brightness(1) hue-rotate(0deg) saturate(0.8)',
      deuteranopia:
        'contrast(1) brightness(1) hue-rotate(180deg) saturate(0.6)',
      tritanopia: 'contrast(1) brightness(1.1) hue-rotate(90deg) saturate(0.7)',
      monochrome: 'grayscale(1) contrast(1.2)'
    }

    // Apply monochrome filter to test if information is conveyed without color
    this.daqiTabsContainer.style.filter = colorBlindnessFilters.monochrome

    // Add alternative visual indicators for color-blind users
    daqiSegments.forEach((segment, index) => {
      const hasActiveClass =
        segment.classList.contains('daqi-1') ||
        segment.classList.contains('daqi-2') ||
        segment.classList.contains('daqi-3') ||
        segment.classList.contains('daqi-4') ||
        segment.classList.contains('daqi-5') ||
        segment.classList.contains('daqi-6') ||
        segment.classList.contains('daqi-7') ||
        segment.classList.contains('daqi-8') ||
        segment.classList.contains('daqi-9') ||
        segment.classList.contains('daqi-10')

      if (hasActiveClass) {
        // Add pattern/texture for active segments
        segment.style.background = `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          ), ${segment.style.backgroundColor || '#4c2c92'}
        `
        segment.style.border = '3px solid #000000'
        segment.style.fontWeight = 'bold'
      }
    })

    this.logContrastResults('Color Blindness Test Applied', {
      mode: 'Color Blindness Simulation',
      filter: 'Grayscale + Pattern indicators',
      patterns: 'Diagonal stripes for active segments',
      borders: 'Enhanced borders for distinction'
    })
  }

  testFocusIndicators() {
    console.log('⭐ Testing Keyboard Focus Indicators')

    if (!this.daqiTabsContainer) return

    const focusableElements = this.daqiTabsContainer.querySelectorAll(
      'a, button, [tabindex]'
    )

    console.log(`Found ${focusableElements.length} focusable elements`)

    // Test each focusable element
    focusableElements.forEach((element, index) => {
      setTimeout(() => {
        element.focus()

        // Add enhanced focus indicator for testing
        element.style.outline = '4px solid #ffbf47'
        element.style.outlineOffset = '2px'
        element.style.boxShadow = '0 0 8px rgba(255, 191, 71, 0.6)'

        console.log(
          `🎯 Focused element ${index + 1}: ${element.tagName} - "${element.textContent?.trim() || element.getAttribute('aria-label') || 'No text'}"`
        )

        // Check if the element is visible and has sufficient contrast
        const rect = element.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0
        console.log(
          `   Visible: ${isVisible}, Size: ${rect.width}x${rect.height}`
        )
      }, index * 1000) // 1 second delay between focuses
    })

    this.logContrastResults('Focus Indicator Test', {
      mode: 'Focus Testing',
      elements: focusableElements.length,
      indicator: '4px orange outline with shadow',
      sequence: 'Auto-focusing each element with 1s delay'
    })
  }

  analyzeContrast() {
    console.log('📊 Analyzing Current Contrast Ratios')

    if (!this.daqiTabsContainer) return

    const tabs = this.daqiTabsContainer.querySelectorAll('.govuk-tabs__tab')
    const daqiSegments =
      this.daqiTabsContainer.querySelectorAll('.daqi-bar-segment')
    const contrastResults = []

    // Analyze tab contrast
    tabs.forEach((tab, index) => {
      const computedStyle = window.getComputedStyle(tab)
      const bgColor = computedStyle.backgroundColor
      const textColor = computedStyle.color

      const result = {
        element: `Tab ${index + 1}: "${tab.textContent?.trim()}"`,
        background: bgColor,
        foreground: textColor,
        recommendation: this.getContrastRecommendation(bgColor, textColor)
      }

      contrastResults.push(result)
      console.log(`🔍 ${result.element}`)
      console.log(`   Background: ${result.background}`)
      console.log(`   Foreground: ${result.foreground}`)
      console.log(`   ${result.recommendation}`)
    })

    // Analyze DAQI segment contrast with level-specific information
    daqiSegments.forEach((segment, index) => {
      const computedStyle = window.getComputedStyle(segment)
      const bgColor = computedStyle.backgroundColor
      const textColor = computedStyle.color
      const numberElement = segment.querySelector('.daqi-number')
      const number = numberElement
        ? numberElement.textContent.trim()
        : `${index + 1}`
      const daqiLevel = this.getDaqiLevelFromSegment(segment)
      const colorInfo = this.getDaqiColorInfo(daqiLevel)
      const bandInfo = this.getDaqiBandInfo(daqiLevel)

      const result = {
        element: `DAQI ${number}${daqiLevel > 0 ? ` (Level ${daqiLevel})` : ''}`,
        background: bgColor,
        foreground: textColor,
        daqiLevel,
        daqiBand: bandInfo.band,
        daqiColor: bandInfo.color,
        expectedColors: colorInfo
          ? {
              background: colorInfo.bg,
              text: colorInfo.text
            }
          : null,
        recommendation: this.getContrastRecommendation(bgColor, textColor),
        colorAccuracy: colorInfo
          ? this.checkColorAccuracy(bgColor, textColor, colorInfo)
          : 'N/A'
      }

      contrastResults.push(result)

      // Log detailed DAQI analysis
      if (daqiLevel > 0) {
        console.log(`🔍 DAQI ${daqiLevel} Analysis:`, {
          band: bandInfo.band,
          expectedBg: colorInfo?.bg,
          actualBg: bgColor,
          expectedText: colorInfo?.text,
          actualText: textColor,
          colorMatch: result.colorAccuracy
        })
      }
    })

    this.logContrastResults('Contrast Analysis Complete', {
      totalElements: contrastResults.length,
      results: contrastResults.slice(0, 5), // Show first 5 results
      note: 'Check console for full analysis'
    })

    return contrastResults
  }

  getContrastRecommendation(bgColor, textColor) {
    // Simple heuristic - in a real implementation you'd calculate actual contrast ratio
    const bgLightness = this.getColorLightness(bgColor)
    const textLightness = this.getColorLightness(textColor)
    const contrastDiff = Math.abs(bgLightness - textLightness)

    if (contrastDiff > 0.7) {
      return '✅ Good contrast (estimated > 4.5:1)'
    } else if (contrastDiff > 0.4) {
      return '⚠️ Moderate contrast (may not meet AA standards)'
    } else {
      return '❌ Poor contrast (likely fails accessibility standards)'
    }
  }

  getColorLightness(colorString) {
    // Simple lightness calculation from RGB values
    if (colorString.includes('rgb')) {
      const matches = colorString.match(/\d{1,3}/g) // RGB values are 0-255, bounded for ReDoS protection
      if (matches && matches.length >= 3) {
        const [r, g, b] = matches.map(Number)
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255
      }
    }
    return 0.5 // Default fallback
  }

  getDaqiLevelFromSegment(segment) {
    // Extract DAQI level from CSS classes
    for (let level = 1; level <= 10; level++) {
      if (segment.classList.contains(`daqi-${level}`)) {
        return level
      }
    }
    return 0 // No active DAQI level
  }

  getDaqiColorInfo(level) {
    return this.daqiColorScheme[level] || null
  }

  getDaqiBandInfo(level) {
    if (level >= 1 && level <= 3) {
      return { band: 'Low', color: 'green', range: '1-3' }
    }
    if (level >= 4 && level <= 6) {
      return { band: 'Moderate', color: 'yellow', range: '4-6' }
    }
    if (level >= 7 && level <= 9) {
      return { band: 'High', color: 'red', range: '7-9' }
    }
    if (level === 10) return { band: 'Very High', color: 'purple', range: '10' }
    return { band: 'Unknown', color: 'grey', range: '0' }
  }

  checkColorAccuracy(actualBg, actualText, expectedColorInfo) {
    // Normalize colors for comparison
    const normalizeBg = this.normalizeColor(actualBg)
    const normalizeText = this.normalizeColor(actualText)
    const expectedBg = this.normalizeColor(expectedColorInfo.bg)
    const expectedText = this.normalizeColor(expectedColorInfo.text)

    const bgMatch = normalizeBg === expectedBg
    const textMatch = normalizeText === expectedText

    if (bgMatch && textMatch) return '✅ Perfect match'
    if (bgMatch) return '⚠️ Background correct, text differs'
    if (textMatch) return '⚠️ Text correct, background differs'
    return '❌ Colors do not match expected DAQI scheme'
  }

  normalizeColor(color) {
    // Convert various color formats to RGB for comparison
    if (color.startsWith('rgb(')) {
      return color.replace(/\s/g, '')
    }
    if (color.startsWith('#')) {
      return this.hexToRgb(color)
    }
    return color
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `rgb(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`
      : hex
  }

  restoreOriginal() {
    console.log('🔄 Restoring Original Styles')

    // Remove any applied filters
    if (this.daqiTabsContainer) {
      this.daqiTabsContainer.style.filter = ''
    }

    // Restore all stored styles
    this.originalStyles.forEach((styles, element) => {
      if (element && element.style) {
        element.style.backgroundColor = styles.backgroundColor
        element.style.color = styles.color
        element.style.borderColor = styles.borderColor
        element.style.boxShadow = styles.boxShadow
        element.style.opacity = styles.opacity
        element.style.filter = styles.filter
        element.style.outline = ''
        element.style.border = ''
        element.style.fontWeight = ''
        element.style.background = ''
        element.style.padding = ''
      }
    })

    this.isHighContrastMode = false
    this.isLowContrastMode = false

    this.logContrastResults('Original Styles Restored', {
      mode: 'Original',
      status: 'All test styles cleared'
    })
  }

  logContrastResults(title, data) {
    console.log(`\n🎨 ${title}`)
    console.log('═'.repeat(50))
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        console.log(`${key}:`)
        Object.entries(value).forEach(([subKey, subValue]) => {
          console.log(`  ${subKey}: ${subValue}`)
        })
      } else {
        console.log(`${key}: ${value}`)
      }
    })

    // Update UI results
    const resultsDiv = document.getElementById('contrast-results')
    if (resultsDiv) {
      resultsDiv.innerHTML = `<strong>${title}</strong><br>${JSON.stringify(
        data,
        null,
        2
      )
        .replace(/[{}",]/g, '')
        .replace(/\n/g, '<br>')}`
    }
  }
}

// Initialize the tester when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.daqiContrastTester = new DaqiContrastTester()
    })
  } else {
    window.daqiContrastTester = new DaqiContrastTester()
  }
}

// Export for module usage
export { DaqiContrastTester }
