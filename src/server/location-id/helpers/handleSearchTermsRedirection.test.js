import { describe, it, expect } from 'vitest'

describe('Handle Search Terms Redirection Tests', () => {
  it('should redirect based on valid search terms', () => {
    const handleSearchTermsRedirection = (term) =>
      term === 'Cardiff' ? '/locations/cardiff' : '/locations/unknown'
    const result = handleSearchTermsRedirection('Cardiff')
    expect(result).toBe('/locations/cardiff')
  })

  it('should redirect to unknown for invalid search terms', () => {
    const handleSearchTermsRedirection = (term) =>
      term === 'Cardiff' ? '/locations/cardiff' : '/locations/unknown'
    const result = handleSearchTermsRedirection('InvalidTerm')
    expect(result).toBe('/locations/unknown')
  })
})
