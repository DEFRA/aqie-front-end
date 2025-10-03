''
// DAQI Columns Responsive Layout Handler
//
// Development Mode: To manually test CSS custom properties in dev tools,
// add 'data-manual-dividers' attribute to the .daqi-numbered container:
// Example: document.querySelector('.daqi-numbered').setAttribute('data-manual-dividers', 'true')
// This will disable automatic JavaScript positioning and allow manual CSS testing.
//
// Only register DOM event listeners if running in a browser
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Always recalculate when the tab is shown (including tab 1)
  document.addEventListener('DOMContentLoaded', () => {
    setDaqiColumns()
    setTimeout(setDaqiColumns, 0)
  })
  // Listen for tab switches and force recalculation - only for DAQI tabs
  document.addEventListener('click', (e) => {
    if (
      e.target &&
      e.target.classList &&
      e.target.classList.contains('govuk-tabs__tab') &&
      e.target.closest('.daqi-tabs') // Only apply to DAQI tabs component
    ) {
      setTimeout(setDaqiColumns, 40)
    }
  })

  // Add window global for testing - disable automatic updates
  window.disableDaqiAutoUpdates = false

  // Add debugging and testing utilities
  window.daqiTestDividers = function (d1, d2, d3) {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('No .daqi-numbered container found')
      return
    }
    console.log('🧪 Testing dividers:', { d1, d2, d3 })
    container.style.setProperty('--daqi-divider-1', d1 + 'px')
    container.style.setProperty('--daqi-divider-2', d2 + 'px')
    container.style.setProperty('--daqi-divider-3', d3 + 'px')

    // Force style recalculation
    const labelsElement = container.querySelector('.daqi-labels')
    if (labelsElement) {
      labelsElement.style.display = 'none'
      labelsElement.offsetHeight // Force reflow
      labelsElement.style.display = ''
    }

    console.log('✅ Applied custom properties:', {
      '--daqi-divider-1': container.style.getPropertyValue('--daqi-divider-1'),
      '--daqi-divider-2': container.style.getPropertyValue('--daqi-divider-2'),
      '--daqi-divider-3': container.style.getPropertyValue('--daqi-divider-3')
    })
  }

  window.daqiShowCurrentValues = function () {
    const container = document.querySelector('.daqi-numbered')
    if (!container) {
      console.error('No .daqi-numbered container found')
      return
    }

    const computedStyle = getComputedStyle(container)
    console.log('🔍 Current CSS Custom Properties:', {
      '--daqi-divider-1':
        computedStyle.getPropertyValue('--daqi-divider-1') || 'not set',
      '--daqi-divider-2':
        computedStyle.getPropertyValue('--daqi-divider-2') || 'not set',
      '--daqi-divider-3':
        computedStyle.getPropertyValue('--daqi-divider-3') || 'not set',
      viewport: window.innerWidth + 'px'
    })

    // Also check the pseudo-element's background-position
    const labels = container.querySelector('.daqi-labels')
    if (labels) {
      const beforeStyle = getComputedStyle(labels, '::before')
      console.log(
        '🎨 Computed background-position:',
        beforeStyle.backgroundPosition
      )
    }
  }

  // Add resize listener with debouncing
  const debouncedResize = debounce(() => {
    if (!window.disableDaqiAutoUpdates) {
      setDaqiColumns()
    }
  }, 150)

  window.addEventListener('resize', debouncedResize)
}
// daqi-columns.js
// '' Measure DAQI bar segment widths and set a CSS variable so labels and bar share column sizing

function debounce(fn, wait = 100) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

