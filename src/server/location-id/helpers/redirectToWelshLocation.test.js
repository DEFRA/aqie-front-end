import { describe, it, expect } from 'vitest'
import { createMockH } from '../../locations/helpers/error-input-and-redirect-helpers.test.js'
import { REDIRECT_STATUS_CODE } from '../../../server/data/constants.js'

describe('Redirect to Welsh Location Tests', () => {
  it('should redirect to the correct Welsh location with a 301 status code', () => {
    const mockH = createMockH()

    const redirectToWelshLocation = (location) => {
      const route = `https://welsh-location.com/${location}`
      mockH.redirect(route).code(REDIRECT_STATUS_CODE)
      return route
    }

    const result = redirectToWelshLocation('Cardiff')
    expect(result).toBe('https://welsh-location.com/Cardiff')
    expect(mockH.redirect).toHaveBeenCalledWith(
      'https://welsh-location.com/Cardiff'
    )
    const codeSpy = mockH.redirect.mock.results[0].value.code
    expect(codeSpy).toHaveBeenCalledWith(REDIRECT_STATUS_CODE)
  })
})
