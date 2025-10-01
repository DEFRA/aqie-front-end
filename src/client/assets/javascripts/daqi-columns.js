''
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
  // Only measure the DAQI bar in the currently visible tab panel
  const panels = document.querySelectorAll('.govuk-tabs__panel')
  let container = null
  for (const panel of panels) {
    if (window.getComputedStyle(panel).display !== 'none') {
      container = panel.querySelector('.daqi-numbered')
      if (container) break
    }
  }
  if (!container) return
  // Always re-measure after a tab switch (when a tab panel becomes visible)
  // (Handled above in DOM event listeners)
  // ...existing code...

  // If the container is hidden (for example when the tab panel is not
  // visible) measurements will be unreliable (zero widths) and we should
  // avoid updating the CSS variables. This prevents layout 'breaks' when
  // switching tabs where observers/fire events may fire while panels are
  // display:none.
  try {
    const cs = window.getComputedStyle(container)
    // Only bail out if the container is explicitly hidden. Avoid checks
    // like `offsetParent` which are unreliable in JSDOM (often null).
    if (cs.display === 'none' || cs.visibility === 'hidden') {
      return
    }
  } catch (e) {
    // In some test environments window may be undefined or getComputedStyle
    // may throw. Fail safe by continuing in that case.
  }

  const segments = container.querySelectorAll('.daqi-bar-segment')
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

  // Define responsive thresholds for different viewport stages
  const DESKTOP_THRESHOLD = 1020  // Above this: desktop grid layout
  const TABLET_LARGE_THRESHOLD = 768  // 768-1020px: large tablet grouping
  const TABLET_SMALL_THRESHOLD = 640  // 640-768px: small tablet grouping
  // Below 640px: mobile flexbox layout

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

  // Stage 1: Small tablet (640-768px) - use flexbox like mobile
  if (
    viewportWidth > 0 &&
    viewportWidth >= TABLET_SMALL_THRESHOLD &&
    viewportWidth < TABLET_LARGE_THRESHOLD &&
    segments.length === 10
  ) {
    // '' Remove grid column CSS variables on small tablets to allow flexbox
    container.style.removeProperty('--daqi-columns')
    container.style.removeProperty('--daqi-divider-1')
    container.style.removeProperty('--daqi-divider-2')
    container.style.removeProperty('--daqi-divider-3')
    return
  }

  // Stage 2: Large tablet (768-1020px) - use flexbox like mobile
  if (
    viewportWidth > 0 &&
    viewportWidth >= TABLET_LARGE_THRESHOLD &&
    viewportWidth < DESKTOP_THRESHOLD &&
    segments.length === 10
  ) {
    // '' Remove grid column CSS variables on large tablets to allow flexbox
    container.style.removeProperty('--daqi-columns')
    container.style.removeProperty('--daqi-divider-1')
    container.style.removeProperty('--daqi-divider-2')
    container.style.removeProperty('--daqi-divider-3')
    return
  }
  
  // '' Mobile case: clear any existing grid columns to let flexbox handle layout
  if (
    viewportWidth > 0 &&
    viewportWidth < TABLET_SMALL_THRESHOLD &&
    segments.length === 10
  ) {
    // '' Remove grid column CSS variables on mobile to allow flexbox
    container.style.removeProperty('--daqi-columns')
    container.style.removeProperty('--daqi-divider-1')
    container.style.removeProperty('--daqi-divider-2')
    container.style.removeProperty('--daqi-divider-3')
    return
  }

  // Default behaviour: restore original desktop layout for wide viewports
  if (viewportWidth >= DESKTOP_THRESHOLD && segments.length === 10) {
    // '' Desktop: use fixed layout - remove CSS columns but set proper divider positions
    container.style.removeProperty('--daqi-columns')
    
    // Calculate desktop divider positions by measuring actual segments
    const GAP = 3
    const segmentWidths = Array.from(segments).map(seg => {
      const rect = seg.getBoundingClientRect()
      return Math.round(rect.width)
    })
    
    // Calculate divider positions after segments 3, 6, and 9
    const dividerPositions = []
    for (const n of [3, 6, 9]) {
      const sum = segmentWidths.slice(0, n).reduce((s, v) => s + v, 0)
      const gaps = GAP * (n - 1)
      dividerPositions.push(sum + gaps)
    }
    
    container.style.setProperty('--daqi-divider-1', Math.round(dividerPositions[0]) + 'px')
    container.style.setProperty('--daqi-divider-2', Math.round(dividerPositions[1]) + 'px')
    container.style.setProperty('--daqi-divider-3', Math.round(dividerPositions[2]) + 'px')
    return
  }

  // Fallback: measure each segment individually for edge cases
  const cols = Array.from(segments).map((seg) => {
    const rect = seg.getBoundingClientRect()
    return Math.round(rect.width) + 'px'
  })

  let cssValue
  if (cols.length === 10) {
    const firstNine = cols.slice(0, 9).join(' ')
    const last = cols[9]
    cssValue = firstNine + ' ' + last

    // Calculate divider positions for individual mode
    // Convert px values back to numbers for calculation
    const colsNumeric = cols.map((col) => parseInt(col.replace('px', ''), 10))
    const GAP = 3 // gap between segments
    const offsets = []

    for (const n of [3, 6, 9]) {
      const sum = colsNumeric.slice(0, n).reduce((s, v) => s + v, 0)
      const gaps = GAP * (n - 1)
      offsets.push(sum + gaps)
    }

    // Set CSS custom properties for divider positions
    container.style.setProperty('--daqi-divider-1', offsets[0] + 'px')
    container.style.setProperty('--daqi-divider-2', offsets[1] + 'px')
    container.style.setProperty('--daqi-divider-3', offsets[2] + 'px')
  } else {
    cssValue = cols.join(' ')
  }

  container.style.setProperty('--daqi-columns', cssValue)
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
