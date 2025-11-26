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

  // '' Get the aria-label which contains: "Daily Air Quality Index, level 7 out of 10, high pollution"
  // '' or Welsh: "Mynegai Ansawdd Aer Dyddiol, lefel 7 allan o 10, uchel llygredd"
  const ariaLabel = daqiBar.getAttribute('aria-label')
  if (!ariaLabel) return

  // '' Parse the level and band from aria-label
  // '' English: "level 7 out of 10" or Welsh: "lefel 7 allan o 10"
  const levelMatch = ariaLabel.match(/(?:level|lefel) (\d+)/i)
  // '' English: "out of 10, high pollution" or "out of 10, very high pollution"
  // '' Welsh: "allan o 10, uchel llygredd" or "allan o 10, uchel iawn llygredd"
  // '' Extract everything between "10, " and " pollution"/" llygredd"
  const bandMatch = ariaLabel.match(
    /(?:out of|allan o) \d+,\s*(.+?)\s+(?:pollution|llygredd)/i
  )

  if (!levelMatch || !bandMatch) return

  const level = parseInt(levelMatch[1], 10)
  // '' Band is already extracted without "pollution" or "llygredd" suffix
  const band = bandMatch[1].trim() // "low", "high", "cymedrol", "uchel", etc.

  console.log(`Active tab: level ${level}, band: ${band}`)

  // Update health advice content
  updateHealthAdvice(level, band)

  // '' Update exposure section content based on band
  updateExposureSection(band)

  // '' Dynamically reorder exposure vs health sections based on active tab level
  reorderExposureAndHealth(level)
}

function updateExposureSection(band) {
  const exposureSection = document.getElementById('exposure-section')
  if (!exposureSection) return

  // Normalize band name
  const normalizedBand = band.toLowerCase().trim()

  // Get the exposure HTML content based on band
  let exposureHtml = getExposureHtmlForBand(normalizedBand)
  if (!exposureHtml) return

  // '' Add locationName and searchTerms parameters to links (same as Nunjucks template does)
  exposureHtml = addQueryParametersToLinks(exposureHtml)

  // Update the exposure section content
  exposureSection.innerHTML = exposureHtml
  console.log(`Exposure section updated for band: ${normalizedBand}`)
}

function addQueryParametersToLinks(html) {
  // '' Get locationId, locationName and searchTerms from data attributes on exposure-section div
  const exposureSection = document.getElementById('exposure-section')
  const locationId = exposureSection
    ? exposureSection.getAttribute('data-location-id')
    : null
  const locationName = exposureSection
    ? exposureSection.getAttribute('data-location-name')
    : null
  const searchTerms = exposureSection
    ? exposureSection.getAttribute('data-search-terms')
    : null

  console.log('addQueryParametersToLinks - locationId:', locationId)
  console.log('addQueryParametersToLinks - locationName:', locationName)
  console.log('addQueryParametersToLinks - searchTerms:', searchTerms)

  // '' First, replace {locationId} placeholder in the HTML (same as Nunjucks does)
  if (locationId) {
    html = html.replace(/{locationId}/g, locationId)
  }

  // '' Build query parameters string
  let queryParams = ''
  if (searchTerms) {
    queryParams += '&searchTerms=' + encodeURIComponent(searchTerms)
  }
  if (locationName) {
    queryParams += '&locationName=' + encodeURIComponent(locationName)
  }

  console.log('addQueryParametersToLinks - queryParams:', queryParams)

  // '' Add query parameters to links if we have any
  if (queryParams) {
    // Determine language from page
    const isWelsh = document.documentElement.lang === 'cy'

    if (isWelsh) {
      // Welsh links
      html = html.replace(
        /effeithiau-iechyd\?lang=cy/g,
        'effeithiau-iechyd?lang=cy' + queryParams
      )
      html = html.replace(
        /camau-lleihau-amlygiad\/cy\?lang=cy/g,
        'camau-lleihau-amlygiad/cy?lang=cy' + queryParams
      )
    } else {
      // English links
      html = html.replace(
        /health-effects\?lang=en/g,
        'health-effects?lang=en' + queryParams
      )
      html = html.replace(
        /actions-reduce-exposure\?lang=en/g,
        'actions-reduce-exposure?lang=en' + queryParams
      )
    }
  }

  return html
}

