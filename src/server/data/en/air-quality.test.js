import {
  commonMessages,
  getCommonMessage,
  getDetailedInfo,
  getAirQuality,
  getHighestAQDetails
} from '~/src/server/data/en/air-quality.js'

describe('getCommonMessage', () => {
  it('should return the correct message for low band', () => {
    const message = getCommonMessage('low')
    expect(message).toEqual(commonMessages.low)
  })

  it('should return the correct message for moderate band', () => {
    const message = getCommonMessage('moderate')
    expect(message).toEqual(commonMessages.moderate)
  })

  it('should return the correct message for high band', () => {
    const message = getCommonMessage('high')
    expect(message).toEqual(commonMessages.high)
  })

  it('should return the correct message for veryHigh band', () => {
    const message = getCommonMessage('veryHigh')
    expect(message).toEqual(commonMessages.veryHigh)
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
      band: 'low',
      readableBand: 'low',
      advice: commonMessages.low.advice,
      atrisk: commonMessages.low.atrisk,
      outlook: commonMessages.low.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 5', () => {
    const detailedInfo = getDetailedInfo(5)
    expect(detailedInfo).toEqual({
      value: 5,
      band: 'moderate',
      readableBand: 'moderate',
      advice: commonMessages.moderate.advice,
      atrisk: commonMessages.moderate.atrisk,
      outlook: commonMessages.moderate.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 8', () => {
    const detailedInfo = getDetailedInfo(8)
    expect(detailedInfo).toEqual({
      value: 8,
      band: 'high',
      readableBand: 'high',
      advice: commonMessages.high.advice,
      atrisk: commonMessages.high.atrisk,
      outlook: commonMessages.high.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })

  it('should return the correct detailed info for value 10', () => {
    const detailedInfo = getDetailedInfo(10)
    expect(detailedInfo).toEqual({
      value: 10,
      band: 'veryHigh',
      readableBand: 'very high',
      advice: commonMessages.veryHigh.advice,
      atrisk: commonMessages.veryHigh.atrisk,
      outlook: commonMessages.veryHigh.outlook,
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
      band: 'moderate',
      readableBand: 'moderate',
      advice: commonMessages.moderate.advice,
      atrisk: commonMessages.moderate.atrisk,
      outlook: commonMessages.moderate.outlook,
      ukToday: undefined,
      ukTomorrow: undefined,
      ukOutlook: undefined
    })
  })
})

describe('getAirQuality', () => {
  it('should return air quality info for today and the next 4 days', () => {
    const airQuality = getAirQuality(1, 5, 8, 10, 3)
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
