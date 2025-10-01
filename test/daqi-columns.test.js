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

  it('sets --daqi-columns CSS variable based on segment widths for narrow viewports', () => {
    // Mock viewport width to be narrow (tablet) so CSS variables get set
    Object.defineProperty(window, 'innerWidth', {
      value: 800, // Between MOBILE_THRESHOLD (768) and GROUPING_THRESHOLD (940)
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

  it('removes CSS columns but sets divider positions for desktop viewports (>940px)', () => {
    // Mock viewport width to be desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 1200, // Above GROUPING_THRESHOLD (940)
      configurable: true
    })

    // Set initial CSS variables to verify columns are removed but dividers are set
    container.style.setProperty('--daqi-columns', 'initial value')
    container.style.setProperty('--daqi-divider-1', '100px')
    container.style.setProperty('--daqi-divider-2', '200px')
    container.style.setProperty('--daqi-divider-3', '300px')

    // Create segments
    const segments = document.querySelectorAll('.daqi-bar-segment')
    segments.forEach((seg, i) => {
      seg.getBoundingClientRect = () => ({ width: i === 9 ? 100 : 50 })
    })

    // Call the function under test
    daqiColumnsModule.setDaqiColumns()

    // Verify --daqi-columns is removed (empty string means property was removed)
    expect(container.style.getPropertyValue('--daqi-columns')).toBe('')
    
    // Verify divider CSS variables are set with calculated desktop positions
    expect(container.style.getPropertyValue('--daqi-divider-1')).toBe('156px') // 50*3 + 3*2 = 156
    expect(container.style.getPropertyValue('--daqi-divider-2')).toBe('315px') // 50*6 + 3*5 = 315
    expect(container.style.getPropertyValue('--daqi-divider-3')).toBe('474px') // 50*9 + 3*8 = 474
  })
})
