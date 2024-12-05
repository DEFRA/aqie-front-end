// Define and export the firstLetterUppercase function
export const firstLetterUppercase = (str) => {
  const isNumeric = (str) => !isNaN(str)
  const hasNumber = isNumeric(str)
  if (hasNumber) {
    // Split the string at the first comma
    const [beforeComma, afterComma] = str.split(/,(.+)/)

    // Process the part after the comma
    const processedAfterComma = afterComma
      .toLowerCase()
      .split(' ')
      .map((word) => {
        if (word !== 'and' && word !== 'the' && word !== 'of') {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      })
      .join(' ')

    // Concatenate the unprocessed part with the processed part
    return `${beforeComma},${processedAfterComma}`
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}