function getExposureHtmlForBand(band) {
  // Determine if we're on Welsh or English page
  const isWelsh = document.documentElement.lang === 'cy'

  if (isWelsh) {
    // Welsh exposure HTML templates
    const welshExposureTemplates = {
      isel: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">Sut gallwch chi leihau'ch amlygiad i lygredd aer</h2>
<p>Gall amlygiad hirdymor i lygredd aer (dros flynyddoedd) arwain at lawer o wahanol <a class="govuk-link" href="/lleoliad/{locationId}/effeithiau-iechyd?lang=cy">gyflyrau iechyd</a> a gall leihau disgwyliad oes.</p>
<p>Dylech chi geisio lleihau'ch amlygiad i lygredd aer lle gallwch chi, hyd yn oed pan fo'r lefelau'n isel.</p>
<p>Ystyriwch y camau canlynol:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>cymryd llwybrau lle mae llai o draffig, yn enwedig ar adegau prysur o'r dydd</li>
  <li>cymudo, cerdded neu ymarfer corff mewn parciau neu fannau gwyrdd eraill, os nad yw paill yn effeithio arnoch chi</li>
  <li>os ydych chi'n ymarfer corff dan do, gofalwch fod yr ystafell wedi'i hawyru'n dda</li>
</ul>
<p>Rhagor o gyngor ar <a class="govuk-link" href="/lleoliad/{locationId}/camau-lleihau-amlygiad/cy?lang=cy">gamau y gallwch eu cymryd i leihau'ch amlygiad i lygredd aer</a>.</p>`,
      cymedrol: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">Sut gallwch chi leihau'ch amlygiad i lygredd aer</h2>
<p>Ystyriwch y camau canlynol:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>cymryd llwybrau lle mae llai o draffig, yn enwedig ar adegau prysur o'r dydd</li>
  <li>cymudo, cerdded neu ymarfer corff mewn parciau neu fannau gwyrdd eraill, os nad yw paill yn effeithio arnoch chi</li>
  <li>os ydych chi'n ymarfer corff dan do, gofalwch fod yr ystafell wedi'i hawyru'n dda</li>
</ul>
<p>Rhagor o gyngor ar <a class="govuk-link" href="/lleoliad/{locationId}/camau-lleihau-amlygiad/cy?lang=cy">gamau y gallwch eu cymryd i leihau'ch amlygiad i lygredd aer</a>.</p>
<p>Gall amlygiad hirdymor i lygredd aer (dros flynyddoedd) arwain at lawer o wahanol <a class="govuk-link" href="/lleoliad/{locationId}/effeithiau-iechyd?lang=cy">gyflyrau iechyd</a> a gall leihau disgwyliad oes.</p>`,
      uchel: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">Sut gallwch chi leihau'ch amlygiad i lygredd aer</h2>
<p>Ystyriwch y camau canlynol:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>cymryd llwybrau lle mae llai o draffig, yn enwedig ar adegau prysur o'r dydd</li>
  <li>cymudo, cerdded neu ymarfer corff mewn parciau neu fannau gwyrdd eraill, os nad yw paill yn effeithio arnoch chi</li>
  <li>os ydych chi'n ymarfer corff dan do, gofalwch fod yr ystafell wedi'i hawyru'n dda</li>
</ul>
<p>Rhagor o gyngor ar <a class="govuk-link" href="/lleoliad/{locationId}/camau-lleihau-amlygiad/cy?lang=cy">gamau y gallwch eu cymryd i leihau'ch amlygiad i lygredd aer</a>.</p>
<p>Gall amlygiad hirdymor i lygredd aer (dros flynyddoedd) arwain at lawer o wahanol <a class="govuk-link" href="/lleoliad/{locationId}/effeithiau-iechyd?lang=cy">gyflyrau iechyd</a> a gall leihau disgwyliad oes.</p>`,
      'uchel iawn': `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">Sut gallwch chi leihau'ch amlygiad i lygredd aer</h2>
<p>Ystyriwch y camau canlynol:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>cymryd llwybrau lle mae llai o draffig, yn enwedig ar adegau prysur o'r dydd</li>
  <li>cymudo, cerdded neu ymarfer corff mewn parciau neu fannau gwyrdd eraill, os nad yw paill yn effeithio arnoch chi</li>
  <li>os ydych chi'n ymarfer corff dan do, gofalwch fod yr ystafell wedi'i hawyru'n dda</li>
</ul>
<p>Rhagor o gyngor ar <a class="govuk-link" href="/lleoliad/{locationId}/camau-lleihau-amlygiad/cy?lang=cy">gamau y gallwch eu cymryd i leihau'ch amlygiad i lygredd aer</a>.</p>
<p>Gall amlygiad hirdymor i lygredd aer (dros flynyddoedd) arwain at lawer o wahanol <a class="govuk-link" href="/lleoliad/{locationId}/effeithiau-iechyd?lang=cy">gyflyrau iechyd</a> a gall leihau disgwyliad oes.</p>`
    }

    return welshExposureTemplates[band] || null
  }

  // English exposure HTML templates
  const exposureTemplates = {
    low: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">How you can reduce your exposure to air pollution</h2>
<p>Long term exposure to air pollution (over years) can lead to many different <a class="govuk-link" href="/location/{locationId}/health-effects?lang=en">health conditions</a> and can reduce life expectancy.</p>
<p>You should try to reduce your exposure to air pollution where you can, even when levels are low.</p>
<p>Consider the following actions:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>take routes where there is less traffic, especially at busy times of day</li>
  <li>commute, walk or exercise in parks or other green spaces, if you are not affected by pollen</li>
  <li>if you exercise indoors, make sure the room is well ventilated</li>
</ul>
<p>Get more advice on <a class="govuk-link" href="/location/{locationId}/actions-reduce-exposure?lang=en">actions you can take to reduce your exposure to air pollution</a>.</p>`,
    moderate: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">How you can reduce your exposure to air pollution</h2>
<p>Consider the following actions:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>take routes where there is less traffic, especially at busy times of day</li>
  <li>commute, walk or exercise in parks or other green spaces, if you are not affected by pollen</li>
  <li>if you exercise indoors, make sure the room is well ventilated</li>
</ul>
<p>Get more advice on <a class="govuk-link" href="/location/{locationId}/actions-reduce-exposure?lang=en">actions you can take to reduce your exposure to air pollution</a>.</p>
<p>Long term exposure to air pollution (over years) can lead to many different <a class="govuk-link" href="/location/{locationId}/health-effects?lang=en">health conditions</a> and can reduce life expectancy.</p>`,
    high: `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">How you can reduce your exposure to air pollution</h2>
<p>Consider the following actions:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>take routes where there is less traffic, especially at busy times of day</li>
  <li>commute, walk or exercise in parks or other green spaces, if you are not affected by pollen</li>
  <li>if you exercise indoors, make sure the room is well ventilated</li>
</ul>
<p>Get more advice on <a class="govuk-link" href="/location/{locationId}/actions-reduce-exposure?lang=en">actions you can take to reduce your exposure to air pollution</a>.</p>
<p>Long term exposure to air pollution (over years) can lead to many different <a class="govuk-link" href="/location/{locationId}/health-effects?lang=en">health conditions</a> and can reduce life expectancy.</p>`,
    'very high': `<h2 class="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">How you can reduce your exposure to air pollution</h2>
<p>Consider the following actions:</p>
<ul class="govuk-list govuk-list--bullet">
  <li>take routes where there is less traffic, especially at busy times of day</li>
  <li>commute, walk or exercise in parks or other green spaces, if you are not affected by pollen</li>
  <li>if you exercise indoors, make sure the room is well ventilated</li>
</ul>
<p>Get more advice on <a class="govuk-link" href="/location/{locationId}/actions-reduce-exposure?lang=en">actions you can take to reduce your exposure to air pollution</a>.</p>
<p>Long term exposure to air pollution (over years) can lead to many different <a class="govuk-link" href="/location/{locationId}/health-effects?lang=en">health conditions</a> and can reduce life expectancy.</p>`
  }

  return exposureTemplates[band] || null
}

