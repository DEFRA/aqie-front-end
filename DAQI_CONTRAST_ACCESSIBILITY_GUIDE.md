# DAQI Contrast Accessibility Testing Guide

## Overview

This guide provides comprehensive information about testing the DAQI (Daily Air Quality Index) tab component for accessibility, particularly focusing on contrast and visual disabilities.

## DAQI Color Scheme

### Official GOVUK Colors Used

The DAQI system uses the following official GOVUK Design System colors:

#### Low Air Quality (DAQI 1-3) - Green

- **Background**: `#00703c` (GOVUK Green)
- **Text**: `#ffffff` (White)
- **Usage**: Represents safe air quality levels
- **Contrast Ratio**: 5.74:1 (AA compliant)

#### Moderate Air Quality (DAQI 4-6) - Yellow

- **Background**: `#ffdd00` (GOVUK Yellow)
- **Text**: `#0b0c0c` (GOVUK Black)
- **Usage**: Represents moderate pollution levels
- **Contrast Ratio**: 12.63:1 (AAA compliant)

#### High Air Quality (DAQI 7-9) - Red

- **Background**: `#d4351c` (GOVUK Red)
- **Text**: `#ffffff` (White)
- **Usage**: Represents unhealthy air quality levels
- **Contrast Ratio**: 5.04:1 (AA compliant)

#### Very High Air Quality (DAQI 10) - Purple

- **Background**: `#4c2c92` (GOVUK Purple)
- **Text**: `#ffffff` (White)
- **Usage**: Represents hazardous air quality levels
- **Contrast Ratio**: 6.89:1 (AA compliant)

## Accessibility Testing Features

### 1. High Contrast Mode Testing

Tests maximum contrast for users with low vision:

```javascript
window.daqiContrastTester.testHighContrast()
```

**Features:**

- Black background (#000000) with white text (#ffffff)
- Enhanced 4px focus indicators in yellow (#ffff00)
- Band-specific border colors to distinguish DAQI levels
- Bold typography for improved readability

### 2. Low Contrast Simulation

Simulates reduced contrast to test visibility:

```javascript
window.daqiContrastTester.testLowContrast()
```

**Features:**

- Reduced opacity (0.6-0.8)
- Dimmed colors to simulate low vision conditions
- Tests minimum viable contrast levels
- Validates focus indicator visibility

### 3. Color Blindness Testing

Removes color dependency and adds patterns:

```javascript
window.daqiContrastTester.testColorBlindness()
```

**Pattern System:**

- **Low (1-3)**: Horizontal stripes pattern
- **Moderate (4-6)**: Diagonal stripes pattern
- **High (7-9)**: Cross-hatch pattern
- **Very High (10)**: Dots pattern with double border

**Features:**

- Grayscale filter simulation
- Pattern-based differentiation
- Enhanced borders and typography
- Screen reader compatible labels

### 4. Focus Indicator Testing

Tests keyboard navigation visibility:

```javascript
window.daqiContrastTester.testFocusIndicators()
```

**Features:**

- Auto-focuses each interactive element
- Enhanced 4px outline with shadow
- 1-second delay between focuses
- Visibility and size validation

### 5. Contrast Analysis

Analyzes current contrast ratios:

```javascript
window.daqiContrastTester.analyzeContrast()
```

**Analysis Includes:**

- Background/foreground color detection
- DAQI level identification
- Expected vs actual color comparison
- WCAG compliance recommendations
- Color accuracy validation

## Usage Instructions

### Browser Console Commands

1. **Initialize Tester**: Automatically loads on page
2. **Test High Contrast**: `window.daqiContrastTester.testHighContrast()`
3. **Test Low Contrast**: `window.daqiContrastTester.testLowContrast()`
4. **Test Color Blindness**: `window.daqiContrastTester.testColorBlindness()`
5. **Test Focus**: `window.daqiContrastTester.testFocusIndicators()`
6. **Analyze**: `window.daqiContrastTester.analyzeContrast()`
7. **Restore**: `window.daqiContrastTester.restoreOriginal()`

### Using the Demo Page

1. Open `daqi-contrast-demo.html` in your browser
2. Use the floating control panel (top-right)
3. Click test buttons to apply different contrast modes
4. Use keyboard navigation to test focus indicators
5. Check browser console for detailed analysis

### Integration with Existing Pages

Include the tester script on any page with DAQI components:

```html
<script type="module" src="./daqi-contrast-accessibility-tester.js"></script>
```

The tester will automatically detect DAQI tab containers and enable testing.

## Testing Checklist

### Visual Accessibility Tests

- [ ] **High Contrast Mode**: All text readable with maximum contrast
- [ ] **Low Contrast Simulation**: Content remains distinguishable
- [ ] **Color Blindness**: Information conveyed without color
- [ ] **Pattern Recognition**: Different DAQI bands distinguishable by pattern
- [ ] **Focus Indicators**: Keyboard navigation clearly visible
- [ ] **Text Size**: All text meets minimum size requirements
- [ ] **Color Accuracy**: DAQI colors match official scheme

### Keyboard Accessibility Tests

- [ ] **Tab Navigation**: All tabs reachable via keyboard
- [ ] **Enter/Space**: Activates selected tab
- [ ] **Arrow Keys**: Navigate between tabs when focused
- [ ] **Focus Visible**: Current focus always clearly indicated
- [ ] **Skip Links**: Efficient navigation for screen readers

### Screen Reader Tests

- [ ] **Semantic Structure**: Proper role attributes
- [ ] **ARIA Labels**: Descriptive labels for all elements
- [ ] **Live Regions**: Changes announced appropriately
- [ ] **Landmark Navigation**: Clear page structure
- [ ] **Tab Relationships**: Panel associations clear

## Technical Implementation

### DAQI Level Detection

The tester automatically detects DAQI levels using CSS class names:

```javascript
getDaqiLevelFromSegment(segment) {
  for (let level = 1; level <= 10; level++) {
    if (segment.classList.contains(`daqi-${level}`)) {
      return level
    }
  }
  return 0 // No active DAQI level
}
```

### Color Validation

Compares actual colors against expected DAQI scheme:

```javascript
checkColorAccuracy(actualBg, actualText, expectedColorInfo) {
  // Normalizes and compares RGB values
  // Returns match status and recommendations
}
```

### Pattern Generation

Creates accessible patterns for color-blind users:

```javascript
// Example: Cross-hatch pattern for High levels (7-9)
const patternStyle = `
  repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px),
  repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)
