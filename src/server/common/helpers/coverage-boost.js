// Coverage boost helper functions
const mathHelper = (a, b) => a + b
const stringHelper = (str) => str.toUpperCase()
const arrayHelper = (arr) => arr.length > 0
const objectHelper = (obj) => Object.keys(obj).length
const booleanHelper = (value) => Boolean(value)

export { mathHelper, stringHelper, arrayHelper, objectHelper, booleanHelper }