function updateHealthAdvice(level, band) {
  // Get advice data based on level/band
  const adviceData = getAdviceForBand(band, level)

  console.log(`updateHealthAdvice called: level=${level}, band=${band}`)
  console.log('Advice data:', adviceData)

  // Find health advice elements (look for the heading that contains "Health advice for" or Welsh "Cyngor iechyd ar gyfer")
  const allHeadings = document.querySelectorAll('h2.govuk-heading-m')
  let healthHeading = null
  let isWelsh = false

  for (const heading of allHeadings) {
    const headingText = heading.textContent
    if (headingText.includes('Health advice for')) {
      healthHeading = heading
      isWelsh = false
      break
    } else if (headingText.includes('Cyngor iechyd ar gyfer')) {
      healthHeading = heading
      isWelsh = true
      break
    }
  }

  if (!healthHeading) {
    console.log('No health advice heading found')
    return
  }

  // Update heading (English or Welsh)
  if (isWelsh) {
    // Get Welsh band name from server data if available
    const welshBand = getWelshBandName(band)
    healthHeading.textContent = `Cyngor iechyd ar gyfer lefelau ${welshBand} o lygredd aer`
  } else {
    healthHeading.textContent = `Health advice for ${band} levels of air pollution`
  }

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
        'daqi-health-inset--veryHigh',
        'daqi-health-inset--isel',
        'daqi-health-inset--cymedrol',
        'daqi-health-inset--uchel',
        'daqi-health-inset--uchelIawn'
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
  // Handle English band names
  if (normalized === 'very high') return 'veryHigh'
  // Handle Welsh band names
  if (normalized === 'uchel iawn') return 'uchelIawn'
  return normalized
}

