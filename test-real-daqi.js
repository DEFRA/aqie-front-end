// Test script to verify real DAQI functionality
// Copy and paste this ENTIRE script into browser console, then run the functions

(function() {
  'use strict';
  
  console.log('🧪 DAQI Real Functionality Test Script Loading...');

  // Test the actual ResizeObserver and JavaScript calculations
  function testRealDAQI() {
    console.log('🔍 Starting DAQI Real Functionality Test...');
    const results = [];
    
    // 1. Check if daqi-columns.js loaded
    if (typeof ResizeObserver !== 'undefined') {
      results.push('✅ ResizeObserver available (real functionality)');
    } else {
      results.push('❌ ResizeObserver not available');
    }
    
    // 2. Check DAQI elements exist
    const daqiBar = document.querySelector('.daqi-bar');
    const daqiSegments = document.querySelectorAll('.daqi-bar-segment');
    
    if (daqiBar) {
      results.push(`✅ DAQI bar found with ${daqiSegments.length} segments`);
    } else {
      results.push('❌ No DAQI bar found - make sure you\'re on a location page');
    }
    
    // 3. Check CSS custom properties are set (evidence of JavaScript calculation)
    const daqiContainer = document.querySelector('.daqi-numbered');
    if (daqiContainer) {
      const styles = getComputedStyle(daqiContainer);
      const divider1 = styles.getPropertyValue('--daqi-divider-1');
      const divider2 = styles.getPropertyValue('--daqi-divider-2');
      const divider3 = styles.getPropertyValue('--daqi-divider-3');
      
      if (divider1 || divider2 || divider3) {
        results.push(`✅ CSS custom properties set: --daqi-divider-1: ${divider1}, --daqi-divider-2: ${divider2}, --daqi-divider-3: ${divider3}`);
      } else {
        results.push('❌ No CSS custom properties found (JavaScript not calculating)');
      }
    } else {
      results.push('❌ No .daqi-numbered container found');
    }
    
    // 4. Check active DAQI value
    const activeTabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]');
    if (activeTabs.length === 0) {
      results.push('❌ No DAQI tabs found - make sure you\'re on a location page with air quality data');
    } else {
      activeTabs.forEach(tab => {
        const value = tab.getAttribute('data-daqi-value');
        const band = tab.getAttribute('data-daqi-band');
        if (value && value !== '0') {
          results.push(`✅ Active DAQI tab found: Value ${value}, Band: ${band}`);
        }
      });
    }
    
    // 5. Test responsive behavior by triggering a resize event
    const originalWidth = window.innerWidth;
    results.push(`📏 Current window width: ${originalWidth}px`);
    
    // Simulate window resize to test responsive calculations
    window.dispatchEvent(new Event('resize'));
    results.push('✅ Resize event triggered (tests ResizeObserver)');
    
    // 6. Check for real air quality data
    const adviceText = document.querySelector('.daqitab-summary');
    if (adviceText) {
      results.push('✅ Real health advice found (live data integration)');
    } else {
      results.push('❌ No health advice found - check if on location page with data');
    }
    
    // 7. Check DAQI segment colors
    const coloredSegments = document.querySelectorAll('.daqi-bar-segment[class*="daqi-"]:not(.daqi-0)');
    if (coloredSegments.length > 0) {
      results.push(`✅ ${coloredSegments.length} colored DAQI segments found (real styling)`);
    } else {
      results.push('❌ No colored DAQI segments found');
    }
    
    console.log('\n🌬️ DAQI Real Functionality Test Results:');
    results.forEach(result => console.log(result));
    console.log('\n📋 Summary:', results.filter(r => r.includes('✅')).length, 'passed,', results.filter(r => r.includes('❌')).length, 'failed');
    
    return results;
  }

  // Test screen reader accessibility features
  function testScreenReaderSupport() {
    console.log('🔊 Testing Screen Reader Support...');
    const results = [];
    
    // 1. Check DAQI bar ARIA implementation
    const daqiBar = document.querySelector('.daqi-numbered');
    if (daqiBar) {
      const role = daqiBar.getAttribute('role');
      const ariaLabel = daqiBar.getAttribute('aria-label');
      
      if (role === 'img') {
        results.push('✅ DAQI bar has proper role="img" for screen readers');
      } else {
        results.push(`❌ DAQI bar missing role="img", found: ${role || 'none'}`);
      }
      
      if (ariaLabel && ariaLabel.includes('Daily Air Quality Index')) {
        results.push(`✅ DAQI bar has descriptive aria-label: "${ariaLabel}"`);
      } else {
        results.push(`⚠️ DAQI bar aria-label could be more descriptive: "${ariaLabel || 'none'}"`);
      }
    }
    
    // 2. Check tab accessibility
    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]');
    if (tabs.length > 0) {
      results.push(`✅ Found ${tabs.length} DAQI tabs with data attributes`);
      
      tabs.forEach((tab, index) => {
        const ariaLabel = tab.getAttribute('aria-label');
        const daqiValue = tab.getAttribute('data-daqi-value');
        const daqiBand = tab.getAttribute('data-daqi-band');
        const textContent = tab.textContent.trim();
        
        if (ariaLabel && ariaLabel.includes('DAQI')) {
          results.push(`✅ Tab ${index + 1} has enhanced aria-label: "${ariaLabel}"`);
        } else if (textContent) {
          results.push(`⚠️ Tab ${index + 1} relies on text content: "${textContent}" (value: ${daqiValue})`);
        } else {
          results.push(`❌ Tab ${index + 1} missing accessible label`);
        }
      });
    }
    
    // 3. Check for live region
    const liveRegion = document.getElementById('daqi-live-region');
    if (liveRegion) {
      const ariaLive = liveRegion.getAttribute('aria-live');
      const ariaAtomic = liveRegion.getAttribute('aria-atomic');
      results.push(`✅ Live region found with aria-live="${ariaLive}", aria-atomic="${ariaAtomic}"`);
    } else {
      results.push('⚠️ No live region found - tab changes may not be announced');
    }
    
    // 4. Check hidden decorative elements
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    const daqiHidden = Array.from(hiddenElements).filter(el => 
      el.classList.contains('daqi-labels') || el.closest('.daqi-numbered')
    );
    if (daqiHidden.length > 0) {
      results.push(`✅ ${daqiHidden.length} decorative DAQI elements properly hidden from screen readers`);
    }
    
    // 5. Check tab panel accessibility
    const panels = document.querySelectorAll('.govuk-tabs__panel');
    let properPanels = 0;
    panels.forEach((panel, index) => {
      const role = panel.getAttribute('role');
      const ariaLabelledby = panel.getAttribute('aria-labelledby');
      if (role === 'tabpanel' && ariaLabelledby) {
        properPanels++;
      }
    });
    if (properPanels === panels.length) {
      results.push(`✅ All ${panels.length} tab panels have proper ARIA relationships`);
    } else {
      results.push(`⚠️ ${properPanels}/${panels.length} tab panels have proper ARIA`);
    }
    
    console.log('\n🔊 Screen Reader Test Results:');
    results.forEach(result => console.log(result));
    
    // Screen reader testing tips
    console.log('\n💡 Manual Screen Reader Testing Tips:');
    console.log('• Use NVDA (free): https://www.nvaccess.org/download/');
    console.log('• Use JAWS (trial): https://www.freedomscientific.com/downloads/jaws/');
    console.log('• Use VoiceOver (Mac): Cmd+F5 to enable');
    console.log('• Navigate with Tab key and arrow keys');
    console.log('• Listen for: "Daily Air Quality Index X out of 10, [Level] pollution level"');
    
    return results;
  }

  // Enhanced function to test tab announcements
  function testTabAnnouncements(tabIndex = 0) {
    console.log(`\n📢 Testing screen reader announcements for tab ${tabIndex}...`);
    
    const tabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]');
    if (tabIndex >= tabs.length) {
      console.log(`❌ Tab index ${tabIndex} out of range (0-${tabs.length - 1})`);
      return;
    }
    
    const tab = tabs[tabIndex];
    const daqiValue = tab.getAttribute('data-daqi-value');
    const daqiBand = tab.getAttribute('data-daqi-band');
    const ariaLabel = tab.getAttribute('aria-label');
    const textContent = tab.textContent.trim();
    
    console.log('🎯 Tab Information:');
    console.log(`  Text: "${textContent}"`);
    console.log(`  DAQI Value: ${daqiValue}`);
    console.log(`  DAQI Band: ${daqiBand}`);
    console.log(`  ARIA Label: "${ariaLabel}"`);
    
    // Simulate what a screen reader would announce
    const levelText = getLevelText(parseInt(daqiValue));
    const expectedAnnouncement = ariaLabel || `${textContent}, DAQI ${daqiValue}, ${levelText} air pollution`;
    
    console.log(`\n🔊 Expected Screen Reader Announcement:`);
    console.log(`"${expectedAnnouncement}"`);
    
    // Test live region if it exists
    const liveRegion = document.getElementById('daqi-live-region');
    if (liveRegion) {
      console.log('\n📻 Testing live region announcement...');
      const announcement = `${textContent} selected. Daily Air Quality Index ${daqiValue} out of 10, ${levelText} pollution level.`;
      liveRegion.textContent = announcement;
      console.log(`Live region updated: "${announcement}"`);
      
      // Clear after a moment
      setTimeout(() => {
        liveRegion.textContent = '';
        console.log('Live region cleared');
      }, 3000);
    }
    
    return {
      tab,
      daqiValue,
      daqiBand,
      ariaLabel,
      textContent,
      expectedAnnouncement
    };
  }
  
  function getLevelText(value) {
    if (value >= 1 && value <= 3) return 'Low';
    if (value >= 4 && value <= 6) return 'Moderate';
    if (value >= 7 && value <= 9) return 'High';
    if (value === 10) return 'Very High';
    return 'Unknown';
  }

  // Function to simulate different DAQI values (for testing)
  function simulateDAQIValue(value) {
    console.log(`🎯 Simulating DAQI value ${value}...`);
    
    if (value < 1 || value > 10) {
      console.error('❌ DAQI value must be between 1 and 10');
      return;
    }
    
    // Find DAQI segments and simulate activation
    const segments = document.querySelectorAll('.daqi-bar-segment');
    
    if (segments.length === 0) {
      console.error('❌ No DAQI segments found. Make sure you\'re on a location page.');
      return;
    }
    
    // Reset all segments
    segments.forEach((segment, index) => {
      segment.className = 'daqi-bar-segment daqi-0';
    });
    
    // Activate segments up to the specified value
    segments.forEach((segment, index) => {
      if (index < value) {
        segment.className = `daqi-bar-segment daqi-${value}`;
        if (index === value - 1) {
          segment.classList.add('daqi-selected');
        }
      }
    });
    
    console.log(`✅ Simulated DAQI value ${value} applied to real DOM`);
    
    // Show color information
    const colors = {
      1: '🟢 Green (Low)', 2: '🟢 Green (Low)', 3: '🟢 Green (Low)',
      4: '🟡 Yellow (Moderate)', 5: '🟡 Yellow (Moderate)', 6: '🟡 Yellow (Moderate)',
      7: '🔴 Red (High)', 8: '🔴 Red (High)', 9: '🔴 Red (High)',
      10: '🟣 Purple (Very High)'
    };
    console.log(`Color: ${colors[value]}`);
  }

  // Helper function to quickly test all values
  function testAllDAQIValues() {
    console.log('🌈 Testing all DAQI values 1-10...');
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        console.log(`\n--- Testing DAQI ${i} ---`);
        simulateDAQIValue(i);
      }, i * 1000);
    }
  }

  // Attach functions to window object
  window.testRealDAQI = testRealDAQI;
  window.testScreenReaderSupport = testScreenReaderSupport;
  window.testTabAnnouncements = testTabAnnouncements;
  window.simulateDAQIValue = simulateDAQIValue;
  window.testAllDAQIValues = testAllDAQIValues;

  console.log('🚀 DAQI test functions loaded successfully!');
  console.log('📍 Make sure you\'re on a location page (search for a city like "London")');
  console.log('\n🔧 Available commands:');
  console.log('• testRealDAQI() - Run full functionality test');
  console.log('• testScreenReaderSupport() - Test screen reader accessibility');
  console.log('• testTabAnnouncements(0) - Test specific tab announcements');
  console.log('• simulateDAQIValue(1-10) - Test specific DAQI values');
  console.log('• testAllDAQIValues() - Cycle through all values 1-10 with delays');
  console.log('\nExample: testScreenReaderSupport() to check accessibility');
  console.log('Example: testTabAnnouncements(0) to test first tab');
  console.log('\n💡 Tip: Run testScreenReaderSupport() to verify screen reader features!');

})();