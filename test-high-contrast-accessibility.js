// High Contrast / Inverted Colors Accessibility Testing Script
// This script helps test how your DAQI components work with forced colors/high contrast mode

(function() {
  'use strict';
  
  console.log('🎨 High Contrast Accessibility Testing Script Loading...');

  // Test high contrast mode compatibility
  function testHighContrastMode() {
    console.log('\n🌓 Testing High Contrast Mode Compatibility');
    console.log('==========================================');
    
    const results = [];
    
    // 1. Check if forced-colors is supported
    const supportsMediaQuery = window.matchMedia('(forced-colors: active)').media !== 'not all';
    if (supportsMediaQuery) {
      results.push('✅ Browser supports forced-colors media query');
    } else {
      results.push('⚠️ Browser may not fully support forced-colors media query');
    }
    
    // 2. Check current forced-colors state
    const isHighContrast = window.matchMedia('(forced-colors: active)').matches;
    if (isHighContrast) {
      results.push('🔥 HIGH CONTRAST MODE IS CURRENTLY ACTIVE');
    } else {
      results.push('💡 High contrast mode is not active (normal mode)');
    }
    
    // 3. Check DAQI components for forced-colors CSS
    const daqiElements = document.querySelectorAll('.daqi-numbered, .daqi-bar-segment, .govuk-tabs__tab');
    if (daqiElements.length > 0) {
      results.push(`✅ Found ${daqiElements.length} DAQI elements to test`);
      
      // Test each element for high contrast compatibility
      daqiElements.forEach((element, index) => {
        const computedStyle = getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        const border = computedStyle.border;
        
        results.push(`\n   Element ${index + 1}: ${element.className}`);
        results.push(`   Background: ${backgroundColor}`);
        results.push(`   Text Color: ${color}`);
        results.push(`   Border: ${border}`);
        
        // Check for system colors (indicates high contrast compatibility)
        const systemColors = ['windowtext', 'window', 'highlight', 'highlighttext', 'buttonface', 'buttontext'];
        const usesSystemColors = systemColors.some(sysColor => 
          backgroundColor.toLowerCase().includes(sysColor) || 
          color.toLowerCase().includes(sysColor)
        );
        
        if (usesSystemColors) {
          results.push(`   ✅ Uses system colors (high contrast compatible)`);
        }
      });
    } else {
      results.push('❌ No DAQI elements found - navigate to a location page first');
    }
    
    // 4. Test specific DAQI high contrast CSS
    const testHighContrastCSS = () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (forced-colors: active) {
          .test-forced-colors {
            background-color: Canvas !important;
            color: CanvasText !important;
            border: 1px solid CanvasText !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      const testElement = document.createElement('div');
      testElement.className = 'test-forced-colors';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.textContent = 'Test';
      document.body.appendChild(testElement);
      
      const computedStyle = getComputedStyle(testElement);
      const isUsingSystemColors = 
        computedStyle.backgroundColor.includes('rgba') ||
        computedStyle.color.includes('rgba') ||
        computedStyle.backgroundColor === 'canvas' ||
        computedStyle.color === 'canvastext';
      
      // Cleanup
      document.head.removeChild(style);
      document.body.removeChild(testElement);
      
      return isUsingSystemColors;
    };
    
    if (testHighContrastCSS()) {
      results.push('✅ CSS forced-colors media query working correctly');
    } else {
      results.push('⚠️ CSS forced-colors may not be applying system colors');
    }
    
    console.log('\n🎨 High Contrast Test Results:');
    results.forEach(result => console.log(result));
    
    return { isHighContrast, results };
  }

  // Simulate high contrast mode for testing
  function simulateHighContrastMode() {
    console.log('\n🔄 Simulating High Contrast Mode...');
    console.log('===================================');
    
    // Create a style element to simulate forced colors
    const simulationStyle = document.createElement('style');
    simulationStyle.id = 'high-contrast-simulation';
    simulationStyle.textContent = `
      /* Simulate Windows High Contrast Mode */
      .daqi-numbered,
      .daqi-bar-segment,
      .govuk-tabs__tab,
      .govuk-tabs__panel {
        background-color: black !important;
        color: white !important;
        border: 1px solid white !important;
        outline: none !important;
      }
      
      .daqi-bar-segment.daqi-1,
      .daqi-bar-segment.daqi-2,
      .daqi-bar-segment.daqi-3,
      .daqi-bar-segment.daqi-4,
      .daqi-bar-segment.daqi-5,
      .daqi-bar-segment.daqi-6,
      .daqi-bar-segment.daqi-7,
      .daqi-bar-segment.daqi-8,
      .daqi-bar-segment.daqi-9,
      .daqi-bar-segment.daqi-10 {
        background-color: white !important;
        color: black !important;
        border: 2px solid white !important;
      }
      
      .govuk-tabs__tab[aria-selected="true"] {
        background-color: yellow !important;
        color: black !important;
        border: 2px solid yellow !important;
      }
      
      .daqi-band {
        color: white !important;
        background-color: transparent !important;
        border: 1px solid white !important;
      }
      
      /* Ensure focus is visible */
      *:focus {
        outline: 3px solid yellow !important;
        outline-offset: 2px !important;
      }
    `;
    
    document.head.appendChild(simulationStyle);
    
    console.log('✅ High contrast simulation applied');
    console.log('💡 All DAQI colors are now simulated as high contrast');
    console.log('🔍 Look for:');
    console.log('   • White text on black backgrounds');
    console.log('   • Clear borders around all elements');
    console.log('   • Yellow highlights for selected tabs');
    console.log('   • Visible focus indicators');
    
    // Set a flag to track simulation
    window.highContrastSimulationActive = true;
    
    return simulationStyle;
  }

  // Remove high contrast simulation
  function removeHighContrastSimulation() {
    const simulationStyle = document.getElementById('high-contrast-simulation');
    if (simulationStyle) {
      simulationStyle.remove();
      window.highContrastSimulationActive = false;
      console.log('✅ High contrast simulation removed');
    } else {
      console.log('⚠️ No high contrast simulation to remove');
    }
  }

  // Test DAQI visibility in high contrast
  function testDAQIHighContrastVisibility() {
    console.log('\n👁️ Testing DAQI Visibility in High Contrast');
    console.log('===========================================');
    
    const daqiSegments = document.querySelectorAll('.daqi-bar-segment');
    const daqiTabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]');
    const daqiBands = document.querySelectorAll('.daqi-band');
    
    if (daqiSegments.length === 0) {
      console.log('❌ No DAQI segments found - navigate to a location page first');
      return;
    }
    
    console.log(`🔍 Testing ${daqiSegments.length} DAQI segments:`);
    
    daqiSegments.forEach((segment, index) => {
      const computedStyle = getComputedStyle(segment);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      const border = computedStyle.border;
      const visibility = computedStyle.visibility;
      const display = computedStyle.display;
      
      console.log(`\n   Segment ${index + 1}:`);
      console.log(`   Classes: ${segment.className}`);
      console.log(`   Background: ${backgroundColor}`);
      console.log(`   Text Color: ${color}`);
      console.log(`   Border: ${border}`);
      console.log(`   Visible: ${visibility !== 'hidden' && display !== 'none'}`);
      
      // Check contrast ratio (simplified)
      const hasGoodContrast = backgroundColor !== color && 
                             backgroundColor !== 'transparent' && 
                             color !== 'transparent';
      
      if (hasGoodContrast) {
        console.log(`   ✅ Good contrast between background and text`);
      } else {
        console.log(`   ⚠️ Potential contrast issue`);
      }
    });
    
    // Test tab visibility
    if (daqiTabs.length > 0) {
      console.log(`\n🔍 Testing ${daqiTabs.length} DAQI tabs:`);
      
      daqiTabs.forEach((tab, index) => {
        const computedStyle = getComputedStyle(tab);
        const isSelected = tab.getAttribute('aria-selected') === 'true';
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        
        console.log(`\n   Tab ${index + 1}: ${tab.textContent.trim()}`);
        console.log(`   Selected: ${isSelected}`);
        console.log(`   Background: ${backgroundColor}`);
        console.log(`   Text Color: ${color}`);
        
        if (isSelected) {
          console.log(`   ✅ Selected tab should be clearly distinguishable`);
        }
      });
    }
  }

  // Comprehensive high contrast testing guide
  function showHighContrastTestingGuide() {
    console.log('\n📚 Complete High Contrast Testing Guide');
    console.log('======================================');
    
    console.log('\n🖥️ Operating System Settings:');
    console.log('\n   Windows:');
    console.log('   1. Press Win + U to open Ease of Access');
    console.log('   2. Select "High contrast" from the left panel');
    console.log('   3. Toggle "Turn on high contrast" switch');
    console.log('   4. Choose a high contrast theme (e.g., "High Contrast Black")');
    console.log('   5. Test your website in the browser');
    
    console.log('\n   macOS:');
    console.log('   1. Apple menu > System Preferences > Accessibility');
    console.log('   2. Select "Display" from the left panel');
    console.log('   3. Check "Increase contrast"');
    console.log('   4. Also try "Invert colors" for extreme testing');
    
    console.log('\n   Linux (GNOME):');
    console.log('   1. Settings > Universal Access');
    console.log('   2. Turn on "High Contrast"');
    
    console.log('\n🌐 Browser Developer Tools Testing:');
    console.log('\n   Chrome DevTools:');
    console.log('   1. F12 > Sources tab > Rendering tab (bottom panel)');
    console.log('   2. Find "Emulate CSS media feature forced-colors"');
    console.log('   3. Select "active" to simulate high contrast');
    
    console.log('\n   Firefox:');
    console.log('   1. F12 > Inspector > Rules panel');
    console.log('   2. Click the media query icon');
    console.log('   3. Add: @media (forced-colors: active)');
    
    console.log('\n✅ What to Test:');
    console.log('   • All text is clearly readable');
    console.log('   • DAQI segments are distinguishable');
    console.log('   • Focus indicators are visible');
    console.log('   • Interactive elements have clear boundaries');
    console.log('   • Selected tabs stand out from unselected ones');
    console.log('   • No information is conveyed by color alone');
    
    console.log('\n🚨 Common Issues to Check:');
    console.log('   • Text that disappears (same color as background)');
    console.log('   • DAQI segments that all look identical');
    console.log('   • Missing focus indicators');
    console.log('   • Insufficient contrast ratios');
    console.log('   • Icons or symbols that become invisible');
    
    console.log('\n🎯 DAQI-Specific Checks:');
    console.log('   • DAQI level numbers are clearly visible');
    console.log('   • Band labels (Low/Moderate/High/Very High) are readable');
    console.log('   • Current day tab is distinguishable from forecast tabs');
    console.log('   • Pollution level colors have text alternatives');
  }

  // Test focus visibility in high contrast
  function testFocusVisibility() {
    console.log('\n🎯 Testing Focus Visibility in High Contrast');
    console.log('==========================================');
    
    const focusableElements = document.querySelectorAll(
      '.govuk-tabs__tab, .daqi-bar-segment, button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      console.log('❌ No focusable elements found');
      return;
    }
    
    console.log(`🔍 Found ${focusableElements.length} focusable elements`);
    console.log('💡 This will cycle through elements and check focus visibility...');
    
    let currentIndex = 0;
    
    const testFocusElement = () => {
      if (currentIndex >= focusableElements.length) {
        console.log('✅ Focus visibility test completed');
        return;
      }
      
      const element = focusableElements[currentIndex];
      element.focus();
      
      setTimeout(() => {
        const computedStyle = getComputedStyle(element);
        const outline = computedStyle.outline;
        const outlineWidth = computedStyle.outlineWidth;
        const outlineColor = computedStyle.outlineColor;
        const boxShadow = computedStyle.boxShadow;
        
        console.log(`\n   Element ${currentIndex + 1}: ${element.tagName}.${element.className}`);
        console.log(`   Outline: ${outline}`);
        console.log(`   Outline Width: ${outlineWidth}`);
        console.log(`   Outline Color: ${outlineColor}`);
        console.log(`   Box Shadow: ${boxShadow}`);
        
        const hasFocusIndicator = 
          outline !== 'none' || 
          outlineWidth !== '0px' || 
          boxShadow !== 'none';
        
        if (hasFocusIndicator) {
          console.log(`   ✅ Focus indicator present`);
        } else {
          console.log(`   ⚠️ No visible focus indicator`);
        }
        
        currentIndex++;
        setTimeout(testFocusElement, 1000);
      }, 500);
    };
    
    testFocusElement();
  }

  // Attach functions to window
  window.testHighContrastMode = testHighContrastMode;
  window.simulateHighContrastMode = simulateHighContrastMode;
  window.removeHighContrastSimulation = removeHighContrastSimulation;
  window.testDAQIHighContrastVisibility = testDAQIHighContrastVisibility;
  window.showHighContrastTestingGuide = showHighContrastTestingGuide;
  window.testFocusVisibility = testFocusVisibility;

  console.log('🚀 High Contrast Accessibility Testing loaded!');
  console.log('\n🎨 Available commands:');
  console.log('• testHighContrastMode() - Check current high contrast status');
  console.log('• simulateHighContrastMode() - Apply high contrast simulation');
  console.log('• removeHighContrastSimulation() - Remove simulation');
  console.log('• testDAQIHighContrastVisibility() - Test DAQI visibility');
  console.log('• showHighContrastTestingGuide() - Complete testing instructions');
  console.log('• testFocusVisibility() - Test focus indicators');
  console.log('\n🚀 Quick start: showHighContrastTestingGuide()');
  console.log('🎯 For immediate testing: simulateHighContrastMode()');

})();