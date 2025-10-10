import { describe, it, expect } from 'vitest'
import { CONTEXT_PLACEHOLDER } from './context.js'

describe('nunjucks context', () => {
  it('should export CONTEXT_PLACEHOLDER constant', () => {
    expect(CONTEXT_PLACEHOLDER).toBeDefined()
    expect(typeof CONTEXT_PLACEHOLDER).toBe('string')
    expect(CONTEXT_PLACEHOLDER).toBe('placeholder')
  })
})
