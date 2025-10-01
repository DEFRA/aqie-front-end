# High Contrast / Inverted Colors Accessibility Testing Guide

## 🎨 What is High Contrast Mode?

High contrast mode (also called "forced colors" or "inverted colors") is an accessibility feature that:
- Replaces website colors with high-contrast system colors
- Helps users with visual impairments, light sensitivity, or reading difficulties
- Is used by millions of people with conditions like dyslexia, cataracts, or low vision

## 🔧 How to Enable High Contrast Mode

### Windows
1. **Keyboard shortcut**: `Left Alt + Left Shift + Print Screen`
2. **Settings method**:
   - Press `Win + U` → Ease of Access
   - Select "High contrast" → Toggle "Turn on high contrast"
   - Choose theme: "High Contrast Black" or "High Contrast White"

### macOS
1. **System Preferences** → Accessibility → Display
2. Check "Increase contrast"
3. Optional: Check "Invert colors" for extreme testing

### Linux (GNOME)
1. **Settings** → Universal Access
2. Turn on "High Contrast"

## 🌐 Browser Testing Tools

### Chrome DevTools
1. Press `F12` → **Rendering** tab (bottom panel)
2. Find "Emulate CSS media feature forced-colors"
3. Select "**active**" to simulate high contrast

### Firefox DevTools
1. Press `F12` → **Inspector** → Rules panel
2. Click media query icon
3. Add: `@media (forced-colors: active)`

## 🧪 Testing with Our Script

1. **Navigate to a location page** (e.g., search for "London")
2. **Open browser console** (`F12`)
3. **Copy and paste** the `test-high-contrast-accessibility.js` script
4. **Run testing commands**:

```javascript
// Quick testing workflow:
showHighContrastTestingGuide()     // Complete instructions
simulateHighContrastMode()         // Apply simulation
testDAQIHighContrastVisibility()   // Test DAQI components
testFocusVisibility()              // Test focus indicators
removeHighContrastSimulation()     // Remove simulation
```

## ✅ What to Check for DAQI Components

### 1. **DAQI Bar Visibility**
- [ ] All DAQI segments are clearly distinguishable
- [ ] Numbers (1-10) are readable against backgrounds
- [ ] Current air quality level stands out

### 2. **Tab Navigation**
- [ ] Selected tab is clearly different from unselected tabs
- [ ] Tab text is readable
- [ ] Day names and DAQI values are visible

### 3. **Focus Indicators**
- [ ] All interactive elements show focus outline
- [ ] Focus outline is thick enough (minimum 2px)
- [ ] Focus outline contrasts with background

### 4. **Text Content**
- [ ] All pollution level text (Low/Moderate/High/Very High) is readable
- [ ] Health advice text maintains good contrast
- [ ] No text disappears or becomes illegible

## 🚨 Common High Contrast Issues

### ❌ **Problems to Look For:**
- **Invisible text**: Same color as background
- **Missing focus indicators**: Can't see where you are
- **Identical DAQI segments**: All look the same
- **Color-only information**: No text alternatives
- **Poor contrast ratios**: Hard to read

### ✅ **Good High Contrast Design:**
- **System colors**: Uses Canvas, CanvasText, Highlight
- **Clear boundaries**: Borders around all elements
- **Text alternatives**: Information not conveyed by color alone
- **Visible focus**: Strong, contrasting focus indicators
- **Consistent patterns**: Similar elements look similar

## 🎯 DAQI-Specific Testing Checklist

```
□ DAQI level 1-3 (Green/Low) segments are distinguishable
□ DAQI level 4-6 (Yellow/Moderate) segments are distinguishable  
□ DAQI level 7-9 (Red/High) segments are distinguishable
□ DAQI level 10 (Purple/Very High) segment is distinguishable
□ Current day tab clearly stands out from forecast tabs
□ All DAQI values (1-10) are readable as numbers
□ Pollution level text (Low/Moderate/High/Very High) is visible
□ Tab navigation works with keyboard only
□ Focus moves logically through interactive elements
□ Screen reader announcements include pollution levels
□ No critical information depends only on color
```

## 🔍 Advanced Testing Techniques

### 1. **Grayscale Test**
Convert page to grayscale to check if information is still clear:
```javascript
document.documentElement.style.filter = 'grayscale(100%)';
```

### 2. **Color Blind Simulation**
Test for different types of color blindness:
```javascript
// Protanopia (red-blind)
document.documentElement.style.filter = 'hue-rotate(180deg)';
```

### 3. **Zoom Testing**
Test at 200% zoom to ensure layout doesn't break:
```javascript
document.body.style.zoom = '2.0';
```

## 📱 Mobile High Contrast Testing

### iOS
1. **Settings** → Accessibility → Display & Text Size
2. Turn on "Increase Contrast"
3. Test in Safari mobile

### Android
1. **Settings** → Accessibility → Visibility enhancements
2. Turn on "High contrast text" or "Color inversion"
3. Test in Chrome mobile

## 🛠️ CSS Implementation for High Contrast

Our DAQI components already include forced-colors support:

```scss
@media (forced-colors: active) {
  .daqi-numbered {
    background-color: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
  }
  
  .daqi-bar-segment {
    background-color: WindowText;
    color: Window;
    border: 1px solid CanvasText;
  }
  
  .govuk-tabs__tab[aria-selected="true"] {
    background-color: Highlight;
    color: HighlightText;
    border: 2px solid HighlightText;
  }
}
```

## 📊 Testing Results Documentation

When testing, document:
- **Date of test**
- **Operating system and version**
- **Browser and version** 
- **High contrast theme used**
- **Issues found**
- **WCAG compliance level achieved**

## 🎯 Success Criteria

Your DAQI component passes high contrast testing if:
- ✅ All DAQI levels are distinguishable without color
- ✅ All interactive elements have visible focus indicators
- ✅ All text maintains sufficient contrast (4.5:1 minimum)
- ✅ No information is conveyed by color alone
- ✅ Navigation works entirely with keyboard
- ✅ Screen readers announce all pollution levels clearly

## 📚 Resources

- [WCAG 2.2 High Contrast Guidelines](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [Microsoft High Contrast Design](https://docs.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes)
- [CSS forced-colors Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Remember**: High contrast mode testing is not optional - it's required for WCAG 2.2 AA compliance and affects millions of users worldwide!