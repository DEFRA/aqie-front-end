const fullNorthernIrelandPostcodeRegex = /^BT\d{1,2}\s?\d[A-Z]{2}$/i // Regular expression to match full Northern Ireland postcode format ''
const partialNorthernIrelandPostcodeRegex = /^BT\d{1,2}$/i // Regular expression to match partial Northern Ireland postcode format ''
const fullUKPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i // Regular expression to match full UK postcode format ''
const partialUKPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?$/i // Regular expression to match partial UK postcode format ''

function getPostcode(postcode) {
  let postcodeType = ''
  if (fullNorthernIrelandPostcodeRegex.test(postcode)) {
    postcodeType = 'Full Northern Ireland Postcode' // Return postcodeType for full Northern Ireland postcode ''
  } else if (partialNorthernIrelandPostcodeRegex.test(postcode)) {
    postcodeType = 'Partial Northern Ireland Postcode' // Return postcodeType for partial Northern Ireland postcode ''
  } else if (fullUKPostcodeRegex.test(postcode)) {
    postcodeType = 'Full UK Postcode' // Return postcodeType for full UK postcode ''
  } else if (partialUKPostcodeRegex.test(postcode)) {
    postcodeType = 'Partial UK Postcode' // Return postcodeType for partial UK postcode ''
  } else {
    postcodeType = 'Invalid Postcode' // Return postcodeType for invalid postcode ''
  }
  return { postcodeType }
}

export { getPostcode }
