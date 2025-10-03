''
// DAQI Accessibility Enhancements
// Enhances DAQI tab component with live region announcements and keyboard navigation improvements

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Initialize accessibility enhancements when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initDAQIAccessibility()
  })

  function initDAQIAccessibility() {
    console.log('🔧 Initializing DAQI accessibility enhancements...')

    // Add live region for screen reader announcements
    addLiveRegion()

    // Enhance tab interactions
    enhanceTabInteractions()

    // Add keyboard navigation improvements
    enhanceKeyboardNavigation()

    console.log('✅ DAQI accessibility enhancements initialized')
  }

  function addLiveRegion() {
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
    const liveRegion = document.getElementById('daqi-live-region')
    if (!liveRegion) return

    const daqiValue = tab.getAttribute('data-daqi-value') || '0'
    const daqiBand = tab.getAttribute('data-daqi-band') || 'unknown level'
    const tabText = tab.textContent.trim()
    const tabIndex = getTabIndex(tab)

    // Create meaningful announcement with index - "number 2 Low"
    const levelText = getDaqiLevelText(parseInt(daqiValue))
    const announcement = `${tabText} selected. Tab ${tabIndex} of ${getTotalTabCount()}. Daily Air Quality Index number ${daqiValue}, ${levelText} pollution level.`

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
    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')

    tabs.forEach((tab, index) => {
      // Add click handler for announcements
      tab.addEventListener('click', (event) => {
        // Delay announcement slightly to allow tab switching to complete
        setTimeout(() => {
          announceTabChange(tab)
        }, 150)
      })

      // Enhance ARIA label with more context including index
      const currentAriaLabel = tab.getAttribute('aria-label')
      if (!currentAriaLabel || currentAriaLabel.length < 10) {
        const daqiValue = tab.getAttribute('data-daqi-value') || '0'
        const daqiBand = tab.getAttribute('data-daqi-band') || 'unknown level'
        const tabText = tab.textContent.trim()
        const levelText = getDaqiLevelText(parseInt(daqiValue))
        const tabIndex = index + 1
        const totalTabs = tabs.length

        const enhancedLabel = `${tabText}, tab ${tabIndex} of ${totalTabs}, DAQI number ${daqiValue}, ${levelText} air pollution`
        tab.setAttribute('aria-label', enhancedLabel)
        tab.setAttribute('title', enhancedLabel)

        // Add position information
        tab.setAttribute('aria-posinset', tabIndex)
        tab.setAttribute('aria-setsize', totalTabs)
      }
    })
  }

  function enhanceKeyboardNavigation() {
    const tabContainer = document.querySelector('.daqi-tabs') // Only target DAQI tabs
    if (!tabContainer) return

    // Add roving tabindex behavior for proper keyboard navigation
    const tabs = tabContainer.querySelectorAll('.govuk-tabs__tab')

    // Set initial tabindex states - only first tab should be tabbable
    tabs.forEach((tab, index) => {
      if (index === 0) {
        tab.setAttribute('tabindex', '0')
      } else {
        tab.setAttribute('tabindex', '-1')
      }
    })

    tabs.forEach((tab, index) => {
      // Handle focus events
      tab.addEventListener('focus', (event) => {
        // Announce current tab when focused
        setTimeout(() => {
          const daqiValue = tab.getAttribute('data-daqi-value') || '0'
          const levelText = getDaqiLevelText(parseInt(daqiValue))
          const tabIndex = index + 1
          const announcement = `Tab ${tabIndex}, DAQI number ${daqiValue}, ${levelText}`

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

        // Update tabindex for roving behavior
        tabs.forEach((t, i) => {
          t.setAttribute('tabindex', i === nextIndex ? '0' : '-1')
        })

        // Move focus to next tab
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
    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
    return Array.from(tabs).indexOf(tab) + 1
  }

  function getTotalTabCount() {
    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
    return tabs.length
  }

  function announceFocus(message) {
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
    const daqiContainers = document.querySelectorAll('.daqi-numbered')

    daqiContainers.forEach((container) => {
      const segments = container.querySelectorAll('.daqi-bar-segment')

      segments.forEach((segment, index) => {
        const segmentNumber = index + 1
        const number = segment.querySelector('.daqi-number')
        const isActive =
          segment.classList.contains('daqi-1') ||
          segment.classList.contains('daqi-2') ||
          segment.classList.contains('daqi-3') ||
          segment.classList.contains('daqi-4') ||
          segment.classList.contains('daqi-5') ||
          segment.classList.contains('daqi-6') ||
          segment.classList.contains('daqi-7') ||
          segment.classList.contains('daqi-8') ||
          segment.classList.contains('daqi-9') ||
          segment.classList.contains('daqi-10')

        // Add ARIA attributes for screen readers
        segment.setAttribute('role', 'img')
        const levelText = getDaqiLevelText(segmentNumber)
        const status = isActive ? 'active' : 'inactive'
        segment.setAttribute(
          'aria-label',
          `DAQI segment ${segmentNumber}, ${levelText} level, ${status}`
        )

        // Make segments focusable for keyboard users who want to explore
        segment.setAttribute('tabindex', '0')

        // Add keyboard support for segments
        segment.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            const announcement = `DAQI number ${segmentNumber}, ${levelText} pollution level, currently ${status}`
            announceFocus(announcement)
          }
        })

        // Add focus handler
        segment.addEventListener('focus', () => {
          const announcement = `DAQI segment ${segmentNumber}, ${levelText}`
          announceFocus(announcement)
        })
      })
    })
  }

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
      initDAQIAccessibility // Export initialization function for tests
    }
  }
}

export default {
  initDAQIAccessibility:
    typeof initDAQIAccessibility !== 'undefined' ? initDAQIAccessibility : null
}