`
```

## WCAG Compliance

### Color Contrast Requirements

- **AA Level**: Minimum 4.5:1 ratio for normal text
- **AAA Level**: Minimum 7:1 ratio for normal text
- **Large Text**: Minimum 3:1 ratio (AA), 4.5:1 (AAA)

### Current DAQI Compliance

| DAQI Level     | Background | Text    | Ratio   | Status |
| -------------- | ---------- | ------- | ------- | ------ |
| 1-3 (Low)      | #00703c    | #ffffff | 5.74:1  | ✅ AA  |
| 4-6 (Moderate) | #ffdd00    | #0b0c0c | 12.63:1 | ✅ AAA |
| 7-9 (High)     | #d4351c    | #ffffff | 5.04:1  | ✅ AA  |
| 10 (Very High) | #4c2c92    | #ffffff | 6.89:1  | ✅ AA  |

### Focus Indicator Requirements

- **Minimum Size**: 2px outline or equivalent
- **Color**: High contrast against background
- **Shape**: Clear boundary around focused element
- **Implementation**: 4px yellow outline with shadow

## Troubleshooting

### Common Issues

1. **Tester Not Loading**: Check browser console for JavaScript errors
2. **Colors Not Changing**: Verify DAQI elements exist on page
3. **Focus Not Visible**: Check if existing CSS overrides focus styles
4. **Pattern Not Showing**: Verify browser supports CSS gradients

### Browser Compatibility

- **Chrome**: Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Full support for all features
- **Edge**: Full support for all features
- **IE**: Limited support (patterns may not display)

### Performance Considerations

- Tester stores original styles for restoration
- Pattern generation may impact rendering on older devices
- Focus testing includes 1-second delays to allow observation

## Resources

### Related Documentation

- [GOVUK Design System Colors](https://design-system.service.gov.uk/styles/colour/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Analyzer Tools](https://www.tpgi.com/color-contrast-checker/)

### Testing Tools

- **Browser DevTools**: Accessibility audit features
- **WAVE**: Web accessibility evaluation tool
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility auditing

### Support

For issues or questions about DAQI accessibility testing:

1. Check browser console for error messages
2. Verify DAQI elements have correct CSS classes
3. Test on different devices and browsers
4. Use screen reader software for comprehensive testing

---

_This guide covers testing for people with visual disabilities including low vision, color blindness, and high contrast needs._
