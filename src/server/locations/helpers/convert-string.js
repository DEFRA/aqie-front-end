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
  const words = str.split('_') // Split the string by the underscore character
  return words[0].includes('-') ? words[0].replace(/-/g, '') : words[0] // Return the first word
}

function removeHyphensAndUnderscores(str) {
  // Define a function to remove hyphens and underscores from a string
  return str.includes('-') ? str.replace(/-/g, '') : str // Replace hyphens with an empty string if found, otherwise return the original string ''
}

function extractAndFormatUKPostcode(headerTitle) {
  // Define a function to extract and format UK postcode from headerTitle
  const postcodeRegex = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Simplified regex to reduce complexity
  const partialPostcodeRegex = /^[a-z]{1,2}\d[a-z\d]?$/i // Define a regular expression to match UK partial postcodes
  const finalMatch = removeHyphensAndUnderscores(headerTitle) // Match the postcode in the headerTitle
  const match =
    finalMatch.match(postcodeRegex) ?? finalMatch.match(partialPostcodeRegex) // Match the postcode in the headerTitle
  if (match) {
    // Check if a postcode is found
    const postcode = match[0] // Extract the matched postcode
    return postcode // Return the formatted postcode
  }
  return null // Return null if no postcode is found
}

function removeAllWordsAfterUnderscore(str) {
  //  Define a function to remove all words after an underscore
  const words = str.split('_') // Split the string by the underscore character
  return words[0] // Return the first part of the string
}