function setDaqiColumns() {
  // Check if automatic updates are disabled for testing
  if (typeof window !== 'undefined' && window.disableDaqiAutoUpdates) {
    console.log('🚫 DAQI: Automatic updates disabled for manual testing')
    return
  }

  console.log('🔧 DAQI: setDaqiColumns() called')

  // Find all DAQI containers and process each one
  const containers = document.querySelectorAll('.daqi-numbered')
  console.log('🔧 DAQI: Found containers:', containers.length)
  if (!containers || containers.length === 0) return

  containers.forEach((container) => {
    console.log('🔧 DAQI: Processing container:', container)

    // Skip if container is explicitly hidden
    try {
      const cs = window.getComputedStyle(container)
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        console.log('🔧 DAQI: Skipping hidden container')
        return // Skip this container but continue with others
      }
    } catch (e) {
      console.log('🔧 DAQI: Error getting computed style:', e)
      // In some test environments window may be undefined or getComputedStyle
      // may throw. Fail safe by continuing in that case.
    }

    const segments = container.querySelectorAll('.daqi-bar-segment')
    console.log('🔧 DAQI: Found segments:', segments.length)
    if (!segments || segments.length === 0) return

    // Responsive behaviour: when the container is narrow (mobile/tablet),
    // collapse the visual grouping so bands 1-3, 4-6, 7-9 take the same
    // total width as band 10 (the 'Very high' label). Achieve this by
    // measuring the last label and making each of the first 9 segments
    // one-third of that label width.
    // Use viewport width (window.innerWidth) to decide when to apply grouped sizing.
    // Using the viewport ensures grouping is only applied for narrow viewports
    // (mobile/tablet) and avoids triggering grouped layout prematurely when a
    // container may be narrow for other reasons.
    const viewportWidth =
      (typeof window !== 'undefined' && window.innerWidth) ||
      document.documentElement.clientWidth

    console.log('🔧 DAQI: Current viewport width:', viewportWidth)
    console.log('🔧 DAQI: Looking for 768-1019px range specifically...')

    // Define only the range where mobile layout and pixel adjustments are needed
    const MOBILE_THRESHOLD = 640 // Below this: apply mobile layout with pixel adjustments
    const DESKTOP_THRESHOLD = 641 // Above this: maintain desktop cell widths

    // Helper function to find available width
    function findAvailableWidth(el) {
      const MIN_REASONABLE = 40
      let current = el
      for (let i = 0; i < 8 && current; i++) {
        const w =
          current.clientWidth ||
          Math.round(current.getBoundingClientRect().width)
        if (w && w > MIN_REASONABLE) return w
        current = current.parentElement
      }
      // fallback to viewport width
      return (
        (typeof window !== 'undefined' && window.innerWidth) ||
        document.documentElement.clientWidth ||
        0
      )
    }

    // '' Development mode: Add 'data-manual-dividers' attribute to container to disable automatic updates
    if (container.hasAttribute('data-manual-dividers')) {
      console.log(
        'DAQI: Manual divider mode enabled - skipping automatic positioning'
      )
      return
    }

    // Debug viewport detection - only for mobile layout
    console.log('🔧 DAQI Debug - Viewport Width:', viewportWidth)
    const needsAdjustments = viewportWidth <= MOBILE_THRESHOLD
    console.log(
      '🔧 DAQI: Applying mobile layout:',
      needsAdjustments,
      `(${viewportWidth}px ≤ ${MOBILE_THRESHOLD}px)`
    )

    // Skip processing if no segments found
    if (!segments || segments.length === 0) return

    // Universal divider calculation approach - works for all layouts
    // Let CSS handle the responsive layout, JavaScript only positions dividers
    const calculateDividers = () => {
      const GAP = 3 // Standard gap between segments
      const segmentWidths = Array.from(segments).map((seg) => {
        const rect = seg.getBoundingClientRect()
        const width = Math.round(rect.width)

        // Fallback calculation if getBoundingClientRect returns invalid values
        if (width <= 0 || width > container.clientWidth) {
          const containerWidth =
            container.clientWidth || findAvailableWidth(container)
          const cellIndex = Array.from(segments).indexOf(seg)

          // Assume reasonably distributed widths based on container
          if (cellIndex === 9) {
            // Cell 10 (last cell)
            return Math.round(containerWidth * 0.2) // ~20% for last cell
          } else {
            // Cells 1-9
            return Math.round(containerWidth * 0.08) // ~8% each for first 9 cells
          }
        }
        return width
      })

      // Calculate base divider positions after segments 3, 6, and 9
      const baseDividerPositions = []
      for (const n of [3, 6, 9]) {
        const sum = segmentWidths.slice(0, n).reduce((s, v) => s + v, 0)
        const gaps = GAP * (n - 1)
        baseDividerPositions.push(sum + gaps)
      }

      // Apply user's requested adjustments only for mobile viewports (640px and below)
      // Move dividers left for better mobile positioning
      let divider1Adjustment, divider2Adjustment, divider3Adjustment

      if (needsAdjustments) {
        // Mobile viewports: move dividers left for better alignment
        divider1Adjustment = -1 // Move 1px left
        divider2Adjustment = -1 // Move 1px left
        divider3Adjustment = -2 // Move 2px left
      } else {
        // Desktop: no adjustments
        divider1Adjustment = 0
        divider2Adjustment = 0
        divider3Adjustment = 0
      }

      const divider1Value =
        Math.round(baseDividerPositions[0]) + divider1Adjustment + 'px'
      const divider2Value =
        Math.round(baseDividerPositions[1]) + divider2Adjustment + 'px'
      const divider3Value =
        Math.round(baseDividerPositions[2]) + divider3Adjustment + 'px'

      container.style.setProperty('--daqi-divider-1', divider1Value)
      container.style.setProperty('--daqi-divider-2', divider2Value)
      container.style.setProperty('--daqi-divider-3', divider3Value)

      // Clear --daqi-columns for mobile viewports (≤640px), maintain for desktop
      if (needsAdjustments) {
        container.style.removeProperty('--daqi-columns') // Clear for mobile flexbox layout
        console.log(
          '🎯 DAQI: Mobile layout adjustments applied (left positioning):',
          {
            viewport: viewportWidth + 'px',
            basePositions: baseDividerPositions.map(
              (p) => Math.round(p) + 'px'
            ),
            adjustments: [
              divider1Adjustment,
              divider2Adjustment,
              divider3Adjustment
            ],
            adjustedPositions: { divider1Value, divider2Value, divider3Value }
          }
        )
      } else {
        console.log('🎯 DAQI: Desktop layout maintained (no adjustments)')
      }
    }

    // Execute divider calculation
    calculateDividers()

    // Also apply with a small delay to handle any timing issues
    setTimeout(calculateDividers, 16)
  }) // Close the forEach loop
}

