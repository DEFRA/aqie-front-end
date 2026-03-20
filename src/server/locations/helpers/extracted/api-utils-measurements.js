function buildRemoteRicardoMeasurementsUrl(baseUrl, queryString) {
  let remoteSeparator = '?'
  if (baseUrl.includes('?')) {
    remoteSeparator = baseUrl.endsWith('?') || baseUrl.endsWith('&') ? '' : '&'
  }

  return `${baseUrl}${remoteSeparator}${queryString}`
}

export { buildRemoteRicardoMeasurementsUrl }
