# Dynamic Hour in Daily Summary Implementation

## Overview

Changed the hardcoded "5am" hour in the daily summary date to be dynamic based on the actual `issue_date` timestamp from the forecast API.

## Changes Made

### 1. Helper Function (`src/server/locations/helpers/middleware-helpers.js`)

- Added `getIssueTime(issueDate)` function
- Extracts time from `issue_date` in `H:mm` format (e.g., "5:34", "14:05")
- Returns "5:00" as fallback for invalid/missing dates
- Added to exports

### 2. Text Updates

**English** (`src/server/data/en/daqi-and-pollutants.js`):

- Changed: `b: 'Latest at 5am on'`
- To: `b: 'Latest at'`

**Welsh** (`src/server/data/cy/daqi-and-pollutants-welsh.js`):

- Changed: `b: 'Y diweddaraf am 5am ymlaen'`
- To: `b: 'Y diweddaraf am'`

### 3. Middleware Updates (`src/server/locations/helpers/middleware-helpers.js`)

**In `handleSingleMatch`:**

- Added: `const issueTime = getIssueTime(getDailySummary?.issue_date)`
- Added `issueTime` to session data

**In `handleMultipleMatches`:**

- Added: `const issueTime = getIssueTime(getDailySummary?.issue_date)`
- Added `issueTime` to session data

### 4. Controller Updates (`src/server/location-id/controller.js`)

- Imported `getIssueTime` from middleware-helpers
- Added `issueTime` calculation in two places:
  1. When `showSummaryDate` is undefined and needs to be calculated
  2. In test mode when recalculating after changes
- Added logging for `issueTime` value

### 5. View Renderer (`src/server/location-id/helpers/renderLocationDetailsView.js`)

- Added `showSummaryDate: locationData.showSummaryDate`
- Added `issueTime: locationData.issueTime`
- Passes these to the template

### 6. Template Update (`src/server/locations/location.njk`)

- Changed display from: `{{ daqi.pageTexts.b }} {{ summaryDate }}`
- To: `{{ daqi.pageTexts.b }} {{ issueTime }} on {{ summaryDate }}`

## Result

### Before:

```
Latest at 5am on 13 November 2025
```

### After:

```
Latest at 5:34 on 13 November 2025
```

The hour is now dynamic and reflects the actual time from the `issue_date` field in the daily summary data.

## Format Specification

- Time format: `H:mm` (without leading zero for hour)
- Examples:
  - 5:00
  - 5:34
  - 14:05
  - 23:59

## Testing

All existing tests pass. The `getIssueTime` function is exported and available for testing.

## Fallback Behavior

If `issue_date` is missing or invalid, defaults to "5:00" to maintain backwards compatibility.
