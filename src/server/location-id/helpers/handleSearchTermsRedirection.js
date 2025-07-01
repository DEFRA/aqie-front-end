import { compareLastElements } from '../locations/helpers/convert-string.js'
import { getSearchTermsFromUrl } from '../locations/helpers/get-search-terms-from-url.js'

const handleSearchTermsRedirection = (
  previousUrl,
  currentUrl,
  searchTermsSaved,
  request,
  h
) => {
  const isPreviousAndCurrentUrlEqual = compareLastElements(
    previousUrl,
    currentUrl
  )

  if (
    (previousUrl === undefined && !searchTermsSaved) ||
    (isPreviousAndCurrentUrlEqual && !searchTermsSaved)
  ) {
    const { searchTerms, secondSearchTerm, searchTermsLocationType } =
      getSearchTermsFromUrl(currentUrl)
    request.yar.clear('locationData')
    return h
      .redirect(
        `/location?lang=en&searchTerms=${encodeURIComponent(searchTerms)}&secondSearchTerm=${encodeURIComponent(
          secondSearchTerm
        )}&searchTermsLocationType=${encodeURIComponent(searchTermsLocationType)}`
      )
      .takeover()
  }
  return null
}

export default handleSearchTermsRedirection
