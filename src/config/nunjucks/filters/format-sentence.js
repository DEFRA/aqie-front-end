const addToSentenceCase = function (env) {
  try {
    env.addFilter('toSentenceCase', function (str) {
      if (typeof str !== 'string') {
        return str
      }
      if (!str) {
        return str
      }
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    })
  } catch (error) {
    return error
  }
}

export { addToSentenceCase }
