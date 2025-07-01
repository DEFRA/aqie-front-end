import {
  handleMissingLocation,
  handleUKError,
  handleNIError,
  formatPostcode
} from './error-input-and-redirect-helpers'
import { LANG_EN, LANG_CY } from '../../data/constants.js'

// Mock English and Welsh data
vi.mock('../../data/en/en.js', () => ({
  english: {
    searchLocation: {
      errorText: {
        radios: {
          title: 'English Radios Title',
          list: { text: 'English Radios Error Text' }
        },
        uk: {
          fields: {
            title: 'English UK Fields Title',
            list: { text: 'English UK Fields Error Text' }
          }
        },
        ni: {
          fields: {
            title: 'English NI Fields Title',
            list: { text: 'English NI Fields Error Text' }
          }
        }
      }
    }
  }
}))

vi.mock('../../data/cy/cy.js', () => ({
  welsh: {
    searchLocation: {
      errorText: {
        radios: {
          title: 'Welsh Radios Title',
          list: { text: 'Welsh Radios Error Text' }
        },
        uk: {
          fields: {
            title: 'Welsh UK Fields Title',
            list: { text: 'Welsh UK Fields Error Text' }
          }
        },
        ni: {
          fields: {
            title: 'Welsh NI Fields Title',
            list: { text: 'Welsh NI Fields Error Text' }
          }
        }
      }
    }
  }
}))

describe('error-input-and-redirect-helpers', () => {
  let mockRequest, mockH
  // ''

  beforeEach(() => {
    mockRequest = {
      yar: {
        set: vi.fn()
      }
    }

    mockH = {
      redirect: vi.fn(() => ({ takeover: vi.fn() }))
    }

    vi.clearAllMocks()
  })

  describe('handleMissingLocation', () => {
    it('should set errors and redirect for English language', () => {
      handleMissingLocation(mockRequest, mockH, LANG_EN)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', {
        errors: {
          titleText: 'English Radios Title',
          errorList: [
            {
              text: 'English Radios Error Text',
              href: '#locationType'
            }
          ]
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', {
        errorMessage: {
          text: 'English Radios Error Text'
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationType', '')
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        ''
      )
      expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
      // ''
    })

    it('should set errors and redirect for Welsh language', () => {
      handleMissingLocation(mockRequest, mockH, LANG_CY)

      expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', {
        errors: {
          titleText: 'Welsh Radios Title',
          errorList: [
            {
              text: 'Welsh Radios Error Text',
              href: '#locationType'
            }
          ]
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', {
        errorMessage: {
          text: 'Welsh Radios Error Text'
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('locationType', '')
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        ''
      )
      expect(mockH.redirect).toHaveBeenCalledWith('chwilio-lleoliad/cy?lang=cy')
      // ''
    })
  })

  describe('handleUKError', () => {
    it('should set UK-specific errors and redirect for English language', () => {
      handleUKError(mockRequest, mockH, LANG_EN, 'London')

      expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', {
        errors: {
          titleText: 'English UK Fields Title',
          errorList: [
            {
              text: 'English UK Fields Error Text',
              href: '#engScoWal'
            }
          ]
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', {
        errorMessage: {
          text: 'English UK Fields Error Text'
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        'London'
      )
      expect(mockH.redirect).toHaveBeenCalledWith('/search-location?lang=en')
      // ''
    })
  })

  describe('handleNIError', () => {
    it('should set NI-specific errors and redirect for Welsh language', () => {
      handleNIError(mockRequest, mockH, LANG_CY, 'Belfast')

      expect(mockRequest.yar.set).toHaveBeenCalledWith('errors', {
        errors: {
          titleText: 'Welsh NI Fields Title',
          errorList: [
            {
              text: 'Welsh NI Fields Error Text',
              href: '#ni'
            }
          ]
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith('errorMessage', {
        errorMessage: {
          text: 'Welsh NI Fields Error Text'
        }
      })
      expect(mockRequest.yar.set).toHaveBeenCalledWith(
        'locationNameOrPostcode',
        'Belfast'
      )
      expect(mockH.redirect).toHaveBeenCalledWith('chwilio-lleoliad/cy?lang=cy')
      // ''
    })
  })

  describe('formatPostcode', () => {
    it('should format a valid UK postcode by adding a space', () => {
      const result = formatPostcode('SW1A1AA')
      expect(result).toBe('SW1A 1AA')
    })

    it('should return the postcode unchanged if already formatted', () => {
      const result = formatPostcode('SW1A 1AA')
      expect(result).toBe('SW1A 1AA')
    })

    it('should return the input unchanged if it is not a valid postcode', () => {
      const result = formatPostcode('INVALID')
      expect(result).toBe('INVALID')
    })
  })
})
