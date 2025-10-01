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
    
    // Create meaningful announcement
    const levelText = getDaqiLevelText(parseInt(daqiValue))
    const announcement = `${tabText} selected. Daily Air Quality Index ${daqiValue} out of 10, ${levelText} pollution level.`
    
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
    
    tabs.forEach(tab => {
      // Add click handler for announcements
      tab.addEventListener('click', (event) => {
        // Delay announcement slightly to allow tab switching to complete
        setTimeout(() => {
          announceTabChange(tab)
        }, 150)
      })
      
      // Enhance ARIA label with more context
      const currentAriaLabel = tab.getAttribute('aria-label')
      if (!currentAriaLabel || currentAriaLabel.length < 10) {
        const daqiValue = tab.getAttribute('data-daqi-value') || '0'
        const daqiBand = tab.getAttribute('data-daqi-band') || 'unknown level'
        const tabText = tab.textContent.trim()
        const levelText = getDaqiLevelText(parseInt(daqiValue))
        
        const enhancedLabel = `${tabText}, DAQI ${daqiValue}, ${levelText} air pollution`
        tab.setAttribute('aria-label', enhancedLabel)
        tab.setAttribute('title', enhancedLabel)
      }
    })
  }

  function enhanceKeyboardNavigation() {
    const tabContainer = document.querySelector('.daqi-tabs') // Only target DAQI tabs
    if (!tabContainer) return
    
    // Add roving tabindex behavior
    const tabs = tabContainer.querySelectorAll('.govuk-tabs__tab')
    
    tabs.forEach((tab, index) => {
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
            
          default:
            return
        }
        
        // Move focus and activate tab
        const nextTab = tabs[nextIndex]
        if (nextTab) {
          nextTab.focus()
          nextTab.click()
        }
      })
    })
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

  // Export for testing
  if (typeof window !== 'undefined') {
    window.daqiAccessibility = {
      announceTabChange,
      getDaqiLevelText,
      getDaqiColorInfo,
      addLiveRegion
    }
  }
}

export default {
  initDAQIAccessibility: typeof initDAQIAccessibility !== 'undefined' ? initDAQIAccessibility : null
}