const debounced = debounce(setDaqiColumns, 120)

function init() {
  // run after DOMContentLoaded
  // guard against being initialised more than once (e.g. if application
  // initialisation is run again or the module is re-imported). We store
  // a flag on the container element so observers/listeners aren't doubled.
  const container = document.querySelector('.daqi-numbered')
  if (!container) return
  if (container.__daqi_initialized) return
  container.__daqi_initialized = true

  // Recalculate after DOM is ready and all tab content is present
  setDaqiColumns()
  // Schedule another recalculation after all content (including forecast) is rendered
  setTimeout(setDaqiColumns, 0)
  // If MutationObserver is available, watch for changes in tab panel content
  if (typeof MutationObserver !== 'undefined') {
    const panel =
      container.closest('.govuk-tabs__panel') || container.parentElement
    if (panel) {
      const mo = new MutationObserver(() => setTimeout(setDaqiColumns, 0))
      mo.observe(panel, { childList: true, subtree: true })
      container.__daqi_mutation_observer = mo
    }
  }
  // Use ResizeObserver where available for fine-grained updates
  if (typeof ResizeObserver !== 'undefined') {
    const container = document.querySelector('.daqi-numbered')
    if (container) {
      const ro = new ResizeObserver(debounced)
      // Observe the bar and the container in case children change
      const bar = container.querySelector('.daqi-bar')
      if (bar) ro.observe(bar)
      ro.observe(container)
      // keep a reference for potential disconnect (not strictly necessary)
      container.__daqi_resize_observer = ro
      // Also listen for window resize events in addition to ResizeObserver.
      // Some browsers may not dispatch ResizeObserver entries for viewport
      // changes in all cases; having a window resize listener guarantees
      // we recalc when the viewport width crosses the grouping threshold.
      window.addEventListener('resize', debounced)
      // Re-run measurements when the active tab/panel changes via URL hash.
      // We schedule via setTimeout so that other handlers (eg. tabs show/hide)
      // have finished mutating the DOM before measuring.
      window.addEventListener('hashchange', () => setTimeout(debounced, 40))
      // pageshow is fired when a page is restored from bfcache (back/forward).
      // Recompute there as DOM may be restored without a new load event.
      window.addEventListener('pageshow', debounced)
    }
  } else {
    window.addEventListener('resize', debounced)
    window.addEventListener('hashchange', () => setTimeout(debounced, 40))
    window.addEventListener('pageshow', debounced)
  }

  // Also listen for font loading which can change widths
  if (document.fonts) {
    document.fonts.ready.then(() => {
      setDaqiColumns()
      setTimeout(setDaqiColumns, 0)
    })
  }
}

export { setDaqiColumns, debounce }
export default { init, setDaqiColumns }
