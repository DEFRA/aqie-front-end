# Forecast Warning Testing Guide

## Prerequisites

- Server must be running: `npm start`
- Use location ID: `AQ0104` (or any valid location)

## Test Cases

# Testing Forecast Warning Feature

## Overview

The forecast warning displays when air pollution levels are predicted to be "High" (DAQI 7-9) or "Very High" (DAQI 10) in the upcoming days.

## Test Scenarios

### 1. High Pollution Warning (DAQI 7-9)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=7&mockDay=day3

**Expected Result:**

- Warning text appears at the top of the DAQI section (after title, before colored index)
- Message format: "High levels of air pollution are predicted in this location from [Weekday]"
- Yellow warning icon visible
- The weekday should match the tab label for day3 (2 days from today)

**Alternative URLs:**

- http://localhost:3000/location/AQ0104?mockLevel=8&mockDay=day2
- http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day4

### 2. Very High Pollution Warning (DAQI 10)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=10&mockDay=day2

**Expected Result:**

- Warning text appears at the top of the DAQI section
- Message format: "Very high levels of air pollution are predicted in this location from [Weekday]"
- Yellow warning icon visible
- The weekday should match the tab label for day2 (tomorrow)

### 3. Low Pollution - No Warning (DAQI 1-3)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=2

**Expected Result:**

- NO warning text displayed
- Page displays normally with low pollution indicators
- DAQI colored bar shows low level (green)

### 4. Moderate Pollution - No Warning (DAQI 4-6)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=5

**Expected Result:**

- NO warning text displayed
- Page displays normally with moderate pollution indicators
- DAQI colored bar shows moderate level (yellow/amber)

### 5. Welsh Translation Test

**URL:** http://localhost:3000/cy/location/AQ0104?mockLevel=7&mockDay=day3

**Expected Result:**

- Warning text in Welsh: "Rhagwelir lefelau Uchel o lygredd aer yn y lleoliad hwn o [Dydd Weekday]"
- Yellow warning icon visible
- Welsh weekday names (e.g., "Dydd Llun" for Monday, "Dydd Mawrth" for Tuesday)
- Positioned at top of DAQI section

### 6. Welsh Very High Test

**URL:** http://localhost:3000/cy/location/AQ0104?mockLevel=10&mockDay=day2

**Expected Result:**

- Warning text in Welsh: "Rhagwelir lefelau Uchel iawn o lygredd aer yn y lleoliad hwn o [Dydd Weekday]"
- Yellow warning icon visible
- Welsh weekday name for tomorrow

## Testing with Specific Days

### Mock Day Parameter

Use `?mockDay=X` to specify which forecast day should have the high pollution level:

- `mockDay=today` - Apply high pollution to current day
- `mockDay=day2` - Apply to tomorrow (tab shows abbreviated weekday)
- `mockDay=day3` - Apply to 2 days from now
- `mockDay=day4` - Apply to 3 days from now
- `mockDay=day5` - Apply to 4 days from now

**Example:** To test warning showing "Friday" when today is Wednesday:

```
http://localhost:3000/location/AQ0104?mockLevel=9&mockDay=day3
```

### Without mockDay Parameter

If you don't specify `mockDay`, the mock level applies to ALL forecast days, so the warning will always show "Today".

**Example:**

```
http://localhost:3000/location/AQ0104?mockLevel=9
```

Result: Warning says "High levels of air pollution are predicted in this location from Today"

## Visual Checks

1. **Position**: Warning should be immediately after the page title `<h1>` and before the DAQI colored index bar
2. **Styling**: Should use GOV.UK Design System warning component (yellow background, black text, exclamation icon)
3. **Weekday Match**: The weekday in the warning should match the label on the corresponding forecast tab
4. **Conditional Display**: Warning only appears for DAQI levels 7-10, never for 1-6

## Clearing Mock Data

To clear the mock level and return to real data:

**Option 1: Clear parameter**

```
http://localhost:3000/location/AQ0104?mockLevel=clear
```

**Option 2: Clear mockDay**

```
http://localhost:3000/location/AQ0104?mockDay=clear
```

Or simply visit without the `mockLevel` and `mockDay` parameters:

```
http://localhost:3000/location/AQ0104
```

### ✅ Test 2: High Level Warning (DAQI 8-9)

**URL:**

- http://localhost:3000/location/AQ0104?mockLevel=8
- http://localhost:3000/location/AQ0104?mockLevel=9

**Expected Result:**

- ⚠️ Warning box appears
- Text: "High levels of air pollution are predicted in this location from [Weekday]."

### ✅ Test 3: Very High Level Warning (DAQI 10)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=10

**Expected Result:**

- ⚠️ Warning box appears
- Text: "Very high levels of air pollution are predicted in this location from [Weekday]."

### ✅ Test 4: No Warning for Low Levels (DAQI 1-3)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=2

**Expected Result:**

- ❌ No warning box appears
- Page displays normally

### ✅ Test 5: No Warning for Moderate Levels (DAQI 4-6)

**URL:** http://localhost:3000/location/AQ0104?mockLevel=5

**Expected Result:**

- ❌ No warning box appears
- Page displays normally

### ✅ Test 6: Welsh Translation - High Level

**URL:** http://localhost:3000/cy/location/AQ0104?mockLevel=7

**Expected Result:**

- ⚠️ Warning box appears
- Text in Welsh: "Rhagwelir lefelau Uchel o lygredd aer yn y lleoliad hwn o [Welsh Weekday]."
- Welsh weekday format (e.g., "Dydd Llun" for Monday)

### ✅ Test 7: Welsh Translation - Very High Level

**URL:** http://localhost:3000/cy/location/AQ0104?mockLevel=10

**Expected Result:**

- ⚠️ Warning box appears
- Text in Welsh: "Rhagwelir lefelau Uchel Iawn o lygredd aer yn y lleoliad hwn o [Welsh Weekday]."

## Visual Checks

### Position

- Warning should appear:
  - After the "Latest pollutant levels at monitoring sites near this location" heading
  - Before the pollutant table tabs
  - After the horizontal rule (`<hr>`)

### Styling

- Yellow warning icon (exclamation mark in triangle)
- Bold text
- Proper GOV.UK styling (govukWarningText component)
- Sufficient spacing above and below

## Test with Different Days

To test different weekdays, you can:

1. Change your system date temporarily
2. Or check the actual forecast data to see when High/Very High is predicted naturally

## Clearing Mock

To return to normal data:

```
http://localhost:3000/location/AQ0104?mockLevel=clear
```

Or simply visit without the `mockLevel` parameter:

```
http://localhost:3000/location/AQ0104
```

## Automated Testing Checklist

- [ ] High level (7-9) shows warning
- [ ] Very high level (10) shows warning
- [ ] Low level (1-3) shows no warning
- [ ] Moderate level (4-6) shows no warning
- [ ] English text is correct
- [ ] Welsh text is correct
- [ ] Weekday is displayed correctly
- [ ] Warning appears in correct position
- [ ] GOV.UK styling is correct
- [ ] Mobile responsive (test on narrow screen)
