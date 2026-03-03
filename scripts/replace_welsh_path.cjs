const fs = require('fs')

const filePath = 'src/server/locations/cy/middleware-cy.js'
let content = fs.readFileSync(filePath, 'utf8')

// First add the import to the constants import statement
content = content.replace(
  /import {\s*LANG_CY,\s*LOCATION_TYPE_UK,\s*LOCATION_TYPE_NI,\s*REDIRECT_STATUS_CODE\s*} from '\.\.\/\.\.\/data\/constants\.js'/,
  `import {
  LANG_CY,
  LOCATION_TYPE_UK,
  LOCATION_TYPE_NI,
  LOCATION_NOT_FOUND_PATH_CY,
  REDIRECT_STATUS_CODE
} from '../../data/constants.js'`
)

// Replace all occurrences of the literal path with the constant
content = content.replace(
  /h\.redirect\('\/lleoliad-heb-ei-ganfod\/cy'\)/g,
  'h.redirect(LOCATION_NOT_FOUND_PATH_CY)'
)

fs.writeFileSync(filePath, content)
console.log('Welsh path replacement completed successfully!')
