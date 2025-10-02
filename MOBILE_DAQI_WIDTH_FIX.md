# Mobile DAQI Width Fix

## Issue

The DAQI bars in mobile tab view had inconsistent width behavior:

- The first element (Today) displayed correctly with proper cell sizing
- Subsequent days (Tomorrow, Wednesday, etc.) had cell 10 bleeding out of the container on the right side

## Root Cause

The issue was that the mobile tab layout was showing all panels stacked, but the DAQI bar width constraints were not being properly applied to each individual panel. The `.defra-aq-tabs` container had a fixed width of 650px, and individual DAQI bars within mobile panels weren't respecting mobile viewport constraints.

## Solution

### 1. Mobile Container Width Override (\_aq-tabs.scss)

```scss
@include govuk-media-query($until: tablet) {
  // Override container width on mobile to use full available space
  width: 100%;

  .govuk-tabs__panel {
    // Ensure panel content respects mobile constraints
    width: 100%;
    max-width: 100%;
    overflow-x: hidden; // Prevent horizontal overflow

    // Constrain DAQI bars within mobile panels
    .daqi-numbered {
      width: 100%;
      max-width: 100%;
      overflow-x: auto; // Allow horizontal scrolling if needed
    }
  }
}
```

### 2. Enhanced Mobile DAQI Constraints (\_daqitable.scss)

```scss
.daqi-numbered {
  // Mobile-specific constraints for DAQI bars within tab panels
  @include govuk-media-query($until: tablet) {
    // Ensure mobile DAQI bars never exceed viewport width
    width: 100%;
    max-width: calc(100vw - 32px); // Account for mobile padding
    min-width: 320px; // Minimum usable width
    box-sizing: border-box;
  }
}
```

### 3. Mobile-Friendly Grid Columns

```scss
.daqi-bar {
  // Mobile-specific grid adjustments for tab panels
  @include govuk-media-query($until: tablet) {
    // Use smaller, more mobile-friendly column sizes
    grid-template-columns: var(--daqi-columns, repeat(9, 1fr) 2fr);
    max-width: 100%;
    overflow-x: auto;
  }
}

.daqi-labels {
  // Mobile-specific grid adjustments for tab panels
  @include govuk-media-query($until: tablet) {
    // Use same mobile grid as the bar for perfect alignment
    grid-template-columns: var(--daqi-columns, repeat(9, 1fr) 2fr);
    max-width: 100%;
  }
}
```

## Result

- All DAQI bars in mobile tab view now respect the mobile viewport width
- Cell 10 no longer bleeds out of the container
- Consistent sizing behavior across all days (Today, Tomorrow, etc.)
- Maintains responsive design principles with proper mobile constraints
- Preserves tablet+ functionality with original fixed widths

## Technical Details

- Changed from fixed pixel widths (51px, 100px) to flexible fr units (1fr, 2fr) on mobile
- Added viewport-aware constraints with `calc(100vw - 32px)`
- Ensured all mobile panels inherit proper width constraints
- Maintained grid alignment between bars and labels
