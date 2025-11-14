''
// DAQI Accessibility Enhancements
// Enhances DAQI tab component with live region announcements and keyboard navigation improvements

// Function definitions (available for export)
function addLiveRegion() {
  // Only run in browser environment
  if (typeof document === 'undefined') return null

  // Check if live region already exists
  let liveRegion = document.getElementById('daqi-live-region')

  if (!liveRegion) {
    // Create live region if it doesn't exist
    liveRegion = document.createElement('div')
    liveRegion.id = 'daqi-live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'govuk-visually-hidden'

    // Insert at the beginning of the first DAQI tab panel
    const firstPanel = document.querySelector('.daqi-tabs .govuk-tabs__panel')
    if (firstPanel) {
      firstPanel.insertBefore(liveRegion, firstPanel.firstChild)
    }
  }

  return liveRegion
}

function announceTabChange(tab) {
  if (typeof document === 'undefined') return

  const liveRegion = document.getElementById('daqi-live-region')
  if (!liveRegion) return

  const tabText = tab.textContent.trim()

  // '' Minimal announcement: Just the day name since panel content will be read naturally
  const announcement = `${tabText} tab selected`

  // Clear and set new announcement
  liveRegion.textContent = ''
  setTimeout(() => {
    liveRegion.textContent = announcement
  }, 100)
}

function getDaqiLevelText(value) {
  if (value >= 1 && value <= 3) return 'Low'
  if (value >= 4 && value <= 6) return 'Moderate'
  if (value >= 7 && value <= 9) return 'High'
  if (value === 10) return 'Very high'
  return 'Unknown'
}

function enhanceTabInteractions() {
  if (typeof document === 'undefined') return

  const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')

  tabs.forEach((tab, index) => {
    // Add click handler for announcements
    tab.addEventListener('click', (event) => {
      // Delay announcement slightly to allow tab switching to complete
      setTimeout(() => {
        announceTabChange(tab)
      }, 150)
    })

    // '' Keep tab labels simple - just the day name
    // The DAQI info will be read naturally in the panel content below
    // No need to enhance ARIA labels - natural content order is sufficient
  })
}

function enhanceKeyboardNavigation() {
  if (typeof document === 'undefined') return

  const tabContainer = document.querySelector('.daqi-tabs') // Only target DAQI tabs
  if (!tabContainer) return

  // Get tabs but don't modify tabindex - let VoiceOver handle standard tab navigation
  const tabs = tabContainer.querySelectorAll('.govuk-tabs__tab')

  // Don't set custom tabindex - preserve natural tab order for VoiceOver
  // VoiceOver users can tab through all tabs naturally

  tabs.forEach((tab, index) => {
    // Handle focus events
    tab.addEventListener('focus', (event) => {
      // '' Minimal focus announcement - just the day name
      setTimeout(() => {
        const tabText = tab.textContent.trim()
        const announcement = `${tabText}`

        // Use a temporary live region for focus announcements
        announceFocus(announcement)
      }, 100)
    })

    tab.addEventListener('keydown', (event) => {
      const currentIndex = Array.from(tabs).indexOf(tab)
      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
          break

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
          break

        case 'Home':
          event.preventDefault()
          nextIndex = 0
          break

        case 'End':
          event.preventDefault()
          nextIndex = tabs.length - 1
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          tab.click()
          return

        default:
          return
      }

      // Don't modify tabindex - preserve VoiceOver compatibility
      // Just move focus for arrow key navigation
      const nextTab = tabs[nextIndex]
      if (nextTab) {
        nextTab.focus()
      }
    })
  })

  // Enhance DAQI bar segments accessibility
  enhanceDaqiBarAccessibility()
}

// Utility function to get DAQI color information for announcements
function getDaqiColorInfo(value) {
  const val = parseInt(value)
  if (val >= 1 && val <= 3) return { color: 'green', level: 'Low' }
  if (val >= 4 && val <= 6) return { color: 'yellow', level: 'Moderate' }
  if (val >= 7 && val <= 9) return { color: 'red', level: 'High' }
  if (val === 10) return { color: 'purple', level: 'Very high' }
  return { color: 'grey', level: 'Unknown' }
}

// Helper functions for accessibility
function getTabIndex(tab) {
  if (typeof document === 'undefined') return 0
  const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
  return Array.from(tabs).indexOf(tab) + 1
}

