# Mobile DAQI Tabs Layout Fix

## 🐛 **Problem Fixed**

In the mobile version, the day headings (Today, Tomorrow, etc.) were appearing as isolated tab buttons that were disconnected from their content sections. This created a poor user experience where:

- Day headings appeared as separate clickable tabs
- Content sections were disconnected from their headings
- Only the first tab ("Today") scaled correctly
- Navigation was confusing and broken on mobile

## ✅ **Solution Implemented**

### **Mobile Layout Strategy**
Changed from **tab navigation** to **integrated section headings** on mobile:

- **Before**: Separate tab buttons + hidden content panels
- **After**: Stacked content sections with integrated headings

### **Key Changes**

#### **1. CSS Updates (`_aq-tabs.scss`)**
```scss
// Hide tab navigation on mobile
.govuk-tabs__list {
    @include govuk-media-query($until: tablet) {
        display: none; // Show content sections instead
    }
}

// Show all panels as stacked sections with integrated headings
.defra-aq-tabs {
    @include govuk-media-query($until: tablet) {
        .govuk-tabs__panel {
            display: block !important; // Show all panels
            margin-bottom: govuk-spacing(6);
            padding: govuk-spacing(4);
            border: 1px solid $govuk-border-colour;
            border-radius: 4px;
            
            // Add mobile heading before each panel
            &::before {
                content: attr(data-day-label);
                display: block;
                @include govuk-font($size: 24, $weight: bold);
                color: govuk-colour("blue");
                margin-bottom: govuk-spacing(3);
                padding-bottom: govuk-spacing(2);
                border-bottom: 2px solid govuk-colour("blue");
            }
        }
    }
}
```

#### **2. Template Updates (`daqi-numbered.njk`)**
Added `data-day-label` attributes to each panel:

```nunjucks
// Example for "Today" panel
panel: { 
  html: todayPanel,
  attributes: {
    'data-day-label': todayAbbrev  // "Today"
  }
}
```

Applied to all forecast days:
- **Today** → `data-day-label="Today"`
- **Tomorrow** → `data-day-label="Tomorrow"`  
- **Day 3-5** → `data-day-label="Wednesday"` etc.

## 📱 **Mobile User Experience Now**

### **Visual Layout**
```
┌─────────────────────────────┐
│ ▼ Today                     │ ← Integrated heading
│ ═══════                     │
│                             │
│ [DAQI Bar: 4 segments]      │
│ Daily summary content...    │
└─────────────────────────────┘

┌─────────────────────────────┐  
│ ▼ Tomorrow                  │ ← Integrated heading
│ ═════════                   │
│                             │
│ [DAQI Bar: 6 segments]      │
│ Daily summary content...    │
└─────────────────────────────┘

... (more days)
```

### **Benefits**
- ✅ **Clear visual hierarchy** - each day heading is directly connected to its content
- ✅ **No isolated buttons** - headings are part of their sections
- ✅ **All sections visible** - users can see all forecast days at once
- ✅ **Consistent scaling** - all sections have the same layout and styling
- ✅ **Better accessibility** - proper heading structure with content relationship
- ✅ **Mobile-first design** - optimized for touch and mobile navigation

## 🔄 **Responsive Behavior**

### **Mobile (< tablet)**
- Tab navigation: **Hidden**
- Content display: **All sections stacked with integrated headings**
- Interaction: **Scroll to view different days**

### **Tablet+ (≥ tablet)**  
- Tab navigation: **Visible and functional**
- Content display: **Traditional tab panels (only selected visible)**
- Interaction: **Click tabs to switch between days**

## 🎯 **Technical Implementation**

### **CSS Pseudo-element Headings**
- Uses `::before` pseudo-element for mobile headings
- Content comes from `data-day-label` attribute
- Styled as proper headings with blue color and underline
- Automatically integrated with each content section

### **Responsive Display Logic**
- `display: none` for tabs on mobile
- `display: block !important` for all panels on mobile  
- Maintains existing tablet+ tab functionality
- No JavaScript changes required

## 🧪 **Testing**

### **Mobile Testing** (< 768px)
- ✅ All day sections visible and properly spaced
- ✅ Each section has clear, integrated heading
- ✅ Content flows naturally from heading to DAQI data
- ✅ No isolated or disconnected elements

### **Tablet+ Testing** (≥ 768px)
- ✅ Traditional tab navigation preserved
- ✅ Click tabs to switch between days
- ✅ Only selected panel visible
- ✅ Existing functionality unchanged

The mobile DAQI forecast experience is now properly integrated with clear, connected headings and content sections! 🎉