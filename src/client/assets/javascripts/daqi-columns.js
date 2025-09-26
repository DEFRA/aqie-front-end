''
// Only register DOM event listeners if running in a browser
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Always recalculate when the tab is shown (including tab 1)
  document.addEventListener('DOMContentLoaded', () => {
    setDaqiColumns()
    setTimeout(setDaqiColumns, 0)
  })
  // Listen for tab switches and force recalculation
  document.addEventListener('click', (e) => {
    if (
      e.target &&
      e.target.classList &&
      e.target.classList.contains('govuk-tabs__tab')
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

  // threshold in px for applying grouped sizing (covers mobile + tablet)
  const GROUPING_THRESHOLD = 940

  // Only apply grouping when viewport is narrow and we have a non-zero width
  // measured (avoid JSDOM 0-width) and the expected 10 segments exist.
  if (
    viewportWidth > 0 &&
    viewportWidth <= GROUPING_THRESHOLD &&
    segments.length === 10
  ) {
    // try to measure the last label under the bar first
    let lastLabel = container.querySelector(
      '.daqi-labels .daqi-band:last-child'
    )
    let groupWidth = 0

    if (lastLabel) {
      const lr = lastLabel.getBoundingClientRect()
      groupWidth = Math.round(lr.width)
    }

    // fallback to the last segment width if label not present or too small
    if (!groupWidth || groupWidth < 20) {
      const lastSegRect = segments[9].getBoundingClientRect()
      groupWidth = Math.round(lastSegRect.width)
    }

    // enforce reasonable minimums to avoid collapsing
    groupWidth = Math.max(groupWidth, 36)

    // compute per-segment widths for the first 9 segments so that each
    // group of 3 sums exactly to the measured `groupWidth`. This avoids
    // rounding drift and ensures groups 1-3, 4-6 and 7-9 equal the width
    // of the 'Very high' label (cell 10). Distribute any remainder
    // across the first segments in each group for visual balance.
    const base = Math.floor(groupWidth / 3)
    const remainder = groupWidth - base * 3 // 0..2

    // build one group's segments e.g. [base+1, base+1, base] when remainder=2
    const oneGroup = []
    for (let i = 0; i < 3; i++) {
      oneGroup.push(base + (i < remainder ? 1 : 0))
    }

    // replicate the group 3 times to make nine segment widths
    const cols = [].concat(oneGroup, oneGroup, oneGroup)

    // build css value: nine per-segment widths and last large one
    const firstNineRaw = cols.slice(0, 9)
    const lastRaw = groupWidth

    // compute raw total width including gaps so we can scale to the container
    const GAP = 3
    const rawTotal =
      firstNineRaw.reduce((s, v) => s + v, 0) + lastRaw + GAP * cols.length

    // measure available width and scale columns so the visual bar fills the
    // logical container (usually the tab panel). In some layouts the direct
    // `.daqi-numbered` element can report a very small width (e.g. due to
    // display quirks or nested flex/transform wrappers). Walk up the DOM to
    // find the nearest ancestor with a sensible width and use that so the
    // bar scales in proportion to the tab component.
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

    const availableWidth = findAvailableWidth(container)

    let scaledFirstNine = firstNineRaw.slice()
    let scaledLast = lastRaw

    if (availableWidth > 0 && rawTotal > 0) {
      const scale = availableWidth / rawTotal
      // When scaling, distribute rounding so the sum of scaled widths equals availableWidth minus gaps
      const gapsTotal = GAP * cols.length
      const targetTotalForColumns = Math.max(
        0,
        Math.round(availableWidth - gapsTotal)
      )

      // compute float-scaled values and round, then adjust for rounding drift
      const floatScaled = firstNineRaw
        .concat([lastRaw])
        .map(
          (n) =>
            n *
            (targetTotalForColumns /
              (firstNineRaw.reduce((s, v) => s + v, 0) + lastRaw))
        )
      const rounded = floatScaled.map((v) => Math.max(1, Math.round(v)))
      // fix rounding difference
      let diff = targetTotalForColumns - rounded.reduce((s, v) => s + v, 0)
      let i = 0
      while (diff !== 0) {
        rounded[i % rounded.length] += diff > 0 ? 1 : -1
        diff += diff > 0 ? -1 : 1
        i++
      }

      scaledFirstNine = rounded.slice(0, 9)
      scaledLast = rounded[9]
    }

    const firstNine = scaledFirstNine.map((n) => n + 'px').join(' ')
    const last = scaledLast + 'px'
    const cssValue = firstNine + ' ' + last

    container.style.setProperty('--daqi-columns', cssValue)

    // compute divider offsets after 3,6,9 segments (include gap of 3px between columns)
    const colsScaled = scaledFirstNine.concat([scaledLast])
    const offsets = []
    for (const n of [3, 6, 9]) {
      const sum = colsScaled.slice(0, n).reduce((s, v) => s + v, 0)
      const gaps = GAP * (n - 1)
      offsets.push(sum + gaps)
    }
    container.style.setProperty(
      '--daqi-divider-1',
      Math.round(offsets[0]) + 'px'
    )
    container.style.setProperty(
      '--daqi-divider-2',
      Math.round(offsets[1]) + 'px'
    )
    container.style.setProperty(
      '--daqi-divider-3',
      Math.round(offsets[2]) + 'px'
    )

    return
  }

  // Default behaviour: measure each segment individually
  const cols = Array.from(segments).map((seg) => {
    const rect = seg.getBoundingClientRect()
    return Math.round(rect.width) + 'px'
  })

  let cssValue
  if (cols.length === 10) {
    const firstNine = cols.slice(0, 9).join(' ')
    const last = cols[9]
    cssValue = firstNine + ' ' + last
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
