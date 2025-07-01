import { convertStringToHyphenatedLowercaseWords } from './convert-string.js'
import { getTitleAndHeaderTitle } from './middleware-helpers.js'
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