function getActiveDaqiCellInfo(tab) {
  if (typeof document === 'undefined') return null

  // Find the tab panel associated with this tab
  const tabId = tab.getAttribute('href')
  if (!tabId) return null

  const panel = document.querySelector(tabId)
  if (!panel) return null

  // Find the active DAQI cell in this panel
  const daqiBar = panel.querySelector('.daqi-numbered .daqi-bar')
  if (!daqiBar) return null

  // Look for the colored/active segment (not daqi-0)
  const activeSegment = daqiBar.querySelector('.daqi-bar-segment:not(.daqi-0)')
  if (!activeSegment) return null

  // Get the cell number from the segment
  const numberSpan = activeSegment.querySelector('.daqi-number')
  const cellNumber = numberSpan ? numberSpan.textContent.trim() : '0'

  // Get the corresponding label from the daqi-labels
  const labelsContainer = panel.querySelector('.daqi-labels')
  const label = getDaqiLabelForCell(parseInt(cellNumber), labelsContainer)

  return {
    cellNumber: cellNumber,
    label: label
  }
}

function getDaqiLabelForCell(cellNumber, labelsContainer) {
  if (!labelsContainer) return getDaqiLevelText(cellNumber)

  // Map cell numbers to label spans
  if (cellNumber >= 1 && cellNumber <= 3) {
    const lowLabel = labelsContainer.querySelector('.daqi-band-low')
    return lowLabel ? lowLabel.textContent.trim() : 'Low'
  } else if (cellNumber >= 4 && cellNumber <= 6) {
    const moderateLabel = labelsContainer.querySelector('.daqi-band-moderate')
    return moderateLabel ? moderateLabel.textContent.trim() : 'Moderate'
  } else if (cellNumber >= 7 && cellNumber <= 9) {
    const highLabel = labelsContainer.querySelector('.daqi-band-high')
    return highLabel ? highLabel.textContent.trim() : 'High'
  } else if (cellNumber === 10) {
    const veryHighLabel = labelsContainer.querySelector('.daqi-band-very-high')
    return veryHighLabel ? veryHighLabel.textContent.trim() : 'Very High'
  }

  return getDaqiLevelText(cellNumber)
}

function getTotalTabCount() {
  if (typeof document === 'undefined') return 0
  // Return actual number of tabs for navigation context
  const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
  return tabs.length
}

function announceFocus(message) {
  if (typeof document === 'undefined') return

  // Create temporary live region for focus announcements
  let focusRegion = document.getElementById('daqi-focus-region')
  if (!focusRegion) {
    focusRegion = document.createElement('div')
    focusRegion.id = 'daqi-focus-region'
    focusRegion.setAttribute('aria-live', 'assertive')
    focusRegion.setAttribute('aria-atomic', 'true')
    focusRegion.className = 'govuk-visually-hidden'
    document.body.appendChild(focusRegion)
  }

  focusRegion.textContent = ''
  setTimeout(() => {
    focusRegion.textContent = message
  }, 50)
}

function enhanceDaqiBarAccessibility() {
  if (typeof document === 'undefined') return

  const daqiContainers = document.querySelectorAll('.daqi-numbered')

  daqiContainers.forEach((container) => {
    // '' DAQI bar container already has role="img" and aria-label from template
    // Individual segments are decorative and should be hidden from screen readers
    const segments = container.querySelectorAll('.daqi-bar-segment')

    segments.forEach((segment) => {
      // Hide decorative segments from screen readers
      segment.setAttribute('aria-hidden', 'true')
    })
  })
}

// Define the initialization function that can be called from outside
function initDAQIAccessibility() {
  // Only run in browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    console.warn('DAQI accessibility: Browser environment not detected')
    return
  }

  // Add live region for screen reader announcements
  addLiveRegion()

  // Enhance tab interactions
  enhanceTabInteractions()

  // Add keyboard navigation improvements\n  enhanceKeyboardNavigation()\n}
}

// Auto-initialize when DOM is ready (for backward compatibility)
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initDAQIAccessibility()
  })

  // Export for testing
  if (typeof window !== 'undefined') {
    window.daqiAccessibility = {
      announceTabChange,
      getDaqiLevelText,
      getDaqiColorInfo,
      addLiveRegion,
      getTabIndex,
      getTotalTabCount,
      announceFocus,
      enhanceDaqiBarAccessibility,
      getActiveDaqiCellInfo,
      getDaqiLabelForCell,
      initDAQIAccessibility // Export initialization function for tests
    }
  }
}

export default {
  initDAQIAccessibility
}
