import { handleSingleMatch } from './middleware-helpers.js'
// Helper function to handle a single match
const handleSingleMatchHelper = (
  h,
  request,
  params,
  selectedMatches,
  titleData
) => {
  const {
    getForecasts,
    getMeasurements,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    lang,
    locationType
  } = params
  const { title, headerTitle, titleRoute, headerTitleRoute, urlRoute } =
    titleData

  return handleSingleMatch(h, request, {
    selectedMatches,
    getForecasts,
    getMeasurements,
    getDailySummary,
    transformedDailySummary,
    englishDate,
    welshDate,
    month,
    headerTitle,
    titleRoute,
    headerTitleRoute,
    title,
    urlRoute,
    locationType,
    lang
  })
}

export { handleSingleMatchHelper }
