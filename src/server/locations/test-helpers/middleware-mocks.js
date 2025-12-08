import { vi } from 'vitest'

// Mock all dependencies
vi.mock('../helpers/fetch-data.js', () => ({
  fetchData: vi.fn()
}))

vi.mock('../../data/en/en.js', () => ({
  english: {
    notFoundUrl: {
      nonService: {
        pageTitle: 'Page not found'
      }
    },
    phaseBanner: 'Beta',
    footerTxt: 'Footer text',
    cookieBanner: 'Cookie banner',
    multipleLocations: {
      serviceName: 'Air Quality Service',
      titlePrefix: 'Air quality in'
    },
    home: {
      pageTitle: 'Check local air quality'
    }
  },
  calendarEnglish: {
    January: 'January',
    February: 'February'
  }
}))

vi.mock('../../data/cy/cy.js', () => ({
  calendarWelsh: {
    January: 'Ionawr',
    February: 'Chwefror'
  }
}))

vi.mock('../helpers/transform-summary-keys.js', () => ({
  transformKeys: vi.fn()
}))

vi.mock('../helpers/middleware-helpers.js', () => ({
  getFormattedDateSummary: vi.fn(),
  getLanguageDates: vi.fn()
}))

vi.mock('../helpers/extra-middleware-helpers.js', () => ({
  handleUKLocationType: vi.fn()
}))

vi.mock('../helpers/error-input-and-redirect.js', () => ({
  handleErrorInputAndRedirect: vi.fn()
}))

vi.mock('../helpers/location-type-util.js', () => ({
  getMonth: vi.fn()
}))

vi.mock('../../data/en/air-quality.js', () => ({
  default: { commonMessages: { good: 'Good air quality' } }
}))

vi.mock('../helpers/convert-string.js', () => ({
  isValidPartialPostcodeNI: vi.fn(),
  isValidPartialPostcodeUK: vi.fn()
}))

vi.mock('../../common/helpers/sentence-case.js', () => ({
  sentenceCase: vi.fn()
}))

vi.mock('../helpers/convert-first-letter-into-upper-case.js', () => ({
  convertFirstLetterIntoUppercase: vi.fn()
}))
