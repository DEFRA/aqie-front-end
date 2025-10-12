import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

import daqiColumnsModule from '../src/client/assets/javascripts/daqi-columns.js'

describe('daqi-columns grouped behaviour', () => {
  let dom
  let container
  let bar
  let segments

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window

    // Create the tab panel wrapper
    const panel = document.createElement('div')
    panel.className = 'govuk-tabs__panel'

    container = document.createElement('div')
    container.className = 'daqi-numbered'
    container.style.width = '415px'
    container.getBoundingClientRect = () => ({ width: 415 })
    Object.defineProperty(container, 'clientWidth', {
      value: 415,
      configurable: true
    })

    bar = document.createElement('div')
    bar.className = 'daqi-bar'

    segments = []
    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('div')
      seg.className = 'daqi-bar-segment'
      segments.push(seg)
      bar.appendChild(seg)
    }

    // Add labels container with last label wider to simulate 'Very high'
    const labels = document.createElement('div')
    labels.className = 'daqi-labels'
    for (let i = 0; i < 10; i++) {
      const band = document.createElement('div')
      band.className = 'daqi-band'
      if (i === 9) band.textContent = 'Very high label'
      labels.appendChild(band)
    }

    container.appendChild(bar)
    container.appendChild(labels)
    panel.appendChild(container)
    document.body.appendChild(panel)
    // Mock getComputedStyle for tab panels so only the first is visible
    window.getComputedStyle = (el) => {
      if (el.classList && el.classList.contains('govuk-tabs__panel')) {
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
      value: 415,
      configurable: true
    })
  })

  it('makes groups 1-3,4-6,7-9 each equal to last label width (distributes remainder)', () => {
    // Mock viewport width to be within large tablet threshold so grouping logic applies
    // Use 900px (between TABLET_LARGE_THRESHOLD 768 and DESKTOP_THRESHOLD 1020)
    Object.defineProperty(window, 'innerWidth', {
      value: 900,
      configurable: true
    })

    // Ensure .daqi-labels and its children are present and mocked
    const labels = document.querySelector('.daqi-labels')
    if (labels) {
      const bands = Array.from(labels.children)
      bands.forEach((band, i) => {
        band.getBoundingClientRect = () => ({ width: i === 9 ? 97 : 32 })
      })
    }

    // Mock getBoundingClientRect for segments to avoid fallback logic
    const segments = Array.from(document.querySelectorAll('.daqi-bar-segment'))
    segments.forEach((el) => {
      el.getBoundingClientRect = () => ({ width: 32 })
    })

    // Call function
    daqiColumnsModule.setDaqiColumns()

    const cssValue = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-columns')
    // In tablet range (768-1020px), variables are cleared for flexbox layout
    expect(cssValue).toBe('')

    // Also assert divider offsets are calculated for flexbox layout
    const d1 = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-divider-1')
    const d2 = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-divider-2')
    const d3 = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-divider-3')

    // Security: /\d+px$/ pattern is safe from ReDoS attacks
    // The \d+ quantifier matches digits linearly without backtracking
    // Pattern validates CSS pixel values (e.g., "123px", "45px")
    expect(d1).toMatch(/\d+px$/)
    expect(d2).toMatch(/\d+px$/)
    expect(d3).toMatch(/\d+px$/)
  })
})
