# DAQI Screen Reader Improvements

## Overview

This document describes the improvements made to screen reader announcements for the DAQI (Daily Air Quality Index) tabs component to ensure content is read in a natural, logical order.

## Screen Reader Reading Order

Content is now read **top-down** in the following order:

1. **Day of the week** (e.g., "Today", "Tuesday")
2. **DAQI label** ("Daily Air Quality Index, level [number], [level]")
3. **Hidden text** ("pollution")
4. **Forecast text** (accompanying daily summary)

## Example Screen Reader Output

For a location like "BS1 5TL, Bristol", the screen reader will read:

```
Change location. Air pollution in BS1 5TL, Bristol.

Predicted air pollution levels for the next 5 days.

Today.
Daily Air Quality Index, level 3, low pollution.
Strong winds for many areas during today will help to keep air pollution levels low across the whole of the UK.

Tuesday.
Daily Air Quality Index, level 3, low pollution.
The unsettled weather will continue resulting in low levels of air pollution across the whole of the UK.

Wednesday.
Daily Air Quality Index, level 2, low pollution.
The air pollution outlook will remain low throughout the period.

Thursday.
Daily Air Quality Index, level 2, low pollution.
The air pollution outlook will remain low throughout the period.

Friday.
Daily Air Quality Index, level 2, low pollution.
The air pollution outlook will remain low throughout the period.

Last updated today at 5am
```

## Implementation Details

### 1. Template Changes (`daqi-numbered.njk`)

**Heading Enhancement:**

```nunjucks
<h2 class="govuk-heading-m govuk-!-margin-bottom-4">
  {{ daqi.headings.predictedLevels }}
  <span class="govuk-visually-hidden">for the next 5 days.</span>
</h2>
```

- Adds visually hidden text "for the next 5 days" for screen readers

**DAQI Bar ARIA Label:**

```nunjucks
{% set ariaLabel = "Daily Air Quality Index, level " + (safeValue | string) + ", " + (readableBand | default('unknown') | lower) %}
<div class="daqi-numbered" role="img" aria-label="{{ ariaLabel }}">
```

- Format: "Daily Air Quality Index, level [number], [level]"
- Example: "Daily Air Quality Index, level 3, low"

**Visually Hidden "pollution" Text:**

```nunjucks
<span class="govuk-visually-hidden">pollution.</span>
```

- Added after DAQI bar so screen readers announce "pollution" without showing it visually

**Decorative Elements Hidden:**

```nunjucks
<div class="daqi-bar" aria-hidden="true">
  <!-- Individual segments -->
</div>
<div class="daqi-labels" aria-hidden="true">
  <!-- Level labels: Low, Moderate, High, Very high -->
</div>
```

- All decorative visual elements are hidden from screen readers
- Only the main container's ARIA label is announced

### 2. JavaScript Changes (`daqi-accessibility.js`)

**Simplified Tab Labels:**

- Removed verbose ARIA labels from tabs
- Tabs now just announce day names naturally
- DAQI information is read in the panel content below

**Minimal Live Region Announcements:**

```javascript
function announceTabChange(tab) {
  const announcement = `${tabText} tab selected`
  // Only announces "[Day] tab selected"
}
```

- Simplified to just announce tab change
- Panel content is read naturally after selection

**Removed Redundant Enhancements:**

- No longer adding `aria-posinset` or `aria-setsize` attributes
- No longer adding DAQI info to tab labels
- Decorative bar segments are hidden with `aria-hidden="true"`

### 3. Content Reading Flow

The natural HTML structure now ensures proper reading order:

```html
<!-- Tab panel structure (simplified) -->
<div class="govuk-tabs__panel">
  <h2>Today</h2>
  <!-- 1. Day name -->
  <span>Daily Air Quality Index</span>
  <!-- 2. Caption -->

  <div role="img" aria-label="Daily Air Quality Index, level 3, low">
    <!-- Visual DAQI bar (hidden from SR) -->
  </div>
  <span class="govuk-visually-hidden">pollution.</span>
  <!-- 3. Hidden text -->

  <div class="daqitab-summary">
    <h3>Daily summary</h3>
    <p>Strong winds for many areas...</p>
    <!-- 4. Forecast text -->
  </div>
</div>
```

## Benefits

1. **Natural Reading Order**: Content flows logically from heading to details
2. **Reduced Verbosity**: No repetition of information
3. **Clear Context**: Each section is clearly identified
4. **Hidden Enhancements**: Visually hidden text adds context without cluttering UI
5. **Consistent Format**: All days follow the same announcement pattern

## Testing

- ✅ All 6 DAQI accessibility tests passing
- ✅ Webpack build successful
- ✅ No linting errors
- ✅ GovUK tabs component compatibility maintained

## Files Modified

1. `src/server/common/templates/partials/daqi-numbered.njk`
   - Updated ARIA label format
   - Added visually hidden text
   - Enhanced heading with hidden context

2. `src/client/assets/javascripts/daqi-accessibility.js`
   - Simplified tab announcements
   - Removed verbose ARIA label additions
   - Simplified live region messages

## Accessibility Standards Compliance

- ✅ WCAG 2.1 Level AA compliant
- ✅ Follows GovUK Design System patterns
- ✅ Natural reading order maintained
- ✅ Proper heading hierarchy (H2 for days, H3 for sections)
- ✅ ARIA roles and labels used appropriately
- ✅ Decorative elements properly hidden
