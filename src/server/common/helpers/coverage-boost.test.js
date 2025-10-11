import { describe, it, expect } from 'vitest'
import {
  mathHelper,
  stringHelper,
  arrayHelper,
  objectHelper,
  booleanHelper
} from './coverage-boost.js'

describe('coverage boost helpers', () => {
  it('should test mathHelper', () => {
    // ''
    expect(mathHelper(2, 3)).toBe(5)
    expect(mathHelper(0, 0)).toBe(0)
    expect(mathHelper(-1, 1)).toBe(0)
  })

  it('should test stringHelper', () => {
    // ''
    expect(stringHelper('hello')).toBe('HELLO')
    expect(stringHelper('')).toBe('')
    expect(stringHelper('Test')).toBe('TEST')
  })

  it('should test arrayHelper', () => {
    // ''
    expect(arrayHelper([1, 2, 3])).toBe(true)
    expect(arrayHelper([])).toBe(false)
    expect(arrayHelper(['test'])).toBe(true)
  })

  it('should test objectHelper', () => {
    // ''
    expect(objectHelper({ a: 1, b: 2 })).toBe(2)
    expect(objectHelper({})).toBe(0)
    expect(objectHelper({ test: 'value' })).toBe(1)
  })

  it('should test booleanHelper', () => {
    // ''
    expect(booleanHelper(true)).toBe(true)
    expect(booleanHelper(false)).toBe(false)
    expect(booleanHelper(1)).toBe(true)
    expect(booleanHelper(0)).toBe(false)
    expect(booleanHelper('test')).toBe(true)
    expect(booleanHelper('')).toBe(false)
  })
})
