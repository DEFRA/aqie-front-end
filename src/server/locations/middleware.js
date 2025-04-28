import { fetchData } from '~/src/server/locations/helpers/fetch-data'
import { english, calendarEnglish } from '~/src/server/data/en/en.js'
import { calendarWelsh } from '~/src/server/data/cy/cy.js'
import { transformKeys } from '~/src/server/locations/helpers/transform-summary-keys.js'
import {
  getFormattedDateSummary,
  getLanguageDates
} from '~/src/server/locations/helpers/middleware-helpers'
import { LANG_EN, LOCATION_TYPE_UK } from '~/src/server/data/constants'
import {
  handleErrorInputAndRedirect,
  handleUKLocationType
} from '~/src/server/locations/helpers/extra-middleware-helpers'
import { getMonth } from '~/src/server/locations/helpers/location-type-util'

const searchMiddleware = async (request, h) => {
  const { query, payload } = request
  const lang = LANG_EN
  const searchTerms = query?.searchTerms?.toUpperCase()
  const secondSearchTerm = query?.secondSearchTerm?.toUpperCase()

  const redirectError = handleErrorInputAndRedirect(
    request,
    h,
    lang,
    payload,
    searchTerms
  )
  if (!redirectError.locationType) {
    return redirectError
  }

  const { userLocation, locationNameOrPostcode } = redirectError

  const { getDailySummary, getForecasts, getMeasurements, getOSPlaces } =
    await fetchData(request, h, {
      locationType: redirectError.locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm
    })

  const { transformedDailySummary } = transformKeys(getDailySummary, lang)
  const { formattedDateSummary, getMonthSummary } = getFormattedDateSummary(
    getDailySummary?.issue_date,
    calendarEnglish,
    calendarWelsh,
    lang
  )
  const { englishDate, welshDate } = getLanguageDates(
    formattedDateSummary,
    getMonthSummary,
    calendarEnglish,
    calendarWelsh
  )

  if (redirectError.locationType === LOCATION_TYPE_UK) {
    return handleUKLocationType(request, h, {
      locationType: redirectError.locationType,
      userLocation,
      locationNameOrPostcode,
      lang,
      searchTerms,
      secondSearchTerm,
      getOSPlaces,
      getDailySummary,
      getForecasts,
      getMeasurements,
      transformedDailySummary,
      englishDate,
      welshDate,
      month: getMonth(lang),
      ...english
    })
  }

  // Handle other location types (e.g., LOCATION_TYPE_NI)
  return h.redirect('/location-not-found').takeover()
}

export { searchMiddleware }
