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

  // '' Initial load: keep default (Today) tab even if mockDay param present
  // '' Requirement update: do NOT auto-switch tab based on mockDay query param
  updateHealthAdviceForActiveTab()

  console.log(
    'Health advice updates initialized for',
    tabButtons.length,
    'tabs'
  )
}

// '' Removed mockDay tab preselection per updated requirement (keep Today active by default)

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

  // '' Dynamically reorder exposure vs health sections based on active tab level
  reorderExposureAndHealth(level)
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

  // Handle Low level (1-3): show advice paragraph + regular text div, no inset box
  if (level <= 3) {
    // '' Structural refinement (AQC-657): Remove standalone low-level advice paragraph to prevent duplication of first sentence
    // Hide/remove any existing paragraph created during previous state transitions
    let existingParagraph = healthHeading.nextElementSibling
    if (existingParagraph && existingParagraph.tagName === 'P') {
      existingParagraph.style.display = 'none'
      existingParagraph.textContent = ''
    }

    // Hide any existing inset text
    const insetText = document.querySelector('.daqi-health-inset')
    if (insetText) {
      insetText.style.display = 'none'
    }

    // Show or update the regular content div
    let contentDiv = document.querySelector('.daqi-health-content')
    if (!contentDiv) {
      // Create the content div if it doesn't exist
      contentDiv = document.createElement('div')
      contentDiv.className = 'daqi-health-content daqi-health-content--low'
      // Insert directly after the heading (paragraph removed to avoid duplication)
      healthHeading.insertAdjacentElement('afterend', contentDiv)
    }
    contentDiv.innerHTML = adviceData.insetText
    contentDiv.style.display = 'block'
    contentDiv.setAttribute('data-daqi-band', 'low')
    console.log('Low level: regular text content updated (no colored box)')
  } else {
    // Handle Moderate/High/Very High (4-10): hide advice paragraph, show colored inset box only
    // Hide the main advice paragraph (advice is included in insetText for Moderate+)
    let mainAdviceParagraph = healthHeading.nextElementSibling
    if (mainAdviceParagraph && mainAdviceParagraph.tagName === 'P') {
      mainAdviceParagraph.style.display = 'none'
      console.log('Main advice paragraph hidden for Moderate+ level')
    }

    // Hide the regular content div
    const contentDiv = document.querySelector('.daqi-health-content')
    if (contentDiv) {
      contentDiv.style.display = 'none'
    }

    // Update inset text content and border color
    let insetText = document.querySelector('.daqi-health-inset')
    if (!insetText) {
      // Create the inset text element if it doesn't exist
      insetText = document.createElement('div')
      insetText.className =
        'govuk-inset-text daqi-health-inset daqi-health-inset--moderate'
      // Insert after the heading (and hidden paragraph if it exists)
      let insertAfter = mainAdviceParagraph || healthHeading
      insertAfter.insertAdjacentElement('afterend', insetText)
      console.log('Created new inset text element')
    }

    if (adviceData.insetText) {
      insetText.style.display = 'block'
      insetText.innerHTML = adviceData.insetText
      console.log('Inset text content updated')

      // Update border color by changing CSS class
      insetText.classList.remove(
        'daqi-health-inset--low',
        'daqi-health-inset--moderate',
        'daqi-health-inset--high',
        'daqi-health-inset--veryHigh'
      )

      const bandClass = getBandClassName(band)
      insetText.classList.add(`daqi-health-inset--${bandClass}`)
      insetText.setAttribute('data-daqi-band', bandClass)
      console.log(`Border color updated to ${bandClass}`)
    }
  }

  console.log(`Health advice updated for ${band} (level ${level})`)
}

// Helper function to normalize band name for CSS class
function getBandClassName(band) {
  const normalized = band.toLowerCase().trim()
  if (normalized === 'very high') return 'veryHigh'
  return normalized
}

