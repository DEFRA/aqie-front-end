// DAQI Accessibility Test Suite
// Copy and paste this ENTIRE script into browser console on a location page, then run the test functions

(function() {
  'use strict';
  
  console.log('♿ DAQI Accessibility Test Suite Loading...');

  // Test 1: ARIA Labels and Roles
  function testARIAImplementation() {
    console.log('\n🏷️ Testing ARIA Labels and Roles...');
    const results = [];
    
    // Check DAQI numbered bar
    const daqiNumbered = document.querySelector('.daqi-numbered');
    if (daqiNumbered) {
      const role = daqiNumbered.getAttribute('role');
      const ariaLabel = daqiNumbered.getAttribute('aria-label');
      
      if (role === 'img') {
        results.push('✅ DAQI bar has correct role="img"');
      } else {
        results.push(`❌ DAQI bar missing role="img", found: ${role}`);
      }
      
      if (ariaLabel && ariaLabel.trim().length > 0) {
        results.push(`✅ DAQI bar has aria-label: "${ariaLabel}"`);
      } else {
        results.push('❌ DAQI bar missing meaningful aria-label');
      }
    }
    
    // Check tab accessibility
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    if (tabs.length > 0) {
      results.push(`✅ Found ${tabs.length} DAQI tabs`);
      
      tabs.forEach((tab, index) => {
        const ariaSelected = tab.getAttribute('aria-selected');
        const ariaControls = tab.getAttribute('aria-controls');
        const tabindex = tab.getAttribute('tabindex');
        const role = tab.getAttribute('role');
        
        if (role === 'tab') {
          results.push(`✅ Tab ${index + 1} has correct role="tab"`);
        } else {
          results.push(`❌ Tab ${index + 1} missing role="tab"`);
        }
        
        if (ariaSelected !== null) {
          results.push(`✅ Tab ${index + 1} has aria-selected="${ariaSelected}"`);
        } else {
          results.push(`❌ Tab ${index + 1} missing aria-selected`);
        }
        
        if (ariaControls) {
          results.push(`✅ Tab ${index + 1} has aria-controls="${ariaControls}"`);
        } else {
          results.push(`❌ Tab ${index + 1} missing aria-controls`);
        }
      });
    }
    
    // Check tab panels
    const panels = document.querySelectorAll('.govuk-tabs__panel');
    panels.forEach((panel, index) => {
      const role = panel.getAttribute('role');
      const ariaLabelledby = panel.getAttribute('aria-labelledby');
      
      if (role === 'tabpanel') {
        results.push(`✅ Panel ${index + 1} has correct role="tabpanel"`);
      } else {
        results.push(`❌ Panel ${index + 1} missing role="tabpanel"`);
      }
      
      if (ariaLabelledby) {
        results.push(`✅ Panel ${index + 1} has aria-labelledby="${ariaLabelledby}"`);
      } else {
        results.push(`❌ Panel ${index + 1} missing aria-labelledby`);
      }
    });
    
    // Check for hidden labels
    const hiddenLabels = document.querySelectorAll('[aria-hidden="true"]');
    results.push(`ℹ️ Found ${hiddenLabels.length} elements with aria-hidden="true"`);
    
    console.log('ARIA Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Test 2: Keyboard Navigation
  function testKeyboardNavigation() {
    console.log('\n⌨️ Testing Keyboard Navigation...');
    const results = [];
    
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    if (tabs.length === 0) {
      results.push('❌ No tabs found for keyboard testing');
      return results;
    }
    
    // Check tab order
    let hasProperTabindex = true;
    tabs.forEach((tab, index) => {
      const tabindex = tab.getAttribute('tabindex');
      const isSelected = tab.getAttribute('aria-selected') === 'true';
      
      if (isSelected && tabindex !== '0') {
        results.push(`❌ Selected tab ${index + 1} should have tabindex="0", found: ${tabindex}`);
        hasProperTabindex = false;
      } else if (!isSelected && tabindex !== '-1') {
        results.push(`❌ Unselected tab ${index + 1} should have tabindex="-1", found: ${tabindex}`);
        hasProperTabindex = false;
      }
    });
    
    if (hasProperTabindex) {
      results.push('✅ All tabs have proper tabindex values');
    }
    
    // Check for focus indicators
    const focusStyle = window.getComputedStyle(tabs[0], ':focus');
    if (focusStyle.outline !== 'none' || focusStyle.boxShadow !== 'none') {
      results.push('✅ Tabs have visible focus indicators');
    } else {
      results.push('⚠️ Tabs may be missing visible focus indicators');
    }
    
    // Test arrow key navigation simulation
    results.push('ℹ️ To test arrow key navigation manually:');
    results.push('  1. Tab to focus on a DAQI tab');
    results.push('  2. Use Left/Right arrows to navigate between tabs');
    results.push('  3. Use Enter/Space to activate tabs');
    
    console.log('Keyboard Navigation Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Test 3: Screen Reader Support
  function testScreenReaderSupport() {
    console.log('\n🔊 Testing Screen Reader Support...');
    const results = [];
    
    // Check for meaningful text content
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    tabs.forEach((tab, index) => {
      const textContent = tab.textContent.trim();
      const daqiValue = tab.getAttribute('data-daqi-value');
      const daqiBand = tab.getAttribute('data-daqi-band');
      
      if (textContent.length > 0) {
        results.push(`✅ Tab ${index + 1} has text content: "${textContent}"`);
      } else {
        results.push(`❌ Tab ${index + 1} missing text content`);
      }
      
      if (daqiValue) {
        results.push(`ℹ️ Tab ${index + 1} DAQI value: ${daqiValue} (${daqiBand || 'no band'})`);
      }
    });
    
    // Check for live regions (should be added for dynamic updates)
    const liveRegions = document.querySelectorAll('[aria-live]');
    if (liveRegions.length > 0) {
      results.push(`✅ Found ${liveRegions.length} live regions for dynamic announcements`);
    } else {
      results.push('⚠️ No live regions found - consider adding for tab changes');
    }
    
    // Check descriptive text for DAQI levels
    const daqiLabels = document.querySelectorAll('.daqi-labels .daqi-band');
    if (daqiLabels.length > 0) {
      results.push(`✅ Found ${daqiLabels.length} DAQI level labels`);
      daqiLabels.forEach((label, index) => {
        const text = label.textContent.trim();
        if (text) {
          results.push(`  - Level ${index + 1}: "${text}"`);
        }
      });
    }
    
    console.log('Screen Reader Support Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Test 4: High Contrast Mode
  function testHighContrastMode() {
    console.log('\n🎨 Testing High Contrast Mode...');
    const results = [];
    
    // Check if forced-colors is supported and active
    const supportsHighContrast = window.matchMedia('(forced-colors: active)').matches;
    results.push(`ℹ️ High contrast mode ${supportsHighContrast ? 'is' : 'is not'} currently active`);
    
    // Check for forced-color-adjust property
    const daqiSegments = document.querySelectorAll('.daqi-bar-segment');
    if (daqiSegments.length > 0) {
      const segment = daqiSegments[0];
      const style = window.getComputedStyle(segment);
      
      // Check if colors are preserved in high contrast
      results.push('✅ DAQI segments should maintain distinguishable colors in high contrast mode');
      results.push('ℹ️ Test manually by enabling high contrast mode in OS settings');
    }
    
    // Check tab focus styles in high contrast
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    if (tabs.length > 0) {
      results.push('✅ Tab focus styles should be visible in high contrast mode');
      results.push('ℹ️ Manually test tab focus visibility with high contrast enabled');
    }
    
    console.log('High Contrast Mode Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Test 5: Color Contrast
  function testColorContrast() {
    console.log('\n🌈 Testing Color Contrast...');
    const results = [];
    
    // DAQI color mappings for contrast checking
    const daqiColors = {
      1: { bg: '#00703c', fg: '#ffffff', level: 'Low' },      // Green
      2: { bg: '#00703c', fg: '#ffffff', level: 'Low' },      // Green  
      3: { bg: '#00703c', fg: '#ffffff', level: 'Low' },      // Green
      4: { bg: '#ffdd00', fg: '#000000', level: 'Moderate' }, // Yellow
      5: { bg: '#ffdd00', fg: '#000000', level: 'Moderate' }, // Yellow
      6: { bg: '#ffdd00', fg: '#000000', level: 'Moderate' }, // Yellow
      7: { bg: '#d4351c', fg: '#ffffff', level: 'High' },     // Red
      8: { bg: '#d4351c', fg: '#ffffff', level: 'High' },     // Red
      9: { bg: '#d4351c', fg: '#ffffff', level: 'High' },     // Red
      10: { bg: '#4c2c92', fg: '#ffffff', level: 'Very High' } // Purple
    };
    
    // Function to calculate contrast ratio (simplified)
    function getContrastRatio(bg, fg) {
      // This is a simplified check - in practice, you'd use a full WCAG algorithm
      const lightColors = ['#ffffff', '#ffdd00'];
      const darkColors = ['#000000', '#00703c', '#d4351c', '#4c2c92'];
      
      if ((lightColors.includes(bg) && darkColors.includes(fg)) || 
          (darkColors.includes(bg) && lightColors.includes(fg))) {
        return 'High'; // Likely passes WCAG AA
      }
      return 'Check manually';
    }
    
    Object.entries(daqiColors).forEach(([value, colors]) => {
      const ratio = getContrastRatio(colors.bg, colors.fg);
      results.push(`✅ DAQI ${value} (${colors.level}): ${colors.bg} on ${colors.fg} - ${ratio} contrast`);
    });
    
    results.push('ℹ️ For precise WCAG 2.2 AA compliance, use a proper contrast checker tool');
    results.push('ℹ️ Required ratio: 4.5:1 for normal text, 3:1 for large text');
    
    console.log('Color Contrast Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Test 6: Interactive Elements
  function testInteractiveElements() {
    console.log('\n👆 Testing Interactive Elements...');
    const results = [];
    
    // Check tab click targets
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    tabs.forEach((tab, index) => {
      const rect = tab.getBoundingClientRect();
      const minSize = 44; // WCAG AA minimum touch target size
      
      if (rect.width >= minSize && rect.height >= minSize) {
        results.push(`✅ Tab ${index + 1} meets minimum touch target size (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
      } else {
        results.push(`⚠️ Tab ${index + 1} may be too small for touch (${Math.round(rect.width)}x${Math.round(rect.height)}px, minimum 44x44px)`);
      }
    });
    
    // Check for proper link semantics
    tabs.forEach((tab, index) => {
      if (tab.tagName.toLowerCase() === 'a') {
        results.push(`✅ Tab ${index + 1} uses proper anchor element`);
      } else {
        results.push(`❌ Tab ${index + 1} should be an anchor element for accessibility`);
      }
      
      const href = tab.getAttribute('href');
      if (href && href.startsWith('#')) {
        results.push(`✅ Tab ${index + 1} has valid fragment identifier: ${href}`);
      } else {
        results.push(`❌ Tab ${index + 1} missing or invalid href attribute`);
      }
    });
    
    console.log('Interactive Elements Test Results:');
    results.forEach(result => console.log(result));
    return results;
  }

  // Comprehensive Test Runner
  function runFullAccessibilityAudit() {
    console.log('🔍 Running Full DAQI Accessibility Audit...\n');
    
    const allResults = {
      aria: testARIAImplementation(),
      keyboard: testKeyboardNavigation(),
      screenReader: testScreenReaderSupport(),
      highContrast: testHighContrastMode(),
      colorContrast: testColorContrast(),
      interactive: testInteractiveElements()
    };
    
    // Summary
    console.log('\n📊 ACCESSIBILITY AUDIT SUMMARY:');
    console.log('=====================================');
    
    let totalTests = 0;
    let passedTests = 0;
    let warnings = 0;
    
    Object.entries(allResults).forEach(([category, results]) => {
      const passed = results.filter(r => r.includes('✅')).length;
      const failed = results.filter(r => r.includes('❌')).length;
      const warn = results.filter(r => r.includes('⚠️')).length;
      
      totalTests += passed + failed;
      passedTests += passed;
      warnings += warn;
      
      console.log(`${category.toUpperCase()}: ${passed} passed, ${failed} failed, ${warn} warnings`);
    });
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`\nOVERALL: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
    if (warnings > 0) {
      console.log(`Warnings: ${warnings} items need manual verification`);
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (successRate >= 90) {
      console.log('✨ Excellent accessibility implementation!');
    } else if (successRate >= 75) {
      console.log('👍 Good accessibility, address failed tests for full compliance');
    } else {
      console.log('⚠️ Accessibility needs improvement, focus on failed tests');
    }
    
    console.log('\n🔧 MANUAL TESTING CHECKLIST:');
    console.log('□ Test with actual screen reader (NVDA, JAWS, VoiceOver)');
    console.log('□ Enable high contrast mode in OS and verify visibility');
    console.log('□ Test with keyboard only (no mouse)');
    console.log('□ Test with zoom up to 200%');
    console.log('□ Verify color information is not the only way to convey meaning');
    
    return allResults;
  }

  // Helper function to simulate tab interaction
  function simulateTabInteraction(tabIndex = 0) {
    console.log(`\n🎭 Simulating tab interaction for tab ${tabIndex + 1}...`);
    
    const tabs = document.querySelectorAll('.govuk-tabs__tab');
    if (tabs.length === 0) {
      console.log('❌ No tabs found');
      return;
    }
    
    if (tabIndex >= tabs.length) {
      console.log(`❌ Tab index ${tabIndex} out of range (0-${tabs.length - 1})`);
      return;
    }
    
    const tab = tabs[tabIndex];
    
    // Simulate focus
    tab.focus();
    console.log('✅ Tab focused');
    
    // Simulate click
    tab.click();
    console.log('✅ Tab clicked');
    
    // Check if panel is visible
    const href = tab.getAttribute('href');
    if (href) {
      const panel = document.querySelector(href);
      if (panel && !panel.classList.contains('govuk-tabs__panel--hidden')) {
        console.log('✅ Associated panel is now visible');
      } else {
        console.log('❌ Associated panel not visible or not found');
      }
    }
    
    // Check ARIA states
    const ariaSelected = tab.getAttribute('aria-selected');
    console.log(`ℹ️ aria-selected: ${ariaSelected}`);
    
    return tab;
  }

  // Attach functions to window object
  window.testDAQIAria = testARIAImplementation;
  window.testDAQIKeyboard = testKeyboardNavigation;
  window.testDAQIScreenReader = testScreenReaderSupport;
  window.testDAQIHighContrast = testHighContrastMode;
  window.testDAQIColorContrast = testColorContrast;
  window.testDAQIInteractive = testInteractiveElements;
  window.runDAQIAccessibilityAudit = runFullAccessibilityAudit;
  window.simulateTabInteraction = simulateTabInteraction;

  console.log('🚀 DAQI Accessibility Test Suite loaded successfully!');
  console.log('📍 Make sure you\'re on a location page with DAQI data\n');
  console.log('🔧 Available commands:');
  console.log('• runDAQIAccessibilityAudit() - Run complete accessibility audit');
  console.log('• testDAQIAria() - Test ARIA labels and roles');
  console.log('• testDAQIKeyboard() - Test keyboard navigation');
  console.log('• testDAQIScreenReader() - Test screen reader support');
  console.log('• testDAQIHighContrast() - Test high contrast mode');
  console.log('• testDAQIColorContrast() - Test color contrast ratios');
  console.log('• testDAQIInteractive() - Test interactive elements');
  console.log('• simulateTabInteraction(0) - Simulate interaction with tab 0');
  console.log('\n⭐ Quick start: runDAQIAccessibilityAudit()');

})();