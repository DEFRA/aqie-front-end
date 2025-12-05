import { config } from '../../../../config/index.js'
import { LOCATION_TYPE_UK, LOCATION_TYPE_NI } from '../../../data/constants.js'

const HTTP_BAD_REQUEST = 400

function handleTestModeFetchData({
  locationType,
  userLocation,
  searchTerms,
  secondSearchTerm,
  optionsOAuth,
  handleUKLocationData,
  handleNILocationData,
  logger,
  errorResponse,
  args
}) {
  if (locationType === LOCATION_TYPE_UK) {
    const osPlacesResult = handleUKLocationData(
      userLocation,
      searchTerms,
      secondSearchTerm,
      args || {}
    )
    return buildUKTestModeResult(osPlacesResult)
  } else if (locationType === LOCATION_TYPE_NI) {
    const result = handleNILocationData(
      userLocation,
      optionsOAuth,
      args || {}
    )
    if (result && typeof result.then === 'function') {
      return result.then((getNIPlaces) => buildNITestModeResult(getNIPlaces))
    }
    return buildNITestModeResult(result)
  } else {
    // fallback for unsupported types
    if (logger && typeof logger.error === 'function') {
      logger.error(
        'Unsupported location type in test mode:',
        locationType
      )
    }
    return errorResponse(
      'Unsupported location type in test mode',
      HTTP_BAD_REQUEST
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
function handleUKLocationDataTestMode(isTestMode, logger) {
  if (isTestMode?.()) {
    if (logger && typeof logger.info === 'function') {
      logger.info('Test mode: handleUKLocationData returning mock data')
    }
    return { results: ['ukData'] }
  }
  return null
}
function fetchMeasurementsTestMode(isTestMode, logger) {
  if (isTestMode?.()) {
    if (logger && typeof logger.info === 'function') {
      logger.info(
        'Test mode: fetchMeasurements returning mock measurements'
      )
    }
    return [{ measurement: 'mock-measurement' }]
  }
  return null
}
// Test mode helpers extracted from fetch-data.js

function fetchForecastsTestMode(isTestMode, logger) {
  if (isTestMode?.()) {
    if (logger && typeof logger.info === 'function') {
      logger.info('Test mode: fetchForecasts returning mock forecasts')
    }
    return { forecasts: 'mock-forecasts' }
  }
  return null
}

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
