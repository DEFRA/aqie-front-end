import { transformKeys } from '~/src/server/locations/helpers/generate-daily-summary-with-calendar-day.js'

describe.skip('transformKeys', () => {
  it('should transform the keys based on the current day', () => {
    const input = {
      issue_date: '2025-01-29 04:33:00',
      today:
        'Air pollution levels are expected to be Low across all regions of the UK on Wednesday, with unsettled conditions gradually easing.',
      tomorrow: 'Low air pollution forecast across the UK on Thursday.',
      outlook:
        'Air pollution forecast to remain Low across the UK into the weekend.'
    }

    const expectedOutput = {
      transformedDailySummary: {
        issue_date: '2025-01-29 04:33:00',
        Today:
          'Air pollution levels are expected to be Low across all regions of the UK on Wednesday, with unsettled conditions gradually easing.',
        Thursday: 'Low air pollution forecast across the UK on Thursday.',
        'Friday to Tuesday':
          'Air pollution forecast to remain Low across the UK into the weekend.'
      }
    }

    const result = transformKeys(input)
    expect(result).toEqual(expectedOutput)
  })
})
