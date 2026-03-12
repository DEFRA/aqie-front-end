# Mobile DAQI Border Visibility Fix

## Issue

The right borders of the DAQI boxes on mobile were not as visible as the left borders, causing an unbalanced visual appearance where the right edge appeared cut off.

## Root Cause

The DAQI segments use `box-shadow: inset 0 0 0 2px` for their borders, which are drawn inside the element. On mobile, the rightmost segments were getting their right edges cut off due to insufficient spacing within the container.

## Solution

### 1. Added Right Padding to Mobile Tab Panels (\_aq-tabs.scss)

```scss
.daqi-numbered {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  // Add padding to ensure right borders are visible
  padding-right: govuk-spacing(2); // 8px padding to show right borders
  box-sizing: border-box;
}
```

### 2. Added Margins to DAQI Bars for Border Space (\_daqitable.scss)

```scss
@include govuk-media-query($until: tablet) {
  grid-template-columns: var(--daqi-columns, repeat(9, 1fr) 2fr);
  max-width: 100%;
  overflow-x: auto;
  // Add margin to ensure borders are visible on both sides
  margin-left: 2px; // Space for left borders
  margin-right: 2px; // Space for right borders
}
```

### 3. Updated Max-Width Calculation for Additional Spacing

```scss
@include govuk-media-query($until: tablet) {
  width: 100%;
  max-width: calc(100vw - 48px); // Account for mobile padding + border spacing
  min-width: 320px;
  box-sizing: border-box;
}
```

### 4. Aligned Labels Grid with Same Margins

```scss
@include govuk-media-query($until: tablet) {
  grid-template-columns: var(--daqi-columns, repeat(9, 1fr) 2fr);
  max-width: 100%;
  // Match the bar's margins for perfect alignment
  margin-left: 2px; // Align with bar left margin
  margin-right: 2px; // Align with bar right margin
}
```

## Result

- Right borders of DAQI boxes are now fully visible on mobile
- Balanced visual appearance with equal spacing on both left and right sides
- Proper containment within mobile viewport
- Maintained grid alignment between bars and labels
- Preserved tablet+ functionality

## Technical Details

- Added 8px right padding to mobile tab panels for border visibility
- Added 2px left/right margins to DAQI bars and labels for border spacing
- Updated viewport calculation from `100vw - 32px` to `100vw - 48px` to account for additional spacing
- Ensured `box-sizing: border-box` for proper dimension calculations
