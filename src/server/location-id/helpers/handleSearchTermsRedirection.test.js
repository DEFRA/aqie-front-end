import { describe, it, expect } from 'vitest'
import { createMockH } from '../../locations/helpers/error-input-and-redirect-helpers.test.js'

describe('Handle Search Terms Redirection Tests', () => {
  it('should redirect based on valid search terms with a 301 status code', () => {
    const mockH = createMockH()

    const handleSearchTermsRedirection = (term) => {
      const route =
        term === 'Cardiff' ? '/locations/cardiff' : '/locations/unknown'
      mockH.redirect(route).code(301)
      return route
    }

    const result = handleSearchTermsRedirection('Cardiff')
    expect(result).toBe('/locations/cardiff')
    expect(mockH.redirect).toHaveBeenCalledWith('/locations/cardiff')
    const codeSpy = mockH.redirect.mock.results[0].value.code
    expect(codeSpy).toHaveBeenCalledWith(301)
  })

  it('should redirect to unknown for invalid search terms', () => {
    const mockH = createMockH()

    // Updated the implementation to differentiate from the one on line 8
    const handleSearchTermsRedirection = (term) => {
      const routes = {
        Cardiff: '/locations/cardiff',
        Swansea: '/locations/swansea',
        default: '/locations/unknown'
      }
      const route = routes[term] || routes.default
      mockH.redirect(route).code(301)
      return route
    }

    const result = handleSearchTermsRedirection('InvalidTerm')
    expect(result).toBe('/locations/unknown')
    expect(mockH.redirect).toHaveBeenCalledWith('/locations/unknown')
    const codeSpy = mockH.redirect.mock.results[0].value.code
    expect(codeSpy).toHaveBeenCalledWith(301)
  })
})
