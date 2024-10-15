function sentenceCase(str) {
  if (!str || typeof str !== 'string') {
    throw new Error('Input must be a non-empty string')
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
export { sentenceCase }
