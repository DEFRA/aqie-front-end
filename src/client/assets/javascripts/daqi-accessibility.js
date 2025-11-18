''
// DAQI Accessibility Enhancements
// GovUK tabs component handles all tab accessibility natively
// This script dynamically updates health advice based on active tab

function initDAQIAccessibility() {
  if (typeof document === 'undefined') return

  console.log('DAQI Accessibility: Initializing dynamic health advice updates')

  // Initialize dynamic health advice updates based on active tab
  initHealthAdviceUpdates()
}

function initHealthAdviceUpdates() {
  const tabsContainer = document.querySelector('.daqi-tabs')
  if (!tabsContainer) {
    console.log('No DAQI tabs found on page')
    return
  }

  // Get all tab buttons
  const tabButtons = tabsContainer.querySelectorAll('.govuk-tabs__tab')
  if (!tabButtons.length) {
    console.log('No tab buttons found')
    return
  }

  // Listen for clicks on tab buttons
  tabButtons.forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      // Small delay to let GovUK tabs finish switching
      setTimeout(() => {
        updateHealthAdviceForActiveTab()
      }, 50)
    })
  })

  // Also update on initial load for the default active tab
  updateHealthAdviceForActiveTab()

  console.log(
    'Health advice updates initialized for',
    tabButtons.length,
    'tabs'
  )
}

function updateHealthAdviceForActiveTab() {
  // Find the currently visible/active panel
  const activePanel = document.querySelector(
    '.govuk-tabs__panel:not(.govuk-tabs__panel--hidden)'
  )

  if (!activePanel) {
    console.log('No active panel found')
    return
  }

  // Extract DAQI data from the active panel
  const daqiBar = activePanel.querySelector('.daqi-numbered')
  if (!daqiBar) {
    console.log('No DAQI bar found in active panel')
    return
  }

  // Get the aria-label which contains: "Daily Air Quality Index, level 7, high pollution"
  const ariaLabel = daqiBar.getAttribute('aria-label')
  if (!ariaLabel) return

  // Parse the level and band
  const levelMatch = ariaLabel.match(/level (\d+)/i)
  const bandMatch = ariaLabel.match(/level \d+, ([^,]+)/i)

  if (!levelMatch || !bandMatch) return

  const level = parseInt(levelMatch[1], 10)
  const bandText = bandMatch[1].trim() // "low pollution", "high pollution", etc.
  const band = bandText.replace(' pollution', '').trim() // "low", "high", etc.

  console.log(`Active tab: level ${level}, band: ${band}`)

  // Update health advice content
  updateHealthAdvice(level, band)
}

function updateHealthAdvice(level, band) {
  // Get advice data based on level/band
  const adviceData = getAdviceForBand(band, level)

  console.log(`updateHealthAdvice called: level=${level}, band=${band}`)
  console.log('Advice data:', adviceData)

  // Find health advice elements (look for the heading that contains "Health advice for")
  const allHeadings = document.querySelectorAll('h2.govuk-heading-m')
  let healthHeading = null

  for (const heading of allHeadings) {
    if (heading.textContent.includes('Health advice for')) {
      healthHeading = heading
      break
    }
  }

  if (!healthHeading) {
    console.log('No health advice heading found')
    return
  }

  // Update heading
  healthHeading.textContent = `Health advice for ${band} levels of air pollution`

  // Update main advice paragraph (find the one right after the heading)
  const mainAdviceParagraph = healthHeading.nextElementSibling
  if (mainAdviceParagraph && mainAdviceParagraph.tagName === 'P') {
    mainAdviceParagraph.textContent = adviceData.advice
    console.log('Main advice paragraph updated')
  }

  // Update or hide inset text for at-risk groups
  const insetText = document.querySelector('.govuk-inset-text')
  console.log('Inset text element found:', !!insetText)
  console.log('Level >= 4:', level >= 4)
  console.log('Has atrisk data:', !!adviceData.atrisk)

  if (insetText) {
    if (level >= 4 && adviceData.atrisk) {
      // Only show if the advice is different from "Enjoy your usual outdoor activities"
      const isStandardAdvice =
        adviceData.atrisk.adults === 'Enjoy your usual outdoor activities.'
      console.log('Is standard advice:', isStandardAdvice)
      if (!isStandardAdvice) {
        console.log('Showing inset text with at-risk advice')
        insetText.innerHTML = `
          <p>${adviceData.atrisk.adults}</p>
          <p>${adviceData.atrisk.asthma}</p>
          <p>${adviceData.atrisk.oldPeople}</p>
        `
        insetText.style.display = 'block'
      } else {
        console.log('Hiding inset text (standard advice)')
        insetText.style.display = 'none'
      }
    } else {
      // Hide inset text for low levels (1-3)
      console.log('Hiding inset text (level < 4)')
      insetText.style.display = 'none'
    }
  }

  console.log(`Health advice updated for ${band} (level ${level})`)
}

function getAdviceForBand(band, level) {
  // Normalize band name
  const normalizedBand = band.toLowerCase().trim()

  // Health advice messages matching server-side data
  const advice = {
    low: {
      advice: 'Enjoy your usual outdoor activities.',
      atrisk: {
        adults: 'Enjoy your usual outdoor activities.',
        asthma: 'Enjoy your usual outdoor activities.',
        oldPeople: 'Enjoy your usual outdoor activities.'
      }
    },
    moderate: {
      advice:
        'For most people, short term exposure to moderate levels of air pollution is not an issue.',
      atrisk: {
        adults:
          'Adults who have heart problems and feel unwell should consider doing less strenuous exercise, especially outside.',
        asthma:
          'People with asthma should be prepared to use their reliever inhaler.',
        oldPeople:
          'Older people should consider doing less strenuous activity, especially outside.'
      }
    },
    high: {
      advice:
        'Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.',
      atrisk: {
        adults:
          'Adults with heart problems should reduce strenuous physical exertion, particularly outdoors, especially if they experience symptoms.',
        asthma:
          'People with asthma may find they need to use their reliever inhaler more often.',
        oldPeople: 'Older people should reduce physical exertion.'
      }
    },
    'very high': {
      advice:
        'Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.',
      atrisk: {
        adults:
          'Adults with heart problems should avoid strenuous physical activity.',
        asthma:
          'People with asthma may need to use their reliever inhaler more often.',
        oldPeople: 'Older people should avoid strenuous physical activity.'
      }
    }
  }

  return advice[normalizedBand] || advice.low
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDAQIAccessibility)
  } else {
    initDAQIAccessibility()
  }
}

// Export for application.js
export default {
  initDAQIAccessibility
}
