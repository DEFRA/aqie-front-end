/**
 * Converts a string into lowercase words joined by hyphens and removes commas.
 */
const convertStringToHyphenatedLowercaseWords = (input) => {
  // Remove commas, convert to lowercase, and split the string into words
  const words = input.replace(/,/g, '').toLowerCase().split(' ')

  // Join the words with hyphens
  return words.join('-')
}

export { convertStringToHyphenatedLowercaseWords }
