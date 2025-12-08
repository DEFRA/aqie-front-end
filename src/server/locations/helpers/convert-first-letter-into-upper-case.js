// Define and export the convertFirstLetterIntoUppercase function
export const convertFirstLetterIntoUppercase = (str) => {
  const isNumeric = (text) => /\d/.test(text)
  const hasNumber = isNumeric(str)
  if (hasNumber) {
    // Split the string at the first comma
    const [beforeComma, afterComma] = str.split(/,(.+)/)

    // Process the part after the comma
    const processedAfterComma = afterComma
      .toLowerCase()
      .split(' ')
      .map((word) => {
        if (
          word === 'air' ||
          word === 'quality' ||
          word === 'aer' ||
          word === 'ansawdd'
        ) {
          return word.toLowerCase()
        }
        if (word !== 'and' && word !== 'the' && word !== 'of') {
          return word === 'gov.uk'
            ? word.toUpperCase()
            : word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      })
      .join(' ')

    // Concatenate the unprocessed part with the processed part
    return `${beforeComma},${processedAfterComma}`
  }
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (
        word === 'air' ||
        word === 'quality' ||
        word === 'aer' ||
        word === 'ansawdd'
      ) {
        return word.toLowerCase()
      }
      if (word !== 'and' && word !== 'the' && word !== 'of') {
        return word === 'gov.uk'
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}
