import {
  commonMessages,
  getCommonMessage,
  getDetailedInfo,
  getAirQualityCy,
  getHighestAQDetails
} from './air-quality.js'

describe('getCommonMessage', () => {
  it('should return the correct message for isel band', () => {
    const message = getCommonMessage('isel')
    expect(message).toEqual(commonMessages.isel)
  })

  it('should return the correct message for cymedrol band', () => {
    const message = getCommonMessage('cymedrol')
    expect(message).toEqual(commonMessages.cymedrol)
  })

  it('should return the correct message for uchel band', () => {
    const message = getCommonMessage('uchel')
    expect(message).toEqual(commonMessages.uchel)
  })

  it('should return the correct message for uchelIawn band', () => {
    const message = getCommonMessage('uchelIawn')
    expect(message).toEqual(commonMessages.uchelIawn)
  })

  it('should return the unknown message for an unknown band', () => {
    const message = getCommonMessage('unknownBand')
    expect(message).toEqual(commonMessages.unknown)
  })
})

describe('getDetailedInfo', () => {
  it('should return the correct detailed info for value 1', () => {
    const detailedInfo = getDetailedInfo(1)
    expect(detailedInfo).toEqual({
      value: 1,
      band: 'isel',
      readableBand: 'isel',
      advice: commonMessages.isel.advice,
      atrisk: commonMessages.isel.atrisk,
      insetText: commonMessages.isel.insetText,
      outlook: commonMessages.isel.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 5', () => {
    const detailedInfo = getDetailedInfo(5)
    expect(detailedInfo).toEqual({
      value: 5,
      band: 'cymedrol',
      readableBand: 'cymedrol',
      advice: commonMessages.cymedrol.advice,
      atrisk: commonMessages.cymedrol.atrisk,
      insetText: commonMessages.cymedrol.insetText,
      outlook: commonMessages.cymedrol.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 8', () => {
    const detailedInfo = getDetailedInfo(8)
    expect(detailedInfo).toEqual({
      value: 8,
      band: 'uchel',
      readableBand: 'uchel',
      advice: commonMessages.uchel.advice,
      atrisk: commonMessages.uchel.atrisk,
      insetText: commonMessages.uchel.insetText,
      outlook: commonMessages.uchel.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 10', () => {
    const detailedInfo = getDetailedInfo(10)
    expect(detailedInfo).toEqual({
      value: 10,
      band: 'uchelIawn',
      readableBand: 'uchel iawn',
      advice: commonMessages.uchelIawn.advice,
      atrisk: commonMessages.uchelIawn.atrisk,
      insetText: commonMessages.uchelIawn.insetText,
      outlook: commonMessages.uchelIawn.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the default detailed info for an unknown value', () => {
    const detailedInfo = getDetailedInfo(99)
    expect(detailedInfo).toEqual({
      value: 99,
      band: 'unknown',
      readableBand: 'unknown',
      advice: commonMessages.unknown.advice,
      atrisk: undefined,
      outlook: undefined,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the default detailed info when no value is provided', () => {
    const detailedInfo = getDetailedInfo()
    expect(detailedInfo).toEqual({
      value: '4',
      band: 'cymedrol',
      readableBand: 'cymedrol',
      advice: commonMessages.cymedrol.advice,
      atrisk: commonMessages.cymedrol.atrisk,
      insetText: commonMessages.cymedrol.insetText,
      outlook: commonMessages.cymedrol.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })
})

describe('getAirQualityCy', () => {
  it('should return air quality info for today and the next 4 days', () => {
    const airQuality = getAirQualityCy(1, 5, 8, 10, 3)
    expect(airQuality).toEqual({
      today: getDetailedInfo(1),
      day2: getDetailedInfo(5),
      day3: getDetailedInfo(8),
      day4: getDetailedInfo(10),
      day5: getDetailedInfo(3)
    })
  })
})

describe('getHighestAQDetails', () => {
  it('should return the highest air quality details', () => {
    const highestAQDetails = getHighestAQDetails(1, 5, 8, 10, 3)
    expect(highestAQDetails).toEqual(getDetailedInfo(10))
  })
})
