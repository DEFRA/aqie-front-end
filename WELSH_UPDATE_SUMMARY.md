# Welsh DAQI Health Messages Update - Summary

## Overview
This branch (`feature/update-welsh-daqi-health-messages`) is set up to update the Welsh health messaging for the Daily Air Quality Index (DAQI) system to match the improvements made to the English version.

## What Has Been Done

✅ **Created new branch** from `main`
✅ **Created translation guide** (`WELSH_HEALTH_MESSAGES_TRANSLATION_GUIDE.md`)
✅ **Created translation template** (`WELSH_TRANSLATION_TEMPLATE.js`)

## What Needs to Be Done

### Step 1: Translation (Welsh Translator)
Send `WELSH_HEALTH_MESSAGES_TRANSLATION_GUIDE.md` to a Welsh translator to translate the following sections:

1. **LOW level (isel)** - Full detailed health advice with symptoms and guidance
2. **MODERATE level (cymedrol)** - Full detailed health advice with symptoms and guidance  
3. **HIGH level (uchel)** - Full detailed health advice with symptoms and guidance
4. **VERY HIGH level (uchelIawn)** - Full detailed health advice with symptoms and guidance

The translator should provide:
- Short `advice` summaries
- Detailed `insetText` HTML blocks with health information
- Three `atrisk` summaries for low level only (moderate, high, and very high already have these)

### Step 2: Integration (Development Team)
Once translations are received:

1. **Copy the template**: Use `WELSH_TRANSLATION_TEMPLATE.js` as a starting point
2. **Insert translations**: Replace `[WELSH TRANSLATION HERE]` placeholders with actual Welsh text
3. **Handle apostrophes**: Welsh contains many apostrophes (') which need proper escaping:
   - In regular strings, use double quotes: `"I'r rhan fwyaf"` 
   - In template literals, apostrophes are fine: `` `<p>I'r rhan...</p>` ``
4. **Update the file**: Copy the completed structure to `src/server/data/cy/air-quality.js`
5. **Add `insetText` property**: Ensure `getDetailedInfo()` function returns `insetText: message.insetText`

### Step 3: Testing & Deployment

```bash
# Format code
npm run format

# Run linter
npm run lint

# Run tests  
npm test

# Commit changes
git add -A
git commit -m "feat: update Welsh DAQI health messages with detailed advice

- Added comprehensive health advice for all DAQI levels in Welsh
- Added insetText with symptoms and guidance
- Updated atrisk summaries for low level
- Matches improvements made to English version"

# Rebase with main
git fetch origin
git rebase origin/main

# Push to GitHub
git push origin feature/update-welsh-daqi-health-messages --force-with-lease

# Create PR
# GitHub will provide a link to create a pull request
```

## Files Modified

- `src/server/data/cy/air-quality.js` - Welsh health messages (to be updated after translation)

## Files Created

- `WELSH_HEALTH_MESSAGES_TRANSLATION_GUIDE.md` - Comprehensive translation guide
- `WELSH_TRANSLATION_TEMPLATE.js` - JavaScript structure template
- `WELSH_UPDATE_SUMMARY.md` - This file

## Reference

The English version was updated in branch: `feature/update-daqi-health-messages`
- Commit: [tag: v0.15.1-daqi-health-messages]
- See `src/server/data/en/air-quality.js` for the English implementation

## Technical Notes

### String Escaping in JavaScript

Welsh uses many apostrophes which can cause issues in JavaScript:

**Problem:** `'I'r rhan fwyaf'` → syntax error (mismatched quotes)

**Solutions:**
1. Use double quotes for the outer string:
   ```javascript
   advice: "I'r rhan fwyaf o bobl..."
   ```

2. For template literals (insetText), apostrophes are fine:
   ```javascript
   insetText: `<p>I'r rhan fwyaf...</p>`
   ```

3. If needed, escape apostrophes:
   ```javascript
   advice: 'I\'r rhan fwyaf...'  // Not recommended, harder to read
   ```

### HTML Structure in insetText

The `insetText` should contain HTML with:
- `<p>` tags for paragraphs
- `<ul class="govuk-list govuk-list--bullet">` for bullet lists
- `<li>` for list items
- `<h3 class="govuk-heading-s">` for section headings
- All class names must remain in English
- All HTML tags must be preserved exactly

## Next Steps

1. **Immediate**: Send `WELSH_HEALTH_MESSAGES_TRANSLATION_GUIDE.md` to Welsh translator
2. **After translation received**: Integrate translations into `src/server/data/cy/air-quality.js`
3. **After integration**: Run format, lint, test cycle
4. **Final**: Commit, rebase, push, and create PR

## Questions?

If you have any questions about:
- **Translation content**: Refer to the English version in `src/server/data/en/air-quality.js`
- **Technical implementation**: Check the template in `WELSH_TRANSLATION_TEMPLATE.js`
- **HTML structure**: See examples in `WELSH_HEALTH_MESSAGES_TRANSLATION_GUIDE.md`
