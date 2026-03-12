const fs = require('fs')

// First update cy.js file
const cyFilePath = 'src/server/data/cy/cy.js'
let cyContent = fs.readFileSync(cyFilePath, 'utf8')

// Add the constant after the calendar array
// Security: Use bounded quantifiers {0,10} instead of * to prevent ReDoS attacks
cyContent = cyContent.replace(
  /(\s{0,10}'Rhagfyr'\s{0,10}\]\s{0,10})/,
  "$1\n// Welsh page not found constant\nexport const PAGE_NOT_FOUND_CY = 'Tudalen heb ei chanfod'\n"
)

// Replace the occurrence within the same file
cyContent = cyContent.replace(
  /h: 'Tudalen heb ei chanfod'/g,
  'h: PAGE_NOT_FOUND_CY'
)

fs.writeFileSync(cyFilePath, cyContent)

// Update middleware-cy.js file
const middlewareFilePath = 'src/server/locations/cy/middleware-cy.js'
let middlewareContent = fs.readFileSync(middlewareFilePath, 'utf8')

// Add import for the constant
middlewareContent = middlewareContent.replace(
  /(import { welsh, calendarWelsh } from '\.\.\/\.\.\/data\/cy\/cy\.js')/,
  "import { welsh, calendarWelsh, PAGE_NOT_FOUND_CY } from '../../data/cy/cy.js'"
)

// Replace occurrences in middleware
middlewareContent = middlewareContent.replace(
  /heading: 'Tudalen heb ei chanfod'/g,
  'heading: PAGE_NOT_FOUND_CY'
)

middlewareContent = middlewareContent.replace(
  /message: 'Tudalen heb ei chanfod'/g,
  'message: PAGE_NOT_FOUND_CY'
)

fs.writeFileSync(middlewareFilePath, middlewareContent)

// Update other files
const errorHelpersPath = 'src/server/common/helpers/errors.js'
let errorHelpersContent = fs.readFileSync(errorHelpersPath, 'utf8')

// Add import
if (!errorHelpersContent.includes('PAGE_NOT_FOUND_CY')) {
  errorHelpersContent = errorHelpersContent.replace(
    /^/,
    "import { PAGE_NOT_FOUND_CY } from '../../data/cy/cy.js'\n"
  )
}

// Replace occurrence
errorHelpersContent = errorHelpersContent.replace(
  /return 'Tudalen heb ei chanfod'/g,
  'return PAGE_NOT_FOUND_CY'
)

fs.writeFileSync(errorHelpersPath, errorHelpersContent)

console.log('Welsh page not found replacements completed successfully!')
