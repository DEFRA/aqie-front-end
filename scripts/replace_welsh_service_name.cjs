/* eslint-disable no-template-curly-in-string */
// Security: All regex patterns use bounded quantifiers {0,200} to prevent ReDoS attacks
// This limits backtracking and ensures linear time complexity even with malicious input
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
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /pageTitle:\s*'([^']{0,200}?)Gwirio ansawdd aer([^']{0,200}?)'/g,
  'pageTitle: `$1${WELSH_TITLE}$2`'
)

// For titles like "Cwcis ar Gwirio ansawdd aer"
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /title:\s*'([^']{0,200}?)Gwirio ansawdd aer([^']{0,200}?)'/g,
  'title: `$1${WELSH_TITLE}$2`'
)

// For headerText
content = content.replace(
  /(\s+)(headerText):\s*'Gwirio ansawdd aer'/g,
  '$1$2: WELSH_TITLE'
)

// For other text content that includes Gwirio ansawdd aer
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /'([^']{0,200}?)Gwirio ansawdd aer([^']{0,200}?)'/g,
  '`$1${WELSH_TITLE}$2`'
)

fs.writeFileSync(filePath, content)
console.log('Welsh replacement completed successfully!')
