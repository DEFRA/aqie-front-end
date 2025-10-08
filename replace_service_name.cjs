/* eslint-disable no-template-curly-in-string */
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
content = content.replace(
  /pageTitle:\s*'([^']*?)Check air quality([^']*?)'/g,
  'pageTitle: `$1${SERVICE_NAME}$2`'
)

// For descriptions with Check air quality at the beginning
content = content.replace(
  /:\s*'Check air quality([^']*?)'/g,
  ': `${SERVICE_NAME}$1`'
)

// For titles like "Cookies on Check air quality"
content = content.replace(
  /title:\s*'([^']*?)Check air quality([^']*?)'/g,
  'title: `$1${SERVICE_NAME}$2`'
)

// For other text content
content = content.replace(
  /'([^']*?)Check air quality([^']*?)'/g,
  '`$1${SERVICE_NAME}$2`'
)

fs.writeFileSync(filePath, content)
console.log('Replacement completed successfully!')
