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
    // postcode = postcode.replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces in the postc
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
  const partialPostcodeRegex = /\b(?!BT)(?:[A-Z]{1,2}\d{1,2}|EN1|EN8|N8)\b/i // Define a regular expression to match UK partial postcodes'  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression ''
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

function splitAndCheckSpecificWords(sourceString, targetString) {
  // Define a function to split a string and check if another string contains the exact first two words together or the exact last word
  const words = sourceString.split(' ') // Split the source string into an array of words
  if (words.length === 2) {
    // Check if the source string contains exactly two words
    const [firstWord, secondWord] = words // Destructure the array to get the first two words
    const firstTwoWords = `${firstWord} ${secondWord}` // Combine the first two words
    const exactLastWord = new RegExp(`\\b${secondWord}\\b`) // Create a regex to match the exact last word
    const joinedWords = words.join(' ') // Join the words with a space
    return (
      targetString.includes(firstTwoWords) ||
      exactLastWord.test(targetString) ||
      joinedWords
    ) // Check if the target string contains the exact first two words together or the exact last word
  } else if (words.length === 3) {
    // Check if the source string contains exactly three words
    const [firstWord, secondWord, lastWord] = words // Destructure the array to get the first two and the last word
    const firstTwoWords = `${firstWord} ${secondWord}` // Combine the first two words
    const exactLastWord = new RegExp(`\\b${lastWord}\\b`) // Create a regex to match the exact last word
    const firstArray = [firstWord, secondWord]
    const joinedWords = firstArray.join('')
    const exactJoinedWord = new RegExp(`\\b${joinedWords}\\b`)
    return (
      targetString.includes(firstTwoWords) ||
      exactLastWord.test(targetString) ||
      exactJoinedWord.test(joinedWords)
    ) // Check if the target string contains the exact first two words together or the exact last word
  }
  return false // Return false if the source string does not contain exactly two or three words
}

function splitAndCheckExactWords(sourceString, targetString) {
  // Define a function to split a string and check if another string contains exactly any of the three words
  const words = sourceString.split(' ') // Split the source string into an array of words
  if (words.length >= 3) {
    // Check if the source string contains exactly three words
    return words.some((word) => new RegExp(`\\b${word}\\b`).test(targetString)) // Check if the target string contains exactly any of the three words
  }
  return false // Return false if the source string does not contain exactly three words
}

function countWords(str) {
  // Define a function to count the number of words in a string
  const words = str.trim().split(/\s+/) // Split the string by spaces and remove any leading or trailing whitespace
  return words.length // Return the number of words
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
  isValidFullPostcode,
  splitAndCheckSpecificWords,
  splitAndCheckExactWords,
  countWords
}