// Helper function to get Welsh band name for heading
function getWelshBandName(englishBand) {
  const welshBands = {
    low: 'isel',
    moderate: 'cymedrol',
    high: 'uchel',
    'very high': 'uchel iawn'
  }
  return welshBands[englishBand.toLowerCase().trim()] || englishBand
}

function getAdviceForBand(band, level) {
  // Normalize band name
  let normalizedBand = band.toLowerCase().trim()

  // '' Translate Welsh band names to English keys (template maps Welsh→English for JS compatibility)
  const welshToEnglishBands = {
    isel: 'low',
    cymedrol: 'moderate',
    uchel: 'high',
    'uchel iawn': 'very high'
  }

  // Check if this is a Welsh band name and translate it
  if (welshToEnglishBands[normalizedBand]) {
    normalizedBand = welshToEnglishBands[normalizedBand]
    console.log(`Translated Welsh band to English key: ${normalizedBand}`)
  }

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
      insetText: `<p>Adults and children with lung or heart conditions are at greater risk of experiencing symptoms.</p>
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

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions, and older people</h3>

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

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions, and older people</h3>

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

<h3 class="govuk-heading-s">Advice for adults and children with lung or heart conditions, and older people</h3>

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
    // Identify health heading (English or Welsh)
    const allHeadings = document.querySelectorAll('h2.govuk-heading-m')
    let healthHeading = null
    for (const heading of allHeadings) {
      if (
        heading.textContent.includes('Health advice for') ||
        heading.textContent.includes('Cyngor iechyd ar gyfer')
      ) {
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
