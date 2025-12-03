import { config } from '../../../../config/index.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../../data/constants.js'
function handleTestModeFetchData({
  locationType,
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  injectedHandleUKLocationData,
  injectedHandleNILocationData,
  injectedLogger,
  injectedErrorResponse,
  args
}) {
  if (locationType === LOCATION_TYPE_UK) {
    const osPlacesResult = injectedHandleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      args || {}
    )
    return buildUKTestModeResult(osPlacesResult)
  } else if (locationType === LOCATION_TYPE_NI) {
    const result = injectedHandleNILocationData(
      userLocation,
      optionsOAuth,
      args || {}
    )
    if (result && typeof result.then === 'function') {
      return result.then((getNIPlaces) => buildNITestModeResult(getNIPlaces))
    }
    return buildNITestModeResult(result)
  }
  // fallback for unsupported types
  if (injectedLogger && typeof injectedLogger.error === 'function') {
    injectedLogger.error(
      'Unsupported location type in test mode:',
      locationType
    )
  }
  return injectedErrorResponse('Unsupported location type in test mode', 400)
}
function buildNITestModeResult(getNIPlaces) {
  return {
    getDailySummary: 'summary',
    getForecasts: { 'forecast-summary': 'summary' },
    getNIPlaces: getNIPlaces || { results: [] }
  }
}
function buildUKTestModeResult(getOSPlaces) {
  return {
    getDailySummary: 'summary',
    getForecasts: 'summary',
    getOSPlaces: {
      results: Array.isArray(getOSPlaces?.results)
        ? getOSPlaces.results
        : [getOSPlaces]
    }
  }
}
function handleUKLocationDataTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: handleUKLocationData returning mock data')
    }
    return { results: ['ukData'] }
  }
  return null
}
function fetchMeasurementsTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info(
        'Test mode: fetchMeasurements returning mock measurements'
      )
    }
    return [{ measurement: 'mock-measurement' }]
  }
  return null
}
// Test mode helpers extracted from fetch-data.js

function fetchForecastsTestMode(injectedIsTestMode, injectedLogger) {
  if (injectedIsTestMode?.()) {
    if (injectedLogger && typeof injectedLogger.info === 'function') {
      injectedLogger.info('Test mode: fetchForecasts returning mock forecasts')
    }
    return { forecasts: 'mock-forecasts' }
  }
  return null
}

// ''
function isMockEnabled() {
  const mockValue = config.get('enabledMock')
  return mockValue
}

export {
  handleTestModeFetchData,
  buildNITestModeResult,
  buildUKTestModeResult,
  handleUKLocationDataTestMode,
  fetchMeasurementsTestMode,
  fetchForecastsTestMode,
  isMockEnabled
}
