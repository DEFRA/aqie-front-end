import { describe, it, expect } from 'vitest'
import { BASE_URL, REDIRECT_STATUS_CODE } from './constants.js'

describe('accessibility cy constants', () => {
  it('should export BASE_URL constant', () => {
    expect(BASE_URL).toBeDefined()
    expect(typeof BASE_URL).toBe('string')
  })

  it('should export REDIRECT_STATUS_CODE constant', () => {
    expect(REDIRECT_STATUS_CODE).toBeDefined()
    expect(typeof REDIRECT_STATUS_CODE).toBe('number')
    expect(REDIRECT_STATUS_CODE).toBe(301)
  })
})
