import {
  commonMessages,
  getCommonMessage,
  getDetailedInfo,
  getAirQualityCy,
  getHighestAQDetails
} from './air-quality.js'

// Test constants
const TEST_VALUE_LOW = 1
const TEST_VALUE_MODERATE = 5
const TEST_VALUE_HIGH = 8
const TEST_VALUE_VERY_HIGH = 10
const TEST_VALUE_LOW_ALT = 3
const TEST_VALUE_INVALID = 99
const TEST_VALUE_DEFAULT = '4'

const createExpectedDetailedInfo = (value, band, readableBand, messages) => ({
  value,
  band,
  readableBand,
  advice: messages.advice,
  atrisk: messages.atrisk,
  insetText: messages.insetText,
  outlook: messages.outlook,
  ukToday: null,
  ukTomorrow: null,
  ukOutlook: null
})

describe('getCommonMessage', function () {
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

describe('getDetailedInfo', function () {
  it('should return the correct detailed info for value 1', () => {
    const detailedInfo = getDetailedInfo(TEST_VALUE_LOW)
    expect(detailedInfo).toEqual(
      createExpectedDetailedInfo(
        TEST_VALUE_LOW,
        'isel',
        'isel',
        commonMessages.isel
      )
    )
  })

  it('should return the correct detailed info for value 5', () => {
    const detailedInfo = getDetailedInfo(TEST_VALUE_MODERATE)
    expect(detailedInfo).toEqual(
      createExpectedDetailedInfo(
        TEST_VALUE_MODERATE,
        'cymedrol',
        'cymedrol',
        commonMessages.cymedrol
      )
    )
  })

  it('should return the correct detailed info for value 8', () => {
    const detailedInfo = getDetailedInfo(TEST_VALUE_HIGH)
    expect(detailedInfo).toEqual(
      createExpectedDetailedInfo(
        TEST_VALUE_HIGH,
        'uchel',
        'uchel',
        commonMessages.uchel
      )
    )
  })

  it('should return the correct detailed info for value 10', () => {
    const detailedInfo = getDetailedInfo(TEST_VALUE_VERY_HIGH)
    expect(detailedInfo).toEqual(
      createExpectedDetailedInfo(
        TEST_VALUE_VERY_HIGH,
        'uchelIawn',
        'uchel iawn',
        commonMessages.uchelIawn
      )
    )
  })
})

describe('getDetailedInfo - edge cases', function () {
  it('should return the default detailed info for an unknown value', () => {
    const detailedInfo = getDetailedInfo(TEST_VALUE_INVALID)
    expect(detailedInfo).toEqual({
      value: TEST_VALUE_INVALID,
      band: 'unknown',
      readableBand: 'unknown',
      advice: commonMessages.unknown.advice,
      insetText: null,
      atrisk: null,
      outlook: null,
      ukToday: null,
      ukTomorrow: null,
      ukOutlook: null
    })
  })

  it('should return the default detailed info when no value is provided', () => {
    const detailedInfo = getDetailedInfo()
    expect(detailedInfo).toEqual({
      value: TEST_VALUE_DEFAULT,
      band: 'cymedrol',
      readableBand: 'cymedrol',
      advice: commonMessages.cymedrol.advice,
      atrisk: commonMessages.cymedrol.atrisk,
      insetText: commonMessages.cymedrol.insetText,
      outlook: commonMessages.cymedrol.outlook,
      ukToday: null,
      ukTomorrow: null,
      ukOutlook: null
    })
  })
})

describe('getAirQualityCy', function () {
  it('should return air quality info for today and the next 4 days', () => {
    const airQuality = getAirQualityCy(
      TEST_VALUE_LOW,
      TEST_VALUE_MODERATE,
      TEST_VALUE_HIGH,
      TEST_VALUE_VERY_HIGH,
      TEST_VALUE_LOW_ALT
    )
    expect(airQuality).toEqual({
      today: getDetailedInfo(TEST_VALUE_LOW),
      day2: getDetailedInfo(TEST_VALUE_MODERATE),
      day3: getDetailedInfo(TEST_VALUE_HIGH),
      day4: getDetailedInfo(TEST_VALUE_VERY_HIGH),
      day5: getDetailedInfo(TEST_VALUE_LOW_ALT)
    })
  })
})

describe('getHighestAQDetails', function () {
  it('should return the highest air quality details', () => {
    const highestAQDetails = getHighestAQDetails(
      TEST_VALUE_LOW,
      TEST_VALUE_MODERATE,
      TEST_VALUE_HIGH,
      TEST_VALUE_VERY_HIGH,
      TEST_VALUE_LOW_ALT
    )
    expect(highestAQDetails).toEqual(getDetailedInfo(TEST_VALUE_VERY_HIGH))
  })
})
