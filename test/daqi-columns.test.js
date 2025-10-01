import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Import the module under test
import daqiColumnsModule from '../src/client/assets/javascripts/daqi-columns.js'

describe('daqi-columns module', () => {
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

    // Create 10 segments with explicit widths via inline style
    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('div')
      seg.className = 'daqi-bar-segment'
      // give each a width; last one wider
      seg.style.width = i === 9 ? '100px' : '50px'
      // append a child to mimic structure
      const num = document.createElement('span')
      num.className = 'daqi-number'
      seg.appendChild(num)
      bar.appendChild(seg)
    }

    container.appendChild(bar)
    panel.appendChild(container)
    document.body.appendChild(panel)
    // Mock getComputedStyle for tab panels so only the first is visible
    window.getComputedStyle = (el) => {
      if (el.classList && el.classList.contains('govuk-tabs__panel')) {
        // Only the first panel is visible
        const panels = document.querySelectorAll('.govuk-tabs__panel')
        if (panels.length && el === panels[0]) {
          return { display: 'block', visibility: 'visible' }
        }
        return { display: 'none', visibility: 'visible' }
      }
      return { display: 'block', visibility: 'visible' }
    }
    // Mock clientWidth for container
    Object.defineProperty(container, 'clientWidth', {
      value: 550,
      configurable: true
    })
  })

  it('sets --daqi-columns CSS variable based on segment widths for large tablet viewports', () => {
    // Mock viewport width to be large tablet (768-1020px) so CSS variables get set
    Object.defineProperty(window, 'innerWidth', {
      value: 900, // Between TABLET_LARGE_THRESHOLD (768) and DESKTOP_THRESHOLD (1020)
      configurable: true
    })

    // Create labels container to avoid fallback to segment width
    const labels = document.createElement('div')
    labels.className = 'daqi-labels'
    for (let i = 0; i < 10; i++) {
      const band = document.createElement('div')
      band.className = 'daqi-band'
      labels.appendChild(band)
    }
    container.appendChild(labels)

    // Mock getBoundingClientRect for segments
    const segments = document.querySelectorAll('.daqi-bar-segment')
    segments.forEach((seg, i) => {
      seg.getBoundingClientRect = () => ({ width: i === 9 ? 100 : 50 })
    })

    // Also mock getBoundingClientRect for last label if present
    const lastLabel = document.querySelector(
      '.daqi-labels .daqi-band:last-child'
    )
    if (lastLabel) {
      lastLabel.getBoundingClientRect = () => ({ width: 100 })
    }

    // Call the function under test
    daqiColumnsModule.setDaqiColumns()

    const cssValue = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-columns')
    expect(cssValue).toBe('45px 44px 43px 44px 43px 43px 44px 43px 43px 131px')
  })

  it('removes CSS variables for mobile viewports below 640px', () => {
    // Mock viewport width to be mobile (<640px) so CSS variables get removed
    Object.defineProperty(window, 'innerWidth', {
      value: 500, // Below TABLET_SMALL_THRESHOLD (640)
      configurable: true
    })

    // Set initial CSS variables to test removal
    container.style.setProperty('--daqi-columns', 'test-value')
    container.style.setProperty('--daqi-divider-1', '100px')

    // Call the function under test
    daqiColumnsModule.setDaqiColumns()

    const cssValue = container.style.getPropertyValue('--daqi-columns')
    const divider1 = container.style.getPropertyValue('--daqi-divider-1')
    expect(cssValue).toBe('')
    expect(divider1).toBe('')
  })

  it('calculates divider positions for desktop viewports', () => {
    // Mock viewport width to be desktop (>1020px) so dividers get calculated
    Object.defineProperty(window, 'innerWidth', {
      value: 1200, // Above DESKTOP_THRESHOLD (1020)
      configurable: true
    })

    // Mock getBoundingClientRect for segments  
    const segments = document.querySelectorAll('.daqi-bar-segment')
    segments.forEach((seg, i) => {
      seg.getBoundingClientRect = () => ({ width: i === 9 ? 100 : 51 })
    })

    // Call the function under test
    daqiColumnsModule.setDaqiColumns()

    const cssValue = container.style.getPropertyValue('--daqi-columns')
    const divider1 = container.style.getPropertyValue('--daqi-divider-1')
    const divider2 = container.style.getPropertyValue('--daqi-divider-2')
    const divider3 = container.style.getPropertyValue('--daqi-divider-3')
    
    // Desktop should remove columns but set calculated divider positions
    expect(cssValue).toBe('')
    expect(divider1).toBe('159px') // 3 * 51 + 2 * 3px gaps = 159px
    expect(divider2).toBe('321px') // 6 * 51 + 5 * 3px gaps = 321px
    expect(divider3).toBe('483px') // 9 * 51 + 8 * 3px gaps = 483px
  })

  test('should handle small tablet viewport (640-768px) with tighter grouping', async () => {
    // '' Mock viewport width for small tablet (640-768px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 700
    })

    // '' Create mock DOM for testing with proper tab structure
    const panel = document.createElement('div')
    panel.className = 'govuk-tabs__panel'
    
    const container = document.createElement('div')
    container.className = 'daqi-numbered'
    container.innerHTML = `
      <div class="daqi-labels">
        <div class="daqi-band">Very high</div>
      </div>
      <div class="daqi-bar">
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
        <div class="daqi-bar-segment"></div>
      </div>
    `
    
    panel.appendChild(container)
    document.body.appendChild(panel)

    // '' Mock getBoundingClientRect for labels and container
    const lastLabel = container.querySelector('.daqi-labels .daqi-band')
    lastLabel.getBoundingClientRect = () => ({ width: 50 })
    
    container.getBoundingClientRect = () => ({ width: 520 }) // Small tablet container width
    Object.defineProperty(container, 'clientWidth', {
      value: 520,
      configurable: true
    })

    // '' Mock getBoundingClientRect for segments too
    const segments = container.querySelectorAll('.daqi-bar-segment')
    segments.forEach((seg) => {
      seg.getBoundingClientRect = () => ({ width: 50 })
    })

    // '' Mock getComputedStyle to make panel visible
    window.getComputedStyle = (el) => {
      if (el.classList && el.classList.contains('govuk-tabs__panel')) {
        return { display: 'block', visibility: 'visible' }
      }
      return { display: 'block', visibility: 'visible' }
    }

    // '' Call the function
    const daqiColumnsModule = await import('../src/client/assets/javascripts/daqi-columns.js')
    daqiColumnsModule.setDaqiColumns()

    // '' Verify CSS custom properties are set for small tablet
    expect(container.style.getPropertyValue('--daqi-columns')).toBeTruthy()
    expect(container.style.getPropertyValue('--daqi-divider-1')).toBeTruthy()
    expect(container.style.getPropertyValue('--daqi-divider-2')).toBeTruthy()
    expect(container.style.getPropertyValue('--daqi-divider-3')).toBeTruthy()

    // '' Clean up
    document.body.removeChild(panel)
  })
})
