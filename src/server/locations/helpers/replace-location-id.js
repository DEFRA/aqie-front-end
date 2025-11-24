// '' Replace locationId and locationName in air quality messages
function replaceLocationId(airQuality, locationId, locationName, headerTitle) {
  if (!airQuality || typeof airQuality !== 'object') return airQuality
  const replacer = (str) =>
    str
      .replaceAll('{locationId}', locationId || '')
      .replaceAll('{locationName}', locationName || headerTitle || '')
  // Deep clone and replace in all string fields
  const clone = JSON.parse(JSON.stringify(airQuality))
  for (const key in clone) {
    if (typeof clone[key] === 'string') {
      clone[key] = replacer(clone[key])
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      for (const subKey in clone[key]) {
        if (typeof clone[key][subKey] === 'string') {
          clone[key][subKey] = replacer(clone[key][subKey])
        }
      }
    }
  }
  return clone
}

export { replaceLocationId }
