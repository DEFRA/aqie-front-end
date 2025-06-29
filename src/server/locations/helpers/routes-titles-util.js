import { convertStringToHyphenatedLowercaseWords } from './convert-string.js'

const routesTitles = (matches, locationNameOrPostcode) => {
  return matches.reduce((acc, item) => {
    let headerTitle = ''
    if (item.GAZETTEER_ENTRY.DISTRICT_BOROUGH) {
      if (item.GAZETTEER_ENTRY.NAME2) {
        headerTitle = `${item.GAZETTEER_ENTRY.NAME2}, ${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      } else {
        headerTitle = `${item.GAZETTEER_ENTRY.NAME1}, ${item.GAZETTEER_ENTRY.DISTRICT_BOROUGH}`
      }
    } else {
      headerTitle = `${locationNameOrPostcode}, ${item.GAZETTEER_ENTRY.COUNTY_UNITARY}`
    }
    headerTitle = convertStringToHyphenatedLowercaseWords(headerTitle)
    item.GAZETTEER_ENTRY.ROUTE_PATH = headerTitle
    acc.push(item)
    return acc
  }, [])
}

export { routesTitles }
