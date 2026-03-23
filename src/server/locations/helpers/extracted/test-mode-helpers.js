import { config } from '../../../../config/index.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../../data/constants.js'

const HTTP_STATUS_BAD_REQUEST = 400

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
    } else {
      return buildNITestModeResult(result)
    }
  } else {
    // fallback for unsupported types
    if (injectedLogger && typeof injectedLogger.error === 'function') {
      injectedLogger.error(
        'Unsupported location type in test mode:',
        locationType
      )
    }
    return injectedErrorResponse(
      'Unsupported location type in test mode',
      HTTP_STATUS_BAD_REQUEST
    )
  }
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
function handleUKLocationDataTestMode(injectedIsTestMode, _injectedLogger) {
  if (injectedIsTestMode?.()) {
    return { results: ['ukData'] }
  }
  return null
}
function fetchMeasurementsTestMode(injectedIsTestMode, _injectedLogger) {
  if (injectedIsTestMode?.()) {
    return [{ measurement: 'mock-measurement' }]
  }
  return null
}
// Test mode helpers extracted from fetch-data.js

function fetchForecastsTestMode(injectedIsTestMode, _injectedLogger) {
  if (injectedIsTestMode?.()) {
    return { forecasts: 'mock-forecasts' }
  }
  return null
}

function isMockEnabled() {
  return config.get('enabledMock')
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
