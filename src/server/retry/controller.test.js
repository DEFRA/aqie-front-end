import { describe, expect, test } from 'vitest'
import { buildViewModel, determineLanguage } from './controller.js'

// ''

const buildRequest = ({ payload, query, referer } = {}) => ({
  payload,
  query,
  headers: referer ? { referer } : {}
})

describe('retry controller helpers', () => {
  test('determineLanguage returns cy from payload', () => {
    const request = buildRequest({ payload: { lang: 'cy' } })
    expect(determineLanguage(request)).toBe('cy')
  })

  test('determineLanguage returns cy from referer', () => {
    const request = buildRequest({
      referer: 'https://example/chwilio-lleoliad/cy'
    })
    expect(determineLanguage(request)).toBe('cy')
  })

  test('determineLanguage defaults to en', () => {
    const request = buildRequest()
    expect(determineLanguage(request)).toBe('en')
  })

  test('buildViewModel includes payload and lang', () => {
    const viewModel = buildViewModel({
      metaSiteUrl: 'https://example',
      lang: 'en',
      payload: { locationType: 'uk-location' }
    })

    expect(viewModel.lang).toBe('en')
    expect(viewModel.payload).toEqual({ locationType: 'uk-location' })
  })
})
