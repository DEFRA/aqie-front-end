// Tests for SMS verify code routes ''
import { describe, it, expect } from 'vitest'
import { routes } from './routes.js'

describe('SMS Verify Code Routes', () => {
  it('should export routes array', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
  })

  it('should have GET route for /notify/register/sms-verify-code', () => {
    const getRoute = routes.find(
      (route) =>
        route.method === 'GET' &&
        route.path === '/notify/register/sms-verify-code'
    )

    expect(getRoute).toBeDefined()
    expect(getRoute.handler).toBeDefined()
    expect(getRoute.options.description).toBe('Get SMS verify code page')
  })

  it('should have POST route for /notify/register/sms-verify-code', () => {
    const postRoute = routes.find(
      (route) =>
        route.method === 'POST' &&
        route.path === '/notify/register/sms-verify-code'
    )

    expect(postRoute).toBeDefined()
    expect(postRoute.handler).toBeDefined()
    expect(postRoute.options.description).toBe('Post SMS verify code page')
  })

  it('should have exactly 2 routes', () => {
    expect(routes).toHaveLength(2)
  })
})
