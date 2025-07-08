import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gazetteerEntryFilter } from '../../../server/locations/helpers/gazetteer-util.js'
import * as convertString from '../../../server/locations/helpers/convert-string.js'

vi.mock('../../../server/locations/helpers/convert-string', async () => {
  const actual = await vi.importActual(
    '../../../server/locations/helpers/convert-string'
  )
  return {
    ...actual,
    formatUKPostcode: vi.fn((postcode) => `Formatted-${postcode}`)
  }
})

describe('gazetteerEntryFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
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

describe('gazetteerEntryFilter', () => {
  it('Postcode with POPULATED_PLACE and NAME2', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Postcode',
        POPULATED_PLACE: 'London',
        NAME2: 'SW1A'
      }
    })
    expect(result).toEqual({
      title: 'SW1A, London',
      headerTitle: 'SW1A, London'
    })
  })

  it('Postcode with POPULATED_PLACE and NAME1 (no NAME2)', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Postcode',
        POPULATED_PLACE: 'Manchester',
        NAME1: 'M1 1AE'
      }
    })
    expect(convertString.formatUKPostcode).toHaveBeenCalledWith('M1 1AE')
    expect(result).toEqual({
      title: 'Formatted-M1 1AE, Manchester',
      headerTitle: 'Formatted-M1 1AE, Manchester'
    })
  })

  it('Postcode without POPULATED_PLACE', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Postcode',
        NAME1: 'M1 1AE',
        DISTRICT_BOROUGH: 'Greater Manchester'
      }
    })
    expect(result).toEqual({
      title: 'M1 1AE, Greater Manchester',
      headerTitle: 'M1 1AE, Greater Manchester'
    })
  })

  it('Non-Postcode with DISTRICT_BOROUGH and NAME2', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Town',
        DISTRICT_BOROUGH: 'Leeds',
        NAME2: 'Headingley'
      }
    })
    expect(result).toEqual({
      title: 'Headingley, Leeds',
      headerTitle: 'Headingley, Leeds'
    })
  })

  it('Non-Postcode with DISTRICT_BOROUGH and NAME1 (no NAME2)', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Town',
        DISTRICT_BOROUGH: 'Leeds',
        NAME1: 'Hyde Park'
      }
    })
    expect(result).toEqual({
      title: 'Hyde Park, Leeds',
      headerTitle: 'Hyde Park, Leeds'
    })
  })

  it('Non-Postcode with COUNTY_UNITARY and NAME2 (no DISTRICT_BOROUGH)', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Village',
        COUNTY_UNITARY: 'Kent',
        NAME2: 'Canterbury'
      }
    })
    expect(result).toEqual({
      title: 'Canterbury, Kent',
      headerTitle: 'Canterbury, Kent'
    })
  })

  it('Non-Postcode with COUNTY_UNITARY and NAME1 (no NAME2, no DISTRICT_BOROUGH)', () => {
    const result = gazetteerEntryFilter({
      GAZETTEER_ENTRY: {
        LOCAL_TYPE: 'Village',
        COUNTY_UNITARY: 'Kent',
        NAME1: 'Ashford'
      }
    })
    expect(result).toEqual({
      title: 'Ashford, Kent',
      headerTitle: 'Ashford, Kent'
    })
  })
})
