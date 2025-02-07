import { transformKeys } from '~/src/server/locations/helpers/generate-daily-summary-with-calendar-day.js'
import {
  LANG_CY,
  LANG_EN,
  SUMMARY_TRANSLATIONS
} from '~/src/server/data/constants'

describe('transformKeys', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const dailySummary = {
    issue_date: '2025-02-07',
    today: 'Sunny',
    tomorrow: 'Cloudy',
    outlook: 'Rainy'
  }

  it('should transform keys to Welsh when lang is LANG_CY', () => {
    const lang = LANG_CY
    SUMMARY_TRANSLATIONS.Friday = 'Dydd Gwener'
    SUMMARY_TRANSLATIONS.Saturday = 'Dydd Sadwrn'
    SUMMARY_TRANSLATIONS.Sunday = 'Dydd Sul'
    SUMMARY_TRANSLATIONS.Monday = 'Dydd Llun'
    SUMMARY_TRANSLATIONS.Tuesday = 'Dydd Mawrth'
    SUMMARY_TRANSLATIONS.Wednesday = 'Dydd Mercher'

    const result = transformKeys(dailySummary, lang)

    expect(result.transformedDailySummary).toEqual({
      issue_date: '2025-02-07',
      Heddiw: 'Sunny',
      'Dydd Sadwrn': 'Cloudy',
      'Dydd Sul i Dydd Iau': 'Rainy'
    })
  })

  it('should transform keys to English when lang is LANG_EN', () => {
    const lang = LANG_EN

    const result = transformKeys(dailySummary, lang)

    expect(result.transformedDailySummary).toEqual({
      issue_date: '2025-02-07',
      Today: 'Sunny',
      Saturday: 'Cloudy',
      'Sunday to Thursday': 'Rainy'
    })
  })

  it('should handle missing issue_date gracefully', () => {
    const lang = LANG_EN
    const dailySummaryWithoutDate = { ...dailySummary, issue_date: undefined }

    const result = transformKeys(dailySummaryWithoutDate, lang)

    expect(result.transformedDailySummary).toEqual({
      issue_date: undefined,
      Today: 'Sunny',
      Saturday: 'Cloudy',
      'Sunday to Thursday': 'Rainy'
    })
  })

  it('should translate individual days to Welsh correctly', () => {
    SUMMARY_TRANSLATIONS.Friday = 'Dydd Gwener'
    SUMMARY_TRANSLATIONS.Saturday = 'Dydd Sadwrn'

    const translateDayToWelsh = (day) => {
      return SUMMARY_TRANSLATIONS[day] || day
    }

    expect(translateDayToWelsh('Friday')).toBe('Dydd Gwener')
    expect(translateDayToWelsh('Saturday')).toBe('Dydd Sadwrn')
    expect(translateDayToWelsh('NonexistentDay')).toBe('NonexistentDay')
  })

  it('should translate individual days to Welsh correctly within transformKeys', () => {
    const lang = LANG_CY
    SUMMARY_TRANSLATIONS.Friday = 'Dydd Gwener'
    SUMMARY_TRANSLATIONS.Saturday = 'Dydd Sadwrn'
    SUMMARY_TRANSLATIONS.Sunday = 'Dydd Sul'
    SUMMARY_TRANSLATIONS.Monday = 'Dydd Llun'
    SUMMARY_TRANSLATIONS.Tuesday = 'Dydd Mawrth'
    SUMMARY_TRANSLATIONS.Wednesday = 'Dydd Mercher'

    const dailySummaryWithDays = {
      issue_date: '2025-02-06',
      today: 'Sunny',
      tomorrow: 'Cloudy',
      outlook: 'Rainy',
      Friday: 'Partly Cloudy',
      Saturday: 'Rainy',
      Sunday: 'Sunny',
      Monday: 'Windy',
      Tuesday: 'Snowy',
      Wednesday: 'Stormy'
    }

    const result = transformKeys(dailySummaryWithDays, lang)

    expect(result.transformedDailySummary).toEqual({
      issue_date: '2025-02-06',
      Heddiw: 'Sunny',
      'Dydd Gwener': 'Cloudy',
      'Dydd Sadwrn i Dydd Mercher': 'Rainy'
    })
  })
})

describe('translateDayToWelsh', () => {
  const translateDayToWelsh = (day) => {
    return SUMMARY_TRANSLATIONS[day] || day
  }

  beforeAll(() => {
    SUMMARY_TRANSLATIONS.Friday = 'Dydd Gwener'
    SUMMARY_TRANSLATIONS.Saturday = 'Dydd Sadwrn'
  })

  it('should translate known days to Welsh', () => {
    expect(translateDayToWelsh('Friday')).toBe('Dydd Gwener')
    expect(translateDayToWelsh('Saturday')).toBe('Dydd Sadwrn')
  })

  it('should return the original day if translation is not found', () => {
    expect(translateDayToWelsh('NonexistentDay')).toBe('NonexistentDay')
    expect(translateDayToWelsh('Sunday')).toBe('Dydd Sul')
  })
})