function getAdviceForBand(band, level) {
  // Normalize band name
  const normalizedBand = band.toLowerCase().trim()

  // '' Use server-injected data if available, otherwise fall back to hardcoded data
  if (
    typeof window.airQualityMessages !== 'undefined' &&
    window.airQualityMessages[normalizedBand]
  ) {
    console.log(`Using server-injected data for band: ${normalizedBand}`)
    return window.airQualityMessages[normalizedBand]
  }

  console.log(`Using hardcoded fallback data for band: ${normalizedBand}`)

  // Health advice messages matching server-side data (fallback only)
  const advice = {
    low: {
      // '' AQC-657: Removed redundant legacy phrase "Enjoy your usual outdoor activities." to align with updated server copy
      advice:
        'For most people, short term exposure to low levels of air pollution is not an issue.',
      insetText: `<p>For most people, short term exposure to low levels of air pollution is not an issue. Continue your usual outdoor activities.</p>
<p>Some people might experience symptoms due to air pollution, even when levels are low.</p>
<p>Adults and children with lung or heart conditions are at greater risk of experiencing symptoms.</p>
<p>Symptoms could include:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>
<p>Follow your doctor or nurse's usual advice about physically demanding activities and managing your condition.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>
<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>`,
      atrisk: {
        // '' Distinct summaries replacing redundant generic sentence
        adults:
          'Some people may experience symptoms, even when levels are low.',
        asthma: 'People with asthma should follow their usual management plan.',
        oldPeople:
          'Older people with heart or lung conditions should follow usual advice.'
      }
    },
    moderate: {
      advice:
        'For most people, short term exposure to moderate levels of air pollution is not an issue.',
      insetText: `<p>For most people, short term exposure to moderate levels of air pollution is not an issue. Continue your usual outdoor activities. However, if you are experiencing symptoms, try to reduce your exposure to air pollution.</p>
<p>However, some people may experience symptoms of exposure to air pollution. These can start within hours or several days after exposure.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of asthma symptoms</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions</h3>

<p>Try to adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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
      insetText: `<p>Try to <a href="/proto-dev-new/actions?locationName">reduce your exposure to air pollution</a>, especially if you're experiencing symptoms.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions</h3>

<p>You should adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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
      insetText: `<p>Try to <a href="">reduce your exposure to air pollution</a>, especially if you're experiencing symptoms.</p>

<h3 class="govuk-heading-s">Short term air pollution exposure</h3>

<p>Short term exposure (over hours or days) can cause a range of health impacts, including:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>coughing</li>
    <li>eye, nose, and throat irritation</li>
    <li>chest tightness and pain</li>
    <li>difficulty breathing</li>
    <li>worsening of heart-related symptoms, such as heart palpitations</li>
    <li>worsening of chronic obstructive pulmonary disease (COPD) symptoms</li>
</ul>

<p>Symptoms could start within hours or several days after exposure to air pollution.</p>

<p>Speak to your doctor or nurse if:</p>
<ul class="govuk-list govuk-list--bullet">
    <li>you have new symptoms</li>
    <li>your symptoms get worse</li>
    <li>your symptoms do not get better after a week</li>
</ul>

<p>Also consider the impact of other triggers on your symptoms – for example, high pollen outside or poor air quality indoors.</p>

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions</h3>

<p>You should adapt physically demanding activities outdoors, especially if your symptoms get worse.</p>
<p>Follow your agreed management plan if you have one – for example, an asthma action plan. Ask your doctor or nurse for a plan if you do not have one.</p>`,
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

// '' Reorder exposure section and health advice block depending on DAQI level
function reorderExposureAndHealth(level) {
  try {
    const exposure = document.getElementById('exposure-section')
    if (!exposure) return
    // Identify health heading
    const allHeadings = document.querySelectorAll('h2.govuk-heading-m')
    let healthHeading = null
    for (const heading of allHeadings) {
      if (heading.textContent.includes('Health advice for')) {
        healthHeading = heading
        break
      }
    }
    if (!healthHeading) return

    // Find visible health content element (inset for Moderate+, content div for Low)
    const inset = document.querySelector('.daqi-health-inset')
    const lowContent = document.querySelector('.daqi-health-content')
    const healthContent =
      inset && inset.style.display !== 'none'
        ? inset
        : lowContent && lowContent.style.display !== 'none'
          ? lowContent
          : null

    // Separator HR (between-health-exposure)
    let separator = document.querySelector(
      'hr[data-daqi-separator="between-health-exposure"]'
    )
    if (!separator) {
      separator = document.createElement('hr')
      separator.className =
        'govuk-section-break govuk-section-break--visible govuk-!-margin-top-6 govuk-!-margin-bottom-6'
      separator.setAttribute('data-daqi-separator', 'between-health-exposure')
    }

    // Determine desired order: Low => exposure first; Moderate+ => health first
    const wantExposureFirst = level <= 3

    // Helper to place nodes sequentially
    function placeExposureFirst() {
      // Exposure -> HR -> HealthHeading -> HealthContent
      // If current order differs, rebuild sequence
      const parent = healthHeading.parentNode
      if (exposure.nextElementSibling !== separator) {
        parent.insertBefore(separator, exposure.nextSibling)
      }
      // Ensure healthHeading comes after separator
      if (separator.nextElementSibling !== healthHeading) {
        parent.insertBefore(healthHeading, separator.nextSibling)
      }
      if (healthContent && healthHeading.nextElementSibling !== healthContent) {
        parent.insertBefore(healthContent, healthHeading.nextSibling)
      }
    }

    function placeHealthFirst() {
      // HealthHeading -> HealthContent -> HR -> Exposure
      const parent = healthHeading.parentNode
      // Move health heading before exposure if needed
      if (
        healthHeading.compareDocumentPosition(exposure) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        parent.insertBefore(healthHeading, exposure)
      }
      if (healthContent && healthHeading.nextElementSibling !== healthContent) {
        parent.insertBefore(healthContent, healthHeading.nextSibling)
      }
      // Ensure separator after healthContent
      const afterHealth = healthContent || healthHeading
      if (afterHealth.nextElementSibling !== separator) {
        parent.insertBefore(separator, afterHealth.nextSibling)
      }
      // Exposure after separator
      if (separator.nextElementSibling !== exposure) {
        parent.insertBefore(exposure, separator.nextSibling)
      }
    }

    if (wantExposureFirst) {
      placeExposureFirst()
      console.log(
        'Reordered: exposure section placed before health advice (Low level)'
      )
    } else {
      placeHealthFirst()
      console.log(
        'Reordered: health advice placed before exposure section (Moderate+ level)'
      )
    }
  } catch (e) {
    console.log('Reorder error', e)
  }
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
