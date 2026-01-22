# THE ACTUAL FIX: Mobile DAQI Border Issue RESOLVED

## Root Cause Found

After multiple attempts with layout changes, the actual issue was **the border technique itself**. The DAQI segments were using `box-shadow: inset 0 0 0 2px` for borders, which can be unreliable on mobile browsers and in constrained layouts.

## The Real Problem

```scss
// PROBLEMATIC - inset box-shadow borders
&.daqi-1,
&.daqi-2,
&.daqi-3,
&.daqi-4,
&.daqi-5,
&.daqi-6,
&.daqi-7,
&.daqi-8,
&.daqi-9,
&.daqi-10 {
  box-shadow: inset 0 0 0 2px govuk-colour('black');
}
```

**Issues with inset box-shadow:**

- Can be clipped at container edges on mobile
- May not render properly in certain layout contexts
- Browser inconsistencies with inset shadows in grid/flex layouts
- Performance issues on mobile devices

## The Solution

```scss
// FIXED - actual borders
&.daqi-1,
&.daqi-2,
&.daqi-3,
&.daqi-4,
&.daqi-5,
&.daqi-6,
&.daqi-7,
&.daqi-8,
&.daqi-9,
&.daqi-10 {
  border: 2px solid govuk-colour('black');
  box-sizing: border-box;
}
```

**Why this works:**

- Actual borders are always visible and properly rendered
- `box-sizing: border-box` ensures borders are included in width calculations
- Much more reliable across all browsers and devices
- Better performance on mobile

## Why Previous Attempts Failed

All the layout changes (CSS Grid adjustments, flexbox implementations, JavaScript modifications, container constraints) were attempting to solve a **layout problem** when the real issue was a **rendering problem** with the border technique itself.

The inset box-shadow borders were being clipped or not rendering properly at the edges, especially on the right side where cell 10 appeared to "bleed out" - but it wasn't actually the layout bleeding out, it was the border not being visible.

## Result

- ✅ All DAQI cell borders now visible on mobile (including cell 10 right border)
- ✅ Consistent rendering across all browsers and devices
- ✅ Better performance with actual borders vs box-shadow
- ✅ More reliable and maintainable solution
- ✅ No layout complexity needed - the original grid layout works fine

## Technical Note

This demonstrates why it's important to question fundamental assumptions. The issue appeared to be about layout and sizing, but was actually about the border rendering technique. Sometimes the simplest solution (actual borders) is the most reliable.
