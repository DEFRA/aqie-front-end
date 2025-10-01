import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

import daqiColumnsModule from '../src/client/assets/javascripts/daqi-columns.js'

describe('daqi-columns ResizeObserver behavior', () => {
  let dom
  let container
  let bar
  let segments
  let resizeCallback

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window

    // Create the tab panel wrapper
    const panel = document.createElement('div')
    panel.className = 'govuk-tabs__panel'

    container = document.createElement('div')
    container.className = 'daqi-numbered'

    bar = document.createElement('div')
    bar.className = 'daqi-bar'

    segments = []
    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('div')
      seg.className = 'daqi-bar-segment'
      seg.style.width = i === 9 ? '100px' : '50px'
      segments.push(seg)
      bar.appendChild(seg)
    }

    container.appendChild(bar)
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
      value: 550,
      configurable: true
    })

    // Mock ResizeObserver
    global.ResizeObserver = class {
      constructor(cb) {
        resizeCallback = cb
        this.observe = () => {}
        this.disconnect = () => {}
      }
    }
  })

  it('responds to ResizeObserver events by updating --daqi-columns', () => {
    // Mock window width for tablet viewport so CSS variables get set
    Object.defineProperty(window, 'innerWidth', {
      value: 800, // Between MOBILE_THRESHOLD (768) and GROUPING_THRESHOLD (940)
      configurable: true
    })

    // Mock getBoundingClientRect for initial widths
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

    // Initialize the module which should attach ResizeObserver
    daqiColumnsModule.init()

    // Simulate a resize event by invoking callback which should call the debounced setter
    // The debounced function uses setTimeout; use a fake timer
    vi.useFakeTimers()
    // call the ResizeObserver callback with an entry list
    resizeCallback()
    // advance timers so debounce runs
    vi.runAllTimers()

    const cssValue = document
      .querySelector('.daqi-numbered')
      .style.getPropertyValue('--daqi-columns')
    expect(cssValue).toBe('45px 44px 43px 44px 43px 43px 44px 43px 43px 131px')

    vi.useRealTimers()
  })
})
