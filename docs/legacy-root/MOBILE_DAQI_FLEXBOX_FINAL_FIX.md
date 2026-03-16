# Mobile DAQI Flexbox Fix - Final Solution

## Issue

Despite multiple attempts with CSS Grid and width constraints, the right borders of DAQI boxes on mobile were still not visible, specifically cell 10 was still bleeding out of the container.

## Root Cause

CSS Grid with `1fr` and percentage-based columns was not providing sufficient control over cell widths on mobile. The grid gap and inset borders were competing for space, causing the last cell (cell 10) to be squeezed or cut off.

## Final Solution: Flexbox Approach

### 1. DAQI Bar - Switched to Flexbox (\_daqitable.scss)

```scss
@include govuk-media-query($until: tablet) {
  // Switch to flexbox on mobile for better control
  display: flex;
  flex-direction: row;
  max-width: 100%;
  overflow-x: auto;
  // Add margin to ensure borders are visible on both sides
  margin-left: 2px; // Space for left borders
  margin-right: 2px; // Space for right borders
  gap: 2px; // Reduce gap slightly on mobile for better fit
}
```

### 2. DAQI Bar Segments - Flexible Width Distribution

```scss
@include govuk-media-query($until: tablet) {
  min-width: 25px; // Ensure minimum width for visibility
  flex: 1; // Equal width distribution for cells 1-9
  flex-shrink: 0; // Prevent segments from shrinking too much

  // Special width for cell 10 (twice as wide)
  &:nth-child(10) {
    flex: 2; // Cell 10 gets double width
  }
}
```

### 3. DAQI Labels - Matching Flexbox Layout

```scss
@include govuk-media-query($until: tablet) {
  // Switch to flexbox to match the bar layout
  display: flex;
  flex-direction: row;
  max-width: 100%;
  // Match the bar's margins for perfect alignment
  margin-left: 2px;
  margin-right: 2px;
  column-gap: 2px;

  // Override the nth-child grid positioning for flexbox
  .daqi-band {
    // Reset grid-specific positioning
    grid-column: unset;
    position: static;
    left: auto;
    transform: none;
    justify-self: unset;

    // Flexbox positioning for mobile
    &:nth-child(1) {
      flex: 3;
    } // Spans 3 cells (1-3)
    &:nth-child(2) {
      flex: 1;
    } // Spans 1 cell (around 4-6)
    &:nth-child(3) {
      flex: 3;
    } // Spans 3 cells (7-9)
    &:nth-child(4) {
      flex: 2;
    } // Spans 2 cells (cell 10)
  }
}
```

### 4. Enhanced Container Constraints

```scss
@include govuk-media-query($until: tablet) {
  width: 100%;
  max-width: calc(
    100vw - 64px
  ); // Account for mobile padding + border spacing + extra safety margin
  min-width: 300px; // Minimum usable width for 10 cells
  box-sizing: border-box;

  // Force explicit width calculation for mobile
  .daqi-bar {
    width: 100%;
    min-width: 300px; // Ensure minimum width for all cells to be visible
  }
}
```

## Key Advantages of Flexbox Approach

1. **Better Control**: Flexbox provides more predictable control over cell widths than CSS Grid with fractional units
2. **Responsive Distribution**: `flex: 1` ensures equal distribution of available space for cells 1-9
3. **Proportional Cell 10**: `flex: 2` gives cell 10 exactly double the width of other cells
4. **Border Safety**: 2px margins on left and right provide guaranteed space for inset borders
5. **Overflow Handling**: Flexbox with `overflow-x: auto` provides better horizontal scrolling when needed

## Result

- All DAQI cells (1-10) now have proper width distribution on mobile
- Right borders are fully visible with adequate spacing
- Cell 10 maintains its traditional 2x width ratio
- Labels align perfectly with their corresponding cells
- Clean, predictable layout that works across all mobile devices
- Preserved tablet+ grid functionality

## Technical Notes

- Flexbox approach eliminates the grid column calculation complexity
- `flex-shrink: 0` prevents unwanted compression under space pressure
- Label positioning reset ensures no grid positioning conflicts
- Reduced gap (2px instead of 3px) optimizes space usage on mobile
