/* eslint-disable no-template-curly-in-string */
const fs = require('fs')

const filePath = 'src/server/data/cy/cy.js'
let content = fs.readFileSync(filePath, 'utf8')

// Replace exact matches of 'Gwirio ansawdd aer' with WELSH_TITLE variable
// For simple property values (heading, serviceName)
content = content.replace(
  /(\s+)(heading|serviceName):\s*'Gwirio ansawdd aer\s*'/g,
  '$1$2: WELSH_TITLE'
)

// For page titles, we need to use template literals
content = content.replace(
  /pageTitle:\s*'([^']*?)Gwirio ansawdd aer([^']*?)'/g,
  'pageTitle: `$1${WELSH_TITLE}$2`'
)

// For titles like "Cwcis ar Gwirio ansawdd aer"
content = content.replace(
  /title:\s*'([^']*?)Gwirio ansawdd aer([^']*?)'/g,
  'title: `$1${WELSH_TITLE}$2`'
)

// For headerText
content = content.replace(
  /(\s+)(headerText):\s*'Gwirio ansawdd aer'/g,
  '$1$2: WELSH_TITLE'
)

// For other text content that includes Gwirio ansawdd aer
content = content.replace(
  /'([^']*?)Gwirio ansawdd aer([^']*?)'/g,
  '`$1${WELSH_TITLE}$2`'
)

fs.writeFileSync(filePath, content)
console.log('Welsh replacement completed successfully!')
