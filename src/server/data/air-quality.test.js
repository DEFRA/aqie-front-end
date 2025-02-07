import {
  getCommonMessage,
  getAirQuality,
  commonMessages
} from '~/src/server/data/air-quality.js'

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

describe('getAirQuality', () => {
  it('should return the correct air quality information for value 1', () => {
    const airQuality = getAirQuality(1)
    expect(airQuality).toEqual({
      value: 1,
      band: 'low',
      readableBand: 'low',
      advice: commonMessages.low.advice,
      atrisk: commonMessages.low.atrisk,
      outlook: commonMessages.low.outlook
    })
  })

  it('should return the correct air quality information for value 5', () => {
    const airQuality = getAirQuality(5)
    expect(airQuality).toEqual({
      value: 5,
      band: 'moderate',
      readableBand: 'moderate',
      advice: commonMessages.moderate.advice,
      atrisk: commonMessages.moderate.atrisk,
      outlook: commonMessages.moderate.outlook
    })
  })

  it('should return the correct air quality information for value 8', () => {
    const airQuality = getAirQuality(8)
    expect(airQuality).toEqual({
      value: 8,
      band: 'high',
      readableBand: 'high',
      advice: commonMessages.high.advice,
      atrisk: commonMessages.high.atrisk,
      outlook: commonMessages.high.outlook
    })
  })

  it('should return the correct air quality information for value 10', () => {
    const airQuality = getAirQuality(10)
    expect(airQuality).toEqual({
      value: 10,
      band: 'veryHigh',
      readableBand: 'very high',
      advice: commonMessages.veryHigh.advice,
      atrisk: commonMessages.veryHigh.atrisk,
      outlook: commonMessages.veryHigh.outlook
    })
  })

  it('should return the default air quality information for an unknown value', () => {
    const airQuality = getAirQuality(99)
    expect(airQuality).toEqual({
      value: 99,
      band: 'unknown',
      readableBand: 'unknown',
      advice: commonMessages.unknown.advice,
      atrisk: undefined,
      outlook: undefined
    })
  })

  it('should return the default air quality information when no value is provided', () => {
    const airQuality = getAirQuality()
    expect(airQuality).toEqual({
      value: '4',
      band: 'moderate',
      readableBand: 'moderate',
      advice: commonMessages.moderate.advice,
      atrisk: commonMessages.moderate.atrisk,
      outlook: commonMessages.moderate.outlook
    })
  })
})
