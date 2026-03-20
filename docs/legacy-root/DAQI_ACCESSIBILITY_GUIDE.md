# DAQI Accessibility Features

This document describes the comprehensive accessibility enhancements implemented for the DAQI (Daily Air Quality Index) tabs component.

## 🎯 **Overview**

The DAQI component now provides full accessibility support including:

- **Keyboard navigation** with proper tab order and roving tabindex
- **Screen reader announcements** with detailed index information
- **ARIA attributes** for proper semantic structure
- **Focus management** for optimal user experience

## 🎹 **Keyboard Navigation**

### Tab Navigation

- **Tab key**: Moves focus into and out of the tab group
- **Arrow keys**: Navigate between tabs (Left/Right, Up/Down)
- **Home/End**: Jump to first/last tab
- **Enter/Space**: Activate the focused tab

### Roving Tabindex Pattern

- Only one tab is tabbable at a time (`tabindex="0"`)
- Other tabs have `tabindex="-1"`
- Arrow keys move focus and update tabindex accordingly
- Follows ARIA best practices for tab widgets

### DAQI Bar Segments

- Each segment is focusable (`tabindex="0"`)
- **Enter/Space**: Announces segment details
- Proper focus indicators for keyboard users

## 📢 **Screen Reader Announcements**

### Tab Selection Announcements

When a user selects a tab, screen readers announce:

```
"Today selected. Tab 1 of 3. Daily Air Quality Index number 2, Low pollution level."
```

### Focus Announcements

When navigating with arrow keys:

```
"Tab 2, DAQI number 5, Moderate"
```

### DAQI Segment Announcements

When focusing on bar segments:

```
"DAQI segment 2, Low level, active"
```

## 🏷️ **ARIA Attributes**

### Tab Enhancements

```html
<a
  href="#today"
  class="govuk-tabs__tab"
  data-daqi-value="2"
  data-daqi-band="low"
  aria-label="Today, tab 1 of 3, DAQI number 2, Low air pollution"
  aria-posinset="1"
  aria-setsize="3"
  tabindex="0"
>
  Today
</a>
```

### DAQI Bar Segments

```html
<div
  class="daqi-bar-segment daqi-2"
  role="img"
  aria-label="DAQI segment 2, Low level, active"
  tabindex="0"
>
  <span class="daqi-number">2</span>
</div>
```

### Live Regions

```html
<!-- For tab change announcements -->
<div
  id="daqi-live-region"
  aria-live="polite"
  aria-atomic="true"
  class="govuk-visually-hidden"
></div>

<!-- For focus announcements -->
<div
  id="daqi-focus-region"
  aria-live="assertive"
  aria-atomic="true"
  class="govuk-visually-hidden"
></div>
```

## 🔧 **Implementation Details**

### Key Functions

#### `enhanceTabInteractions()`

- Adds comprehensive ARIA labels
- Sets up position information (`aria-posinset`, `aria-setsize`)
- Binds click handlers for announcements

#### `enhanceKeyboardNavigation()`

- Implements roving tabindex pattern
- Handles arrow key navigation
- Manages focus announcements
- Integrates DAQI bar accessibility

#### `enhanceDaqiBarAccessibility()`

- Makes segments keyboard accessible
- Adds semantic roles and labels
- Provides interaction feedback

#### `announceTabChange()`

- Creates detailed selection announcements
- Includes tab position and DAQI value
- Uses format: "number X, Level" as requested

### Initialization

```javascript
// Auto-initializes on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDAQIAccessibility()
})

// Re-enhances after tab changes
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('govuk-tabs__tab')) {
    // Accessibility features are re-applied
  }
})
```

## 🧪 **Testing**

### Automated Tests

- Comprehensive test suite in `test/daqi-accessibility.test.js`
- Tests keyboard navigation, ARIA attributes, and announcements
- Validates proper roving tabindex behavior

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Tab key enters tab group at first tab
- [ ] Arrow keys navigate between tabs
- [ ] Home/End jump to first/last tab
- [ ] Enter/Space activate tabs
- [ ] Tab key exits tab group after last tab

#### Screen Reader Testing

- [ ] Tab announcements include position ("tab 1 of 3")
- [ ] DAQI values announced as "number X, Level"
- [ ] Active/inactive status clear for segments
- [ ] Live regions provide timely feedback

#### Focus Management

- [ ] Only one tab tabbable at a time
- [ ] Focus indicators visible
- [ ] Focus moves logically through interface
- [ ] No focus traps or lost focus

## 🎨 **Visual Design Considerations**

### Focus Indicators

- Relies on GOV.UK Design System focus styles
- High contrast focus rings for accessibility
- Clear visual indication of keyboard focus

### Screen Reader Only Content

- Uses `govuk-visually-hidden` class
- Content available to assistive technology
- No visual impact on design

## 📱 **Responsive Behavior**

The accessibility features work across all viewport sizes:

- **Mobile**: Touch and keyboard both supported
- **Tablet**: Full keyboard navigation available
- **Desktop**: Enhanced keyboard shortcuts (Home/End)

## 🔧 **Browser Support**

Compatible with:

- All modern browsers with JavaScript enabled
- ARIA-compatible screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation users
- Voice control software

## 📚 **Standards Compliance**

Follows established accessibility guidelines:

- **WCAG 2.1 AA** compliance
- **ARIA Authoring Practices Guide** tab patterns
- **GOV.UK Design System** accessibility standards
- **Section 508** requirements

## 🚀 **Usage Example**

```javascript
// Features initialize automatically, but can be manually triggered:
if (window.daqiAccessibility) {
  // Re-enhance after dynamic content changes
  window.daqiAccessibility.enhanceDaqiBarAccessibility()

  // Test announcements
  const tab = document.querySelector('.govuk-tabs__tab')
  window.daqiAccessibility.announceTabChange(tab)
}
```

This implementation ensures that all users, regardless of their interaction method or assistive technology, can effectively navigate and understand the DAQI component's air quality information.
