// DAQI Screen Reader Demo Script
// This script demonstrates what screen readers will announce for DAQI components
// Copy and paste this into browser console on a location page

;(function () {
  'use strict'

  console.log('🔊 DAQI Screen Reader Demo Loading...')

  // Main demo function
  function demoScreenReaderExperience() {
    console.log('\n🎭 DAQI Screen Reader Experience Demo')
    console.log('=====================================')

    // 1. Demo DAQI bar announcement
    demoDAQIBarAnnouncement()

    // 2. Demo tab navigation
    setTimeout(() => demoTabNavigation(), 2000)

    // 3. Demo live region announcements
    setTimeout(() => demoLiveRegionAnnouncements(), 4000)
  }

  function demoDAQIBarAnnouncement() {
    console.log('\n📊 1. DAQI Bar Screen Reader Experience:')
    console.log('----------------------------------------')

    const daqiBar = document.querySelector('.daqi-numbered')
    if (!daqiBar) {
      console.log('❌ No DAQI bar found. Navigate to a location page first.')
      return
    }

    const ariaLabel = daqiBar.getAttribute('aria-label')
    const role = daqiBar.getAttribute('role')

    console.log('🔍 When screen reader encounters DAQI bar:')
    console.log(`   Role: ${role}`)
    console.log(`   🔊 Announces: "${ariaLabel}"`)
    console.log('')
    console.log('💡 This tells users the current air quality level without')
    console.log('   needing to interpret colors or visual elements')
  }

  function demoTabNavigation() {
    console.log('\n🗂️ 2. Tab Navigation Screen Reader Experience:')
    console.log('----------------------------------------------')

    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
    if (tabs.length === 0) {
      console.log('❌ No DAQI tabs found')
      return
    }

    console.log('🔍 When user tabs through DAQI forecasts:')

    tabs.forEach((tab, index) => {
      const daqiValue = tab.getAttribute('data-daqi-value')
      const daqiBand = tab.getAttribute('data-daqi-band')
      const ariaLabel = tab.getAttribute('aria-label')
      const textContent = tab.textContent.trim()
      const levelText = getLevelText(parseInt(daqiValue))

      console.log(`\n   Tab ${index + 1}: ${textContent}`)
      console.log(
        `   🔊 Screen reader announces: "${ariaLabel || textContent}"`
      )
      console.log(`   📊 Context: DAQI ${daqiValue} = ${levelText} pollution`)

      if (daqiBand) {
        console.log(`   🎯 Band: ${daqiBand}`)
      }
    })

    console.log('\n💡 Each tab provides complete context about air quality')
    console.log('   level, not just day names or numbers')
  }

  function demoLiveRegionAnnouncements() {
    console.log('\n📻 3. Live Region Announcements Demo:')
    console.log('------------------------------------')

    let liveRegion = document.getElementById('daqi-live-region')
    if (!liveRegion) {
      console.log('⚠️ Live region not found. Creating one for demo...')
      liveRegion = createLiveRegion()
    }

    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]')
    if (tabs.length === 0) {
      console.log('❌ No tabs available for demo')
      return
    }

    console.log('🔍 When user clicks/activates different tabs:')
    console.log('   (Simulating tab changes with live announcements)')

    // Simulate tab changes with announcements
    tabs.forEach((tab, index) => {
      setTimeout(() => {
        const daqiValue = tab.getAttribute('data-daqi-value')
        const textContent = tab.textContent.trim()
        const levelText = getLevelText(parseInt(daqiValue))

        const announcement = `${textContent} selected. Daily Air Quality Index ${daqiValue} out of 10, ${levelText} pollution level.`

        console.log(`\n   User activates: ${textContent}`)
        console.log(`   🔊 Live region announces: "${announcement}"`)

        // Actually update the live region
        liveRegion.textContent = announcement

        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = ''
        }, 2000)
      }, index * 3000)
    })

    // Final summary
    setTimeout(
      () => {
        console.log('\n✨ Live Region Benefits:')
        console.log('   • Immediate feedback when tabs change')
        console.log('   • No need to re-read tab labels')
        console.log('   • Clear context about pollution levels')
        console.log('   • Automatic announcements for dynamic content')
      },
      tabs.length * 3000 + 1000
    )
  }

  function createLiveRegion() {
    const liveRegion = document.createElement('div')
    liveRegion.id = 'daqi-live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'

    const firstPanel = document.querySelector('.govuk-tabs__panel')
    if (firstPanel) {
      firstPanel.insertBefore(liveRegion, firstPanel.firstChild)
    } else {
      document.body.appendChild(liveRegion)
    }

    return liveRegion
  }

  function getLevelText(value) {
    if (value >= 1 && value <= 3) return 'Low'
    if (value >= 4 && value <= 6) return 'Moderate'
    if (value >= 7 && value <= 9) return 'High'
    if (value === 10) return 'Very High'
    return 'Unknown'
  }

  // Real screen reader testing guide
  function showScreenReaderTestingGuide() {
    console.log('\n🧪 Real Screen Reader Testing Guide')
    console.log('===================================')

    console.log('\n📥 Install a Screen Reader:')
    console.log('• NVDA (Free, Windows): https://www.nvaccess.org/download/')
    console.log(
      '• JAWS (Trial, Windows): https://www.freedomscientific.com/downloads/jaws/'
    )
    console.log('• VoiceOver (Built-in, Mac): Press Cmd+F5 to enable')
    console.log('• Orca (Linux): Usually pre-installed')

    console.log('\n⌨️ Basic Screen Reader Navigation:')
    console.log('• Tab key: Move between interactive elements')
    console.log('• Shift+Tab: Move backwards')
    console.log('• Arrow keys: Navigate within tab groups')
    console.log('• Enter/Space: Activate buttons and tabs')
    console.log('• Ctrl+Home: Go to top of page')

    console.log('\n🎯 What to Test:')
    console.log('1. Navigate to DAQI component with Tab key')
    console.log(
      '2. Listen for: "Daily Air Quality Index X out of 10, [Level] pollution level"'
    )
    console.log('3. Use arrow keys to move between forecast tabs')
    console.log('4. Activate each tab and listen for live announcements')
    console.log('5. Verify pollution levels are clearly communicated')

    console.log('\n✅ Success Criteria:')
    console.log('• All DAQI information is announced clearly')
    console.log('• No information is conveyed by color alone')
    console.log('• Tab changes are announced immediately')
    console.log('• Pollution levels (Low/Moderate/High/Very High) are stated')
    console.log('• Navigation is logical and predictable')

    console.log('\n🚨 Common Issues to Check:')
    console.log('• "Image" announcements without descriptive text')
    console.log('• Tabs announced as just numbers without context')
    console.log('• Missing announcements when tabs change')
    console.log('• Color information without alternative text')
  }

  // Test specific DAQI value announcements
  function testDAQIValueAnnouncements() {
    console.log('\n🎯 DAQI Value Announcement Test')
    console.log('===============================')

    const daqiLevels = [
      {
        values: [1, 2, 3],
        level: 'Low',
        color: 'Green',
        advice: 'Enjoy usual outdoor activities'
      },
      {
        values: [4, 5, 6],
        level: 'Moderate',
        color: 'Yellow',
        advice:
          'Adults and children with lung problems, and adults with heart problems, who experience symptoms, should consider reducing strenuous physical activity'
      },
      {
        values: [7, 8, 9],
        level: 'High',
        color: 'Red',
        advice:
          'Adults and children with lung problems, and adults with heart problems, should reduce strenuous physical exertion'
      },
      {
        values: [10],
        level: 'Very High',
        color: 'Purple',
        advice:
          'Adults and children with lung problems, adults with heart problems, and older people, should avoid strenuous physical exertion'
      }
    ]

    daqiLevels.forEach(({ values, level, color, advice }) => {
      console.log(`\n📊 DAQI Level: ${level} (${color})`)
      console.log(`   Values: ${values.join(', ')}`)
      console.log(
        `   🔊 Screen reader should announce: "DAQI X, ${level} pollution level"`
      )
      console.log(`   📝 Health advice: ${advice.substring(0, 60)}...`)
    })
  }

  // Attach functions to window
  window.demoScreenReaderExperience = demoScreenReaderExperience
  window.showScreenReaderTestingGuide = showScreenReaderTestingGuide
  window.testDAQIValueAnnouncements = testDAQIValueAnnouncements

  console.log('🚀 DAQI Screen Reader Demo loaded!')
  console.log('\n🎬 Available demos:')
  console.log('• demoScreenReaderExperience() - Full demo simulation')
  console.log('• showScreenReaderTestingGuide() - Real testing instructions')
  console.log('• testDAQIValueAnnouncements() - Test all DAQI levels')
  console.log('\n▶️ Quick start: demoScreenReaderExperience()')
})()
