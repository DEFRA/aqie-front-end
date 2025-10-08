import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
export const REFERER_PATH_INDEX = 3
export const FORECAST_DAY_SLICE_LENGTH = 3
export const LANG_SLICE_LENGTH = 2
export const MIN_LOCATION_NAME_LENGTH = 3

export const WELSH_TITLE = 'Gwirio ansawdd aer'
export const LOCATION_NOT_FOUND_PATH_CY = '/lleoliad-heb-ei-ganfod/cy'
export const ERROR_INDEX_PATH = 'error/index'
export const LOCATION_TYPE_UK = 'uk-location'
export const LOCATION_TYPE_NI = 'ni-location'
export const SEARCH_LOCATION_PATH_EN = '/search-location'
export const LOCATION_NOT_FOUND = 'location-not-found/index'
export const LOCATION_NOT_FOUND_ROUTE_CY = '/lleoliad-heb-ei-ganfod/cy?lang=cy'
export const LOCATION_NOT_FOUND_ROUTE_EN = '/location-not-found?lang=en'
export const SEARCH_LOCATION_ROUTE_EN = '/search-location?lang=en'
export const SEARCH_LOCATION_ROUTE_CY = '/chwilio-lleoliad/cy?lang=cy'
export const MULTIPLE_LOCATIONS_ROUTE_EN = '/multiple-results?lang=en'
export const MULTIPLE_LOCATIONS_ROUTE_CY = '/canlyniadau-lluosog/cy?lang=cy'
export const STATUS_UNAUTHORIZED = 401
export const STATUS_NOT_FOUND = 404
export const STATUS_INTERNAL_SERVER_ERROR = 500
export const REDIRECT_PATH_EN = '/search-location?lang=en'
export const REDIRECT_PATH_CY = 'chwilio-lleoliad/cy?lang=cy'
export const POSTCODE_SPACE_INDEX = 3
export const LOCATION_NOT_FOUND_URL = '/location-not-found'
export const WRONG_POSTCODE = 'wrong postcode'
export const GOVUK_SRC_EXCLUDE = 'src/src/govuk/**/*'
export const SYMBOLS_ARRAY = [
  '%',
  '$',
  '&',
  '#',
  '!',
  '¬',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '*',
  '^',
  '@',
  '?',
  '>',
  '<',
  '+',
  '=',
  '|',
  '~',
  '`',
  ';',
  ':',
  ',',
  '.',
  '/',
  '\\',
  '"',
  "'"
]
export const EUROPE_LONDON = 'Europe/London'
export const CALENDAR_STRING = {
  NOW: 'now',
  DDD: 'ddd',
  DD_MMMM_YYYY: 'DD MMMM YYYY',
  DAYS: 'days'
}
export const HOURS_TO_SUBTRACT = 1.56
export const SUMMARY_TRANSLATIONS = {
  Monday: 'Dydd Llun',
  Tuesday: 'Dydd Mawrth',
  Wednesday: 'Dydd Mercher',
  Thursday: 'Dydd Iau',
  Friday: 'Dydd Gwener',
  Saturday: 'Dydd Sadwrn',
  Sunday: 'Dydd Sul',
  Today: 'Heddiw'
}
export const LANG_EN = 'en'
export const LANG_CY = 'cy'
export const BASE_URL = 'https://check-air-quality.service.gov.uk'
export const REDIRECT_STATUS_CODE = 301
export const SAMPLE_LOCATION_NAME = 'Sample Location'
export const HTTP_STATUS_OK = 200
export const MINUTES_IN_HALF_HOUR = 30
export const REFRESH_INTERVAL_MS = MINUTES_IN_HALF_HOUR * 60 * 1000
export const AIR_QUALITY_THRESHOLD_1 = 1
export const AIR_QUALITY_THRESHOLD_2 = 2
export const AIR_QUALITY_THRESHOLD_3 = 3
export const AIR_QUALITY_THRESHOLD_4 = 4
export const DEFAULT_LOCATION_TYPE = 'uk-location'
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500
export const MINUS_NINETY_NINE = -99
export const ROUND_OF_SIX = 6

// '' - Constant for the server directory name
export const SERVER_DIRNAME = dirname(fileURLToPath(import.meta.url))
