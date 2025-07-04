import { gazetteerEntryFilter } from './gazetteer-util.js'

describe('gazetteerEntryFilter', () => {
  it('should generate title and headerTitle with district and name2', () => {
    const locationDetails = {
      GAZETTEER_ENTRY: {
        NAME2: 'TW18 3HT',
        DISTRICT_BOROUGH: 'Runnymede'
      }
    }
    const result = gazetteerEntryFilter(locationDetails)

    expect(result).toEqual({
      title: 'TW18 3HT, Runnymede',
      headerTitle: 'TW18 3HT, Runnymede'
    })
  })

  it('should generate title and headerTitle with district and name1 if name2 is not present', () => {
    const locationDetails = {
      GAZETTEER_ENTRY: {
        NAME1: 'Wales',
        DISTRICT_BOROUGH: 'Rotherham'
      }
    }
    const result = gazetteerEntryFilter(locationDetails)

    expect(result).toEqual({
      title: 'Wales, Rotherham',
      headerTitle: 'Wales, Rotherham'
    })
  })

  it('should generate title and headerTitle with county and name2 if district is not present', () => {
    const locationDetails = {
      GAZETTEER_ENTRY: {
        NAME2: 'PL10 1BW',
        COUNTY_UNITARY: 'Cornwall'
      }
    }
    const result = gazetteerEntryFilter(locationDetails)

    expect(result).toEqual({
      title: 'PL10 1BW, Cornwall',
      headerTitle: 'PL10 1BW, Cornwall'
    })
  })

  it('should generate title and headerTitle with county and name1 if district is not present and name2 is not present', () => {
    const locationDetails = {
      GAZETTEER_ENTRY: {
        NAME1: 'DL10 4BW',
        COUNTY_UNITARY: 'North Yorkshire'
      }
    }
    const result = gazetteerEntryFilter(locationDetails)

    expect(result).toEqual({
      title: 'DL10 4BW, North Yorkshire',
      headerTitle: 'DL10 4BW, North Yorkshire'
    })
  })
})
