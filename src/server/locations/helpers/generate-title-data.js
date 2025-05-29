import { convertStringToHyphenatedLowercaseWords } from '~/src/server/locations/helpers/convert-string'
import { getTitleAndHeaderTitle } from '~/src/server/locations/helpers/middleware-helpers'
// Helper function to generate title and route data
const generateTitleData = (selectedMatches, locationNameOrPostcode) => {
  const { title, headerTitle, urlRoute } = getTitleAndHeaderTitle(
    selectedMatches,
    locationNameOrPostcode
  )
  const headerTitleRoute = convertStringToHyphenatedLowercaseWords(
    String(urlRoute)
  )
  const titleRoute = convertStringToHyphenatedLowercaseWords(String(title))

  return { title, headerTitle, urlRoute, headerTitleRoute, titleRoute }
}

export { generateTitleData }
