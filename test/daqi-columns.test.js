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

  it('sets --daqi-columns CSS variable based on segment widths', () => {
    // Ensure getBoundingClientRect works under JSDOM by mocking
    const segments = Array.from(document.querySelectorAll('.daqi-bar-segment'))
    // Mock getBoundingClientRect to return the widths we set
    segments.forEach((el) => {
      const width = parseInt(el.style.width, 10)
      el.getBoundingClientRect = () => ({ width })
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
    // Debug output
    console.log('DEBUG --daqi-columns:', cssValue)
    expect(cssValue).toBe('50px 50px 50px 50px 50px 50px 50px 50px 50px 100px')
  })
})
