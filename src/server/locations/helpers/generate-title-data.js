import { convertStringToHyphenatedLowercaseWords } from '~/src/server/locations/helpers/convert-string'
import { getTitleAndHeaderTitle } from '~/src/server/locations/helpers/middleware-helpers'
// Helper function to generate title and route data
const generateTitleData = (selectedMatches, locationNameOrPostcode) => {
  if (!selectedMatches || !locationNameOrPostcode) {
    return {
      title: 'Unknown Location',
      headerTitle: '',
      urlRoute: '',
      headerTitleRoute: '',
      titleRoute: ''
    }
  }

  const locationDetails = selectedMatches.map((match) => {
    return match
  })

  if (!locationDetails[0] || !locationDetails[0].GAZETTEER_ENTRY) {
    return {
      title: 'Unknown Location',
      headerTitle: '',
      urlRoute: '',
      headerTitleRoute: '',
      titleRoute: ''
    }
  }

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