function isValidPartialPostcodeUK(postcode) {
  // Define a function to validate if a string is a partial postcode
  const partialPostcodeRegex = /^(?:[A-Z]{1,2}\d{1,2}|[A-Z]\d[A-Z])$/i // Define a regular expression to match UK partial postcodes'  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression ''
  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function isValidFullPostcodeUK(postcode) {
  // Define a function to validate if a string is a partial postcode
  const fullPostcodeRegex = /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i // Regular expression to match UK postcodes // Define a regular expression to match UK full postcodes
  return fullPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function isValidPartialPostcodeNI(postcode) {
  // Define a function to validate if a string is a partial postcode
  const partialPostcodeRegex = /^BT\d{1,2}$/i // Define a regular expression to match UK partial postcodes'  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression ''
  return partialPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function isValidFullPostcodeNI(postcode) {
  // Define a function to validate if a string is a partial postcode
  const fullPostcodeRegex = /^BT\d{1,2}\s?\d[A-Z]{2}$/i // Define a regular expression to match UK full postcodes
  return fullPostcodeRegex.test(postcode) // Test the string against the regular expression
}

function splitAndCheckSpecificWords(sourceString, name1) {
  // Define a function to split a string and check if another string contains the exact first two words together or the exact last word
  const words = name1.split(' ') // Split the source string into an array of words
  if (words.length === 2) {
    // Check if the source string contains exactly two words
    const joinedWords = words.join(' ') // Join the words with a space
    return (
      sourceString.includes(joinedWords.toUpperCase()) ||
      joinedWords.toUpperCase().includes(sourceString)
    ) // Check if the target string contains the exact first two words together or the exact last word
  } else if (words.length === 3) {
    // Check if the source string contains exactly three words
    const [firstWord, secondWord] = words // Destructure the array to get the first two and the last word
    const firstTwoWords = `${firstWord} ${secondWord}` // Combine the first two words
    return sourceString.includes(firstTwoWords) // Check if the target string contains the exact first two words together or the exact last word
  }
  return (
    sourceString.includes(name1.toUpperCase()) ||
    name1.toUpperCase().includes(sourceString)
  ) // Return false if the source string does not contain exactly two or three words
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

function isOnlyLettersAndMoreThanFour(input) {
  // Define a function to check if the string is only letters and contains more than 4 letters
  const lettersPattern = /^[a-zA-Z ]+$/ // Define a regular expression to match only letters
  return lettersPattern.test(input) && input.length > 4 // Check if the input matches the pattern and contains more than 4 letters
}

// Function to format a Northern Ireland postcode into outcode and incode
function formatNorthernIrelandPostcode(postcode) {
  const postcodeRegex = /^(BT\d{1,2})(\d[A-Z]{2})$/i // Regular expression to match Northern Ireland postcode format
  const match = postcode.match(postcodeRegex) // Match the postcode with the regular expression
  if (match) {
    const outcode = match[1] // Extract the outcode
    const incode = match[2] // Extract the incode
    return `${outcode} ${incode}` // Return the formatted postcode
  }
  return postcode // Return the original postcode if it does not match the format
}

// Function to check if a word separated by spaces in one string has an exact match in another string
function hasExactMatch(wordString, name1, name2 = null) {
  const normalizeString = (str) => str?.toUpperCase().replace(/\s+/g, '') // Normalize string by converting to uppercase and removing spaces
  const words = wordString.split(' ').map((word) => word.toUpperCase()) // Split and normalize words in the input string

  const checkMatch = (target, words) => {
    if (!target) return false // Return false if the target string is null or undefined
    const normalizedTarget = normalizeString(target) // Normalize the target string
    const joinedWords = words.join('') // Join the array elements into a single string without spaces
    return (
      normalizedTarget.includes(joinedWords) &&
      joinedWords.includes(normalizedTarget)
    ) // Check if the normalized target string contains the joined words
  }

  if (name2) {
    return checkMatch(name2, words) // Check against the second target string if provided
  }

  if (name1) {
    return checkMatch(name1, words) // Check against the first target string
  }

  return false // Return false if neither name1 nor name2 is provided
}

// Function to check if two strings contain the exact same word
function hasCommonWord(string1, string2) {
  const words1 = string1.split(/\s+/) // Split the first string into an array of words
  const words2 = string2.split(/\s+/) // Split the second string into an array of words
  return words1.some((word) => words2.includes(word)) // Check if any word in the first array exists in the second array
}

// Function to format any UK postcode
function formatUKPostcode(postcode) {
  const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})$/i // Regular expression to match UK postcode format
  const match = postcode.match(postcodeRegex) // Match the postcode with the regular expression
  if (match) {
    const outcode = match[1] // Extract the outcode
    const incode = match[2] // Extract the incode
    return `${outcode} ${incode}`.toUpperCase() // Return the formatted postcode
  }
  return postcode // Return the original postcode if it does not match the format
}

function isOnlyWords(str) {
  // Define a function to check if a string contains only words (letters)
  const wordsOnlyRegex = /^[A-Za-z\s]+$/ // Regular expression to match only letters and spaces
  return wordsOnlyRegex.test(str) // Test the string against the regular expression
}

function compareLastElements(previousUrl, currentUrl) {
  // Define a function to compare the last elements of two URLs
  const getLastElement = (url) => {
    if (!url) return false // Return false if the URL is not provided
    const cleanUrl = url.split('?')[0] // Remove any text after '?'
    const parts = cleanUrl?.split('/') // Split the URL by '/'
    return parts[parts.length - 1] // Return the last element of the URL
  }

  const lastElementPrevious = getLastElement(previousUrl) // Get the last element of the previous URL
  const lastElementCurrent = getLastElement(currentUrl) // Get the last element of the current URL

  return lastElementPrevious === lastElementCurrent // Compare the last elements and return true if they are the same, otherwise false
}

export {
  removeAllWordsAfterUnderscore,
  convertStringToHyphenatedLowercaseWords,
  removeLastWordAndAddHyphens,
  extractAndFormatUKPostcode,
  removeHyphensAndUnderscores,
  removeLastWordAndHyphens,
  isValidPartialPostcodeUK,
  splitAndKeepFirstWord,
  formatUKPostcode,
  isValidFullPostcodeUK,
  splitAndCheckSpecificWords,
  splitAndCheckExactWords,
  countWords,
  isOnlyLettersAndMoreThanFour,
  isValidFullPostcodeNI,
  isValidPartialPostcodeNI,
  formatNorthernIrelandPostcode,
  hasExactMatch,
  hasCommonWord,
  isOnlyWords,
  compareLastElements
}
