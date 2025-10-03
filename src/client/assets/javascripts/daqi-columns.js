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

    // Initialize accessibility features after DAQI columns are set
    setTimeout(() => {
      if (
        window.daqiAccessibility &&
        window.daqiAccessibility.enhanceDaqiBarAccessibility
      ) {
        window.daqiAccessibility.enhanceDaqiBarAccessibility()
      }
    }, 100)
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

      // Re-enhance accessibility after tab change
      setTimeout(() => {
        if (
          window.daqiAccessibility &&
          window.daqiAccessibility.enhanceDaqiBarAccessibility
        ) {
          window.daqiAccessibility.enhanceDaqiBarAccessibility()
        }
      }, 100)
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

  // Add resize listener with debouncing for window resize
  const debouncedResize = debounce(() => {
    if (!window.disableDaqiAutoUpdates) {
      setDaqiColumns()
    }
  }, 150)

  window.addEventListener('resize', debouncedResize)

  // Add ResizeObserver to watch for container size changes (when tabs resize dynamically)
  if (typeof ResizeObserver !== 'undefined') {
    const debouncedContainerResize = debounce(() => {
      if (!window.disableDaqiAutoUpdates) {
        console.log('🔧 DAQI: 🚨 CONTAINER SIZE CHANGED - RECALCULATING! 🚨')
        setDaqiColumns()
      }
    }, 100)

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        console.log('🔧 DAQI: 📏 ResizeObserver detected change:', {
          element: entry.target,
          newWidth: width,
          newHeight: height,
          target: entry.target.className
        })
      }
      debouncedContainerResize()
    })

    // Observe DAQI containers AND their parent tabs containers
    const observeContainers = () => {
      // Observe DAQI containers
      const daqiContainers = document.querySelectorAll('.daqi-numbered')
      console.log(
        '🔧 DAQI: 👀 Setting up ResizeObserver for',
        daqiContainers.length,
        'DAQI containers'
      )
      daqiContainers.forEach((container, index) => {
        resizeObserver.observe(container)
        console.log(
          `🔧 DAQI: 🎯 Now observing DAQI container ${index + 1}:`,
          container
        )
      })

      // Also observe tabs containers that might contain DAQI
      const tabsContainers = document.querySelectorAll('.defra-aq-tabs')
      console.log(
        '🔧 DAQI: 👀 Also observing',
        tabsContainers.length,
        'tabs containers'
      )
      tabsContainers.forEach((tabsContainer, index) => {
        resizeObserver.observe(tabsContainer)
        console.log(
          `🔧 DAQI: 🎯 Now observing tabs container ${index + 1}:`,
          tabsContainer
        )
      })

      // Also observe grid columns that might contain tabs
      const gridColumns = document.querySelectorAll(
        '.govuk-grid-column-full-until-desktop, .govuk-grid-column-two-thirds-from-desktop'
      )
      console.log(
        '🔧 DAQI: 👀 Also observing',
        gridColumns.length,
        'grid columns'
      )
      gridColumns.forEach((gridColumn, index) => {
        if (gridColumn.querySelector('.daqi-numbered')) {
          resizeObserver.observe(gridColumn)
          console.log(
            `🔧 DAQI: 🎯 Now observing grid column ${index + 1}:`,
            gridColumn
          )
        }
      })
    }

    // Observe containers immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeContainers)
    } else {
      observeContainers()
    }

    // Also add a mutation observer to catch dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldReobserve = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === 1 &&
              (node.classList?.contains('daqi-numbered') ||
                node.classList?.contains('defra-aq-tabs') ||
                node.querySelector?.('.daqi-numbered'))
            ) {
              shouldReobserve = true
            }
          })
        }
      })
      if (shouldReobserve) {
        console.log('🔧 DAQI: 🔄 Re-setting up observers due to DOM changes')
        observeContainers()
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  } else {
    console.warn('🔧 DAQI: ⚠️ ResizeObserver not supported in this browser')
  }
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

    // Responsive behaviour: Use container width instead of viewport width
    // to ensure dynamic behavior when tabs container shrinks on any viewport size
    const containerWidth = findAvailableWidth(container)
    const viewportWidth =
      (typeof window !== 'undefined' && window.innerWidth) ||
      document.documentElement.clientWidth

    console.log('🔧 DAQI: 📊 RESPONSIVE ANALYSIS:', {
      containerWidth,
      viewportWidth,
      containerElement: container,
      containerClientWidth: container.clientWidth,
      containerBoundingRect: container.getBoundingClientRect().width
    })

    // Define thresholds based on container width for dynamic responsive behavior
    const NARROW_CONTAINER_THRESHOLD = 500 // Below this container width: apply mobile-style layout
    const MEDIUM_CONTAINER_THRESHOLD = 640 // Container width where adjustments start

    // Use container width to determine layout instead of viewport width
    const containerIsNarrow = containerWidth <= NARROW_CONTAINER_THRESHOLD
    const containerNeedsAdjustments =
      containerWidth <= MEDIUM_CONTAINER_THRESHOLD

    console.log('🔧 DAQI: 🎯 RESPONSIVE STATE:', {
      containerWidth,
      containerIsNarrow,
      containerNeedsAdjustments,
      thresholds: {
        narrow: NARROW_CONTAINER_THRESHOLD,
        medium: MEDIUM_CONTAINER_THRESHOLD
      },
      willApplyAdjustments: containerNeedsAdjustments ? 'YES' : 'NO'
    })

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

    // Debug container-based detection
    console.log('🔧 DAQI Debug - Container Width:', containerWidth)
    console.log(
      '🔧 DAQI: Applying container-based responsive layout:',
      containerNeedsAdjustments,
      `(${containerWidth}px ≤ ${MEDIUM_CONTAINER_THRESHOLD}px)`
    )

    // Universal divider calculation approach - works for all layouts
    // Let CSS handle the responsive layout, JavaScript only positions dividers
    const calculateDividers = (
      containerWidthParam,
      containerNeedsAdjustmentsParam
    ) => {
      // Use responsive gap based on container width to match CSS
      let GAP
      if (containerWidthParam <= 360) {
        GAP = 1 // 1px gap for very narrow containers
      } else if (containerWidthParam <= 430) {
        GAP = 2 // 2px gap for narrow containers
      } else {
        GAP = 3 // 3px gap for wider containers
      }

      const segmentWidths = Array.from(segments).map((seg, index) => {
        const rect = seg.getBoundingClientRect()
        // Use more precise rounding to handle sub-pixel measurements better
        const preciseWidth = rect.width
        const width = Math.round(preciseWidth)

        // Special debugging for iPad Mini
        if (viewportWidth === 768) {
          console.log(`🍎 DAQI: iPad Mini - Segment ${index + 1} width:`, {
            element: seg,
            rectWidth: preciseWidth,
            roundedWidth: width,
            clientWidth: seg.clientWidth,
            offsetWidth: seg.offsetWidth,
            subPixelDifference: Math.abs(preciseWidth - width),
            potentialSubPixelIssue: Math.abs(preciseWidth - width) > 0.1
          })
        }

        // Fallback calculation if getBoundingClientRect returns invalid values
        if (width <= 0 || width > container.clientWidth) {
          const innerContainerWidth =
            container.clientWidth || findAvailableWidth(container)
          const cellIndex = Array.from(segments).indexOf(seg)

          // Assume reasonably distributed widths based on container
          if (cellIndex === 9) {
            // Cell 10 (last cell)
            const fallbackWidth = Math.round(innerContainerWidth * 0.2) // ~20% for last cell
            if (viewportWidth === 768) {
              console.warn(
                `🍎 DAQI: iPad Mini - Using fallback width for segment ${cellIndex + 1}:`,
                fallbackWidth
              )
            }
            return fallbackWidth
          } else {
            // Cells 1-9
            const fallbackWidth = Math.round(innerContainerWidth * 0.08) // ~8% each for first 9 cells
            if (viewportWidth === 768) {
              console.warn(
                `🍎 DAQI: iPad Mini - Using fallback width for segment ${cellIndex + 1}:`,
                fallbackWidth
              )
            }
            return fallbackWidth
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

      // Apply responsive adjustments based on container width
      // Move dividers for better positioning when container is narrow
      let divider1Adjustment, divider2Adjustment, divider3Adjustment

      if (containerNeedsAdjustmentsParam) {
        // Container is narrow - apply responsive adjustments
        if (containerWidthParam <= 430) {
          // Very narrow container: apply mobile-style adjustments
          if (viewportWidth === 430) {
            // iPhone 14 Pro Max specific: move dividers right
            divider1Adjustment = 1 // Move 1px right
            divider2Adjustment = 2 // Move 2px right
            divider3Adjustment = 3 // Move 3px right
          } else {
            // Other narrow containers: move dividers left for better alignment
            divider1Adjustment = -1 // Move 1px left
            divider2Adjustment = -1 // Move 1px left
            divider3Adjustment = -2 // Move 2px left
          }
        } else {
          // Medium narrow container: apply moderate adjustments
          divider1Adjustment = 0 // No adjustment
          divider2Adjustment = -1 // Move 1px left
          divider3Adjustment = -1 // Move 1px left
        }
      } else {
        // Wide container: no adjustments needed
        divider1Adjustment = 0
        divider2Adjustment = 0
        divider3Adjustment = 0

        // Special handling for iPad Mini (768px viewport) if dividers seem problematic
        if (viewportWidth === 768) {
          // Ensure all base positions are valid before applying
          if (baseDividerPositions.some((pos) => pos <= 0 || isNaN(pos))) {
            console.warn(
              '🍎 DAQI: iPad Mini - Invalid base positions detected, recalculating...'
            )
            // Force recalculation with fallback values
            const innerContainerWidth =
              container.clientWidth || findAvailableWidth(container)
            baseDividerPositions[0] = Math.round(innerContainerWidth * 0.24) // ~24% for first 3 segments
            baseDividerPositions[1] = Math.round(innerContainerWidth * 0.48) // ~48% for first 6 segments
            baseDividerPositions[2] = Math.round(innerContainerWidth * 0.72) // ~72% for first 9 segments
          }
        }
      }

      const divider1Value =
        Math.round(baseDividerPositions[0]) + divider1Adjustment + 'px'
      const divider2Value =
        Math.round(baseDividerPositions[1]) + divider2Adjustment + 'px'
      const divider3Value =
        Math.round(baseDividerPositions[2]) + divider3Adjustment + 'px'

      // Special handling for zoom-related sub-pixel issues
      if (viewportWidth === 768) {
        const rawDivider2 = baseDividerPositions[1] + divider2Adjustment
        console.log('🔍 DAQI: iPad Mini - Sub-pixel analysis for divider 2:', {
          rawPosition: baseDividerPositions[1],
          adjustment: divider2Adjustment,
          rawFinal: rawDivider2,
          roundedFinal: Math.round(rawDivider2),
          fractionalPart: rawDivider2 % 1,
          potentialSubPixelIssue: rawDivider2 % 1 !== 0
        })
      }

      // Debug: Check for iPad Mini issues (768px viewport)
      if (viewportWidth === 768) {
        // Get zoom level information
        const zoomLevel = window.devicePixelRatio || 1
        const visualViewport = window.visualViewport
        const zoomFactor = visualViewport ? visualViewport.scale : 1

        console.log('🍎 DAQI: iPad Mini Debug - Zoom Analysis:', {
          viewport: viewportWidth + 'px',
          devicePixelRatio: zoomLevel,
          visualViewportScale: zoomFactor,
          containerWidth: container.clientWidth,
          containerClientRect: container.getBoundingClientRect(),
          detectedZoomIssue: zoomFactor !== 1 || zoomLevel !== 1
        })

        console.log('🍎 DAQI: iPad Mini Debug - Full Analysis:', {
          viewport: viewportWidth + 'px',
          containerWidth: container.clientWidth,
          segmentCount: segments.length,
          segmentWidths: segmentWidths,
          GAP: GAP,
          baseDividerPositions: baseDividerPositions,
          dividerDetails: {
            divider1: {
              position: 'after segment 3',
              segments: segmentWidths.slice(0, 3),
              sum: segmentWidths.slice(0, 3).reduce((s, v) => s + v, 0),
              gaps: GAP * 2,
              basePosition: baseDividerPositions[0]
            },
            divider2: {
              position: 'after segment 6 (between cells 6 and 7)',
              segments: segmentWidths.slice(0, 6),
              sum: segmentWidths.slice(0, 6).reduce((s, v) => s + v, 0),
              gaps: GAP * 5,
              basePosition: baseDividerPositions[1],
              subPixelWarning:
                baseDividerPositions[1] % 1 !== 0
                  ? 'FRACTIONAL POSITION DETECTED'
                  : 'integer position'
            },
            divider3: {
              position: 'after segment 9',
              segments: segmentWidths.slice(0, 9),
              sum: segmentWidths.slice(0, 9).reduce((s, v) => s + v, 0),
              gaps: GAP * 8,
              basePosition: baseDividerPositions[2]
            }
          }
        })

        // Log current CSS custom properties before setting new ones
        const currentDivider2 =
          container.style.getPropertyValue('--daqi-divider-2')
        console.log(
          '🍎 Current --daqi-divider-2 before update:',
          currentDivider2 || 'not set'
        )
      }

      // Ensure all divider values are valid (not 0, negative, or NaN)
      // Also handle sub-pixel rendering issues that can occur at different zoom levels
      const validateDividerValue = (
        value,
        fallback,
        name,
        isZoomProblematic = false
      ) => {
        const numValue = parseInt(value)
        if (isNaN(numValue) || numValue <= 0) {
          console.warn(
            `🚨 DAQI: Invalid ${name} value: ${value}, using fallback: ${fallback}px`
          )
          return fallback + 'px'
        }

        // Special handling for zoom-related sub-pixel issues
        // Add a small offset to ensure visibility at different zoom levels
        let finalValue = Math.round(numValue)

        if (isZoomProblematic && name === 'divider2') {
          // For problematic zoom levels, add a 1px safety margin to divider 2
          finalValue = finalValue + 1
          console.log(
            `🔧 DAQI: Zoom-safe adjustment for ${name}: ${numValue}px → ${finalValue}px (+1px safety margin)`
          )
        } else if (Math.abs(numValue - finalValue) > 0.5) {
          console.warn(
            `🔍 DAQI: Sub-pixel rounding for ${name}: ${numValue}px → ${finalValue}px`
          )
        }

        return finalValue + 'px'
      }

      const containerWidth =
        container.clientWidth || findAvailableWidth(container)

      // Detect zoom-related issues that might affect divider visibility
      const zoomLevel = window.devicePixelRatio || 1
      const visualViewport = window.visualViewport
      const zoomFactor = visualViewport ? visualViewport.scale : 1
      const isZoomProblematic = zoomFactor < 1 || zoomLevel !== 1 // Any zoom other than 100%

      if (viewportWidth === 768 && isZoomProblematic) {
        console.log(
          '🚨 DAQI: Zoom issue detected - applying safety margins for divider visibility'
        )
      }

      const validDivider1 = validateDividerValue(
        divider1Value,
        Math.round(containerWidth * 0.24),
        'divider1',
        isZoomProblematic
      )
      const validDivider2 = validateDividerValue(
        divider2Value,
        Math.round(containerWidth * 0.48),
        'divider2',
        isZoomProblematic
      )
      const validDivider3 = validateDividerValue(
        divider3Value,
        Math.round(containerWidth * 0.72),
        'divider3',
        isZoomProblematic
      )

      container.style.setProperty('--daqi-divider-1', validDivider1)
      container.style.setProperty('--daqi-divider-2', validDivider2)
      container.style.setProperty('--daqi-divider-3', validDivider3)

      // Additional iPad Mini debugging after setting properties
      if (viewportWidth === 768) {
        console.log('🍎 DAQI: iPad Mini - CSS Properties Set:', {
          setDivider1: validDivider1,
          setDivider2: validDivider2,
          setDivider3: validDivider3
        })

        // Verify the properties were actually set by reading them back
        setTimeout(() => {
          const verifyDivider1 =
            container.style.getPropertyValue('--daqi-divider-1')
          const verifyDivider2 =
            container.style.getPropertyValue('--daqi-divider-2')
          const verifyDivider3 =
            container.style.getPropertyValue('--daqi-divider-3')

          console.log('🍎 DAQI: iPad Mini - Verification (after 50ms):', {
            actualDivider1: verifyDivider1 || 'NOT SET',
            actualDivider2: verifyDivider2 || 'NOT SET',
            actualDivider3: verifyDivider3 || 'NOT SET'
          })

          // Check if divider 2 is missing or invalid
          if (
            !verifyDivider2 ||
            verifyDivider2 === '0px' ||
            parseInt(verifyDivider2) <= 0
          ) {
            console.error(
              '🚨 DAQI: iPad Mini - Divider 2 is missing or invalid!'
            )
            // Force set a reasonable fallback
            const fallbackPosition =
              Math.round(container.clientWidth * 0.48) + 'px'
            container.style.setProperty('--daqi-divider-2', fallbackPosition)
            console.log(
              '🚨 DAQI: iPad Mini - Applied emergency fallback for divider 2:',
              fallbackPosition
            )
          }

          // Additional fix for zoom issues: Force browser to use hardware acceleration
          // This can help with sub-pixel rendering consistency
          if (isZoomProblematic) {
            const labelsElement = container.querySelector('.daqi-labels')
            if (labelsElement) {
              labelsElement.style.transform = 'translateZ(0)' // Force hardware acceleration
              labelsElement.style.backfaceVisibility = 'hidden' // Optimize rendering
              console.log(
                '🔧 DAQI: Applied hardware acceleration for zoom stability'
              )

              // Also add a zoom-issue class for CSS-based fixes
              container.classList.add('daqi-zoom-fix')
              console.log(
                '🔧 DAQI: Added daqi-zoom-fix class for CSS-based solutions'
              )
            }
          }
        }, 50)
      }

      // Clear --daqi-columns for mobile viewports (≤640px), maintain for desktop
      if (containerNeedsAdjustmentsParam) {
        container.style.removeProperty('--daqi-columns') // Clear for mobile flexbox layout

        if (viewportWidth === 430) {
          console.log(
            '📱 DAQI: iPhone 14 Pro Max adjustments applied (right positioning):',
            {
              viewport: viewportWidth + 'px',
              basePositions: baseDividerPositions.map(
                (p) => Math.round(p) + 'px'
              ),
              adjustments: [
                '+' + divider1Adjustment,
                '+' + divider2Adjustment,
                '+' + divider3Adjustment
              ],
              adjustedPositions: {
                divider1: validDivider1,
                divider2: validDivider2,
                divider3: validDivider3
              }
            }
          )
        } else {
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
              adjustedPositions: {
                divider1: validDivider1,
                divider2: validDivider2,
                divider3: validDivider3
              }
            }
          )
        }
      } else {
        console.log('🎯 DAQI: Desktop layout maintained:', {
          viewport: viewportWidth + 'px',
          finalPositions: {
            divider1: validDivider1,
            divider2: validDivider2,
            divider3: validDivider3
          }
        })
      }
    }

    // Execute divider calculation
    calculateDividers(containerWidth, containerNeedsAdjustments)

    // Also apply with a small delay to handle any timing issues
    setTimeout(
      () => calculateDividers(containerWidth, containerNeedsAdjustments),
      16
    )
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
