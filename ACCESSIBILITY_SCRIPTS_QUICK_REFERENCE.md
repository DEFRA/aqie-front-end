# Accessibility Testing Scripts - Quick Reference

## 🚀 How to Fix "function is not defined" Errors

The accessibility testing functions are split across different scripts. You need to load the correct script first:

### **Script Loading Order:**

#### 1. **For DAQI Basic Testing** - Load `test-real-daqi.js`:
```javascript
// Copy and paste test-real-daqi.js into console first, then run:
testRealDAQI()
testScreenReaderSupport()
testTabAnnouncements(0)
simulateDAQIValue(5)
```

#### 2. **For High Contrast Testing** - Load `test-high-contrast-accessibility.js`:
```javascript
// Copy and paste test-high-contrast-accessibility.js into console first, then run:
showHighContrastTestingGuide()     // ← This function is in this script
simulateHighContrastMode()
testDAQIHighContrastVisibility()
testFocusVisibility()
testHighContrastMode()
removeHighContrastSimulation()
```

#### 3. **For Screen Reader Demo** - Load `daqi-screenreader-demo.js`:
```javascript
// Copy and paste daqi-screenreader-demo.js into console first, then run:
demoScreenReaderExperience()
showScreenReaderTestingGuide()
testDAQIValueAnnouncements()
```

## 🔧 **Function Reference by Script**

### **test-real-daqi.js** Functions:
- `testRealDAQI()`
- `testScreenReaderSupport()`
- `testTabAnnouncements(tabIndex)`
- `simulateDAQIValue(value)`
- `testAllDAQIValues()`

### **test-high-contrast-accessibility.js** Functions:
- `showHighContrastTestingGuide()` ← **YOU NEED THIS SCRIPT**
- `simulateHighContrastMode()`
- `removeHighContrastSimulation()`
- `testDAQIHighContrastVisibility()`
- `testFocusVisibility()`
- `testHighContrastMode()`

### **daqi-screenreader-demo.js** Functions:
- `demoScreenReaderExperience()`
- `showScreenReaderTestingGuide()`
- `testDAQIValueAnnouncements()`

## ⚡ **Quick Fix for Your Error**

You tried to run `showHighContrastTestingGuide()` but haven't loaded the high contrast script yet.

**Solution:**
1. Copy the entire contents of `test-high-contrast-accessibility.js`
2. Paste it into the browser console
3. Press Enter to load the script
4. Then run: `showHighContrastTestingGuide()`

## 🎯 **Complete Testing Workflow**

```javascript
// Step 1: Load and test basic DAQI functionality
// Copy test-real-daqi.js → Paste → Enter, then:
testRealDAQI()

// Step 2: Load and test high contrast
// Copy test-high-contrast-accessibility.js → Paste → Enter, then:
showHighContrastTestingGuide()
simulateHighContrastMode()

// Step 3: Load and test screen reader demo  
// Copy daqi-screenreader-demo.js → Paste → Enter, then:
demoScreenReaderExperience()
```

## 📋 **Script File Locations**

- 📄 `test-real-daqi.js` - Main DAQI testing
- 📄 `test-high-contrast-accessibility.js` - High contrast testing ← **YOU NEED THIS**
- 📄 `daqi-screenreader-demo.js` - Screen reader demo
- 📄 `HIGH_CONTRAST_TESTING_GUIDE.md` - Documentation

## 💡 **Pro Tip**

Each script includes a loading message when pasted. Look for:
- "🧪 DAQI Real Functionality Test Script Loading..."
- "🎨 High Contrast Accessibility Testing Script Loading..." ← **For your function**
- "🔊 DAQI Screen Reader Demo Loading..."

This confirms the script loaded successfully and functions are available.