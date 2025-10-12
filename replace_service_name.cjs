/* eslint-disable no-template-curly-in-string */
// Security: All regex patterns use bounded quantifiers {0,200} to prevent ReDoS attacks
// This limits backtracking and ensures linear time complexity even with malicious input
const fs = require('fs')

const filePath = 'src/server/data/en/en.js'
let content = fs.readFileSync(filePath, 'utf8')

// Add the constant at the top if it doesn't exist
if (!content.includes("const SERVICE_NAME = 'Check air quality'")) {
  content = "const SERVICE_NAME = 'Check air quality'\n\n" + content
}

// Replace exact matches of 'Check air quality' with SERVICE_NAME variable
// For simple property values
content = content.replace(
  /(\s+)(heading|page|serviceName):\s*'Check air quality'/g,
  '$1$2: SERVICE_NAME'
)

// For page titles, we need to use template literals
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /pageTitle:\s*'([^']{0,200}?)Check air quality([^']{0,200}?)'/g,
  'pageTitle: `$1${SERVICE_NAME}$2`'
)

// For descriptions with Check air quality at the beginning
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /:\s*'Check air quality([^']{0,200}?)'/g,
  ': `${SERVICE_NAME}$1`'
)

// For titles like "Cookies on Check air quality"
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /title:\s*'([^']{0,200}?)Check air quality([^']{0,200}?)'/g,
  'title: `$1${SERVICE_NAME}$2`'
)

// For other text content
// Security: Use bounded quantifiers to prevent ReDoS attacks
content = content.replace(
  /'([^']{0,200}?)Check air quality([^']{0,200}?)'/g,
  '`$1${SERVICE_NAME}$2`'
)

fs.writeFileSync(filePath, content)
console.log('Replacement completed successfully!')
