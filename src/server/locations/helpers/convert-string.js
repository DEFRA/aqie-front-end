/**
 * Converts a string into lowercase words joined by hyphens and removes commas.
 */
const convertStringToHyphenatedLowercaseWords = (input) => {
  const removedHyphens = input.replace(/ - /g, ' ')
  // Remove commas, convert to lowercase, and split the string into words
  const words = removedHyphens
    .replace(/,/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')

  // Join the words with hyphens
  return words.join('-')
}

function removeLastWordAndAddHyphens(str) {
  // Define a function to remove the last word and add hyphens
  const words = str.split(' ') // Split the string into an array of words
  words.pop() // Remove the last word
  return words.join('-') // Join the remaining words with hyphens
}

function removeLastWordAndHyphens(str) {
  // Define a function to remove the last word and add hyphens
  let words = str.split(' ') // Split the string into an array of words
  words.pop() // Remove the last word
  words = words.join('') // Join the remaining words
  return words.includes('-') ? words.replace(/-/g, '') : words
}

function splitAndKeepFirstWord(str) {
  const words = str.split('_') // Split the string by the underscore character ''
  return words[0].includes('-') ? words[0].replace(/-/g, '') : words[0] // Return the first word ''
}

function removeHyphensAndUnderscores(str) {
  // Define a function to remove hyphens and underscores from a string
  return str.includes('-') ? str.replace(/-/g, '') : str // Replace hyphens with an empty string if found, otherwise return the original string ''
}

function extractAndFormatUKPostcode(headerTitle) {
  // Define a function to extract and format UK postcode from headerTitle
  const postcodeRegex = /\b(?!BT)([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i // Simplified regex to reduce complexity
  const partialPostcodeRegex = /\b(?!BT)(?:[A-Z]{1,2}\d{1,2}|EN1|EN8|N8)\b/i // Define a regular expression to match UK partial postcodes
  const finalMatch = removeHyphensAndUnderscores(headerTitle) // Match the postcode in the headerTitle
  const match =
    finalMatch.match(postcodeRegex) ?? finalMatch.match(partialPostcodeRegex) // Match the postcode in the headerTitle
  if (match) {
    // Check if a postcode is found
    const postcode = match[0] // Extract the matched postcode
    // postcode = postcode.replace(/[-_]/g, ' '); // Replace hyphens and underscores with spaces in the postc
    return postcode // Return the formatted postcode
  }
  return null // Return null if no postcode is found
}

function removeAllWordsAfterUnderscore(str) {
  //  Define a function to remove all words after an underscore
  const words = str.split('_') // Split the string by the underscore character
  return words[0] // Return the first part of the string
}

function isValidPartialPostcode(postcode) {
  // Define a function to validate if a string is a partial postcode
  const partialPostcodeRegex = /\b(?!BT)(?:[A-Z]{1,2}\d{1,2}|EN1|EN8|N8)\b/i // Define a regular expression to match UK partial postcodes'  return partialPostcodeRegex.test(postcode); // Test the string against the regular expression ''
  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function isValidFullPostcode(postcode) {
  // Define a function to validate if a string is a partial postcode
  const fullPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})$/i // Define a regular expression to match UK full postcodes
  return fullPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function formatUKPostcode(postcode) {
  // Define a function to format a UK postcode
  const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})$/i // Define a regular expression to match UK postcode parts
  const match = postcode.match(postcodeRegex) // Match the postcode parts
  if (match) {
    // Check if the postcode matches the regex
    return `${match[1]} ${match[2]}`.toUpperCase() // Format the postcode with a space and convert to uppercase
  }
  return postcode.toUpperCase() // Return the original postcode in uppercase if it doesn't match the regex
}

export {
  removeAllWordsAfterUnderscore,
  convertStringToHyphenatedLowercaseWords,
  removeLastWordAndAddHyphens,
  extractAndFormatUKPostcode,
  removeHyphensAndUnderscores,
  removeLastWordAndHyphens,
  isValidPartialPostcode,
  splitAndKeepFirstWord,
  formatUKPostcode,
  isValidFullPostcode
}
