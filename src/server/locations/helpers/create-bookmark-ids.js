import {
  convertStringToHyphenatedLowercaseWords,
  isValidFullPostcodeUK
} from './convert-string.js'

function createURLRouteBookmarks(selectedMatchesAddedIDs) {
  const normalizeString = (str) => str?.toLowerCase().replace(/\s+/g, '')
  selectedMatchesAddedIDs.reduce((acc, item) => {
    let urlRoute = ''
    const validPostcode = isValidFullPostcodeUK(
      selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.NAME1
    )
    if (validPostcode) {
      urlRoute = selectedMatchesAddedIDs[0].GAZETTEER_ENTRY.NAME1
      item.GAZETTEER_ENTRY.ID = normalizeString(urlRoute.toLowerCase())
      acc.push(item)
      return acc
    }
    if (item.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (item.GAZETTEER_ENTRY.NAME2) {
        urlRoute = `${item.GAZETTEER_ENTRY.NAME2}_${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        urlRoute = `${item.GAZETTEER_ENTRY.NAME1}_${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      urlRoute = item.GAZETTEER_ENTRY.NAME2
        ? `${item.GAZETTEER_ENTRY.NAME2}_${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
        : `${item.GAZETTEER_ENTRY.NAME1}_${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute) // Use the helper function to generate the custom ID
    urlRoute = urlRoute.replace(/-/g, ' ')
    urlRoute = convertStringToHyphenatedLowercaseWords(urlRoute)
    item.GAZETTEER_ENTRY.ID = normalizeString(urlRoute) // Update the nested object property
    acc.push(item)
    return acc
  }, [])
  return { selectedMatchesAddedIDs }
}

export { createURLRouteBookmarks }
