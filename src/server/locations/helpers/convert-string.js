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

function removeHyphensAndUnderscores(str) {
  // Define a function to remove hyphens and underscores from a string
  return str.includes('-') ? str.replace(/-/g, '') : str // Replace hyphens with an empty string if found, otherwise return the original string ''
}

function extractAndFormatUKPostcode(headerTitle) {
  // Define a function to extract and format UK postcode from headerTitle
  const postcodeRegex =
    /\b(?!BT)(?:EN[1-9]|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i // Simplified regex to reduce complexity
  const finalMatch = removeHyphensAndUnderscores(headerTitle) // Match the postcode in the headerTitle
  const match = finalMatch.match(postcodeRegex) // Match the postcode in the headerTitle
  if (match) {
    // Check if a postcode is found
    const postcode = match[0] // Extract the matched postcode
    // postcode = postcode.replace(/[-_]/g, ' '); // Replace hyphens and underscores with spaces in the postc
    return postcode // Return the formatted postcode
  }
  return null // Return null if no postcode is found
}

function removeLastWord(str) {
  // Define a function to remove the last word from a string ''
  const words = str.split(' ') // Split the string into an array of words ''
  words.pop() // Remove the last word ''
  return words.join(' ') // Join the remaining words back into a single string ''
}

export {
  removeLastWord,
  convertStringToHyphenatedLowercaseWords,
  removeLastWordAndAddHyphens,
  extractAndFormatUKPostcode,
  removeHyphensAndUnderscores,
  removeLastWordAndHyphens
}
