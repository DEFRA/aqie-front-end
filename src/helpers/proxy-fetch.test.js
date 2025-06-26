// Jest test for proxy-fetch.js
import { proxyFetch } from './proxy-fetch'
import { fetch as undiciFetch } from 'undici'

jest.mock('undici', () => ({
  ProxyAgent: jest.fn(() => ({
    dispatcher: jest.fn()
  })),
  fetch: jest.fn(() =>
    Promise.resolve({ ok: true, json: () => ({ data: 'mocked data' }) })
  )
}))

describe('Proxy Fetch', () => {
  it('should fetch data correctly using proxy', async () => {
    const data = await proxyFetch('https://example.com')
    expect(data).toBeDefined()
    expect(undiciFetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object)
    )
  })
})
