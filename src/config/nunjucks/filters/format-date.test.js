import { formatDate } from '../../../config/nunjucks/filters/format-date.js'

// Migrated to Vitest
// Added to comply with coding instructions

describe('#formatDate', () => {
  beforeAll(() => {
    vi.useFakeTimers('modern')
    vi.setSystemTime(new Date('2023-04-01'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('With defaults', () => {
    test('Date should be in expected format', () => {
      expect(formatDate('2022-01-17T11:40:02.242Z')).toEqual(
        'Mon 17th January 2022'
      )
    })
  })

  describe('With format attribute', () => {
    test('Date should be in provided format', () => {
      expect(
        formatDate(
          '2022-01-17T11:40:02.242Z',
          "h:mm aaa 'on' EEEE do MMMM yyyy"
        )
      ).toEqual('11:40 am on Monday 17th January 2022')
    })
  })
})
