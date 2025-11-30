// '' Replace locationId and locationName in air quality messages
function replaceLocationId(airQuality, locationId, locationName, headerTitle) {
  if (!airQuality || typeof airQuality !== 'object') {
    return airQuality
  }
  const replacer = (str) =>
    str
      .replaceAll('{locationId}', locationId || '')
      .replaceAll('{locationName}', locationName || headerTitle || '')
  // Deep clone and replace in all string fields
  const clone = structuredClone(airQuality)
  for (const key in clone) {
    if (typeof clone[key] === 'string') {
      clone[key] = replacer(clone[key])
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      replaceInObject(clone[key], replacer)
    } else {
      // Non-string, non-object values remain unchanged
    }
  }
  return clone
}

function replaceInObject(obj, replacer) {
  for (const subKey in obj) {
    if (typeof obj[subKey] === 'string') {
      obj[subKey] = replacer(obj[subKey])
    }
  }
}

export { replaceLocationId }
