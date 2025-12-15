import { describe, test, expect, vi } from 'vitest'
import {
  routes,
  configureRoutes,
  emailVerifyGetController,
  emailVerifyPostController
} from './routes.js'

describe('Email Verify Code Routes', () => {
  test('configureRoutes returns proper configuration', () => {
    const mockGet = { handler: vi.fn() }
    const mockPost = { handler: vi.fn() }
    const result = configureRoutes(mockGet, mockPost)
    expect(result).toEqual([
      {
        method: 'GET',
        path: '/notify/register/email-verify-code',
        handler: mockGet.handler
      },
      {
        method: 'POST',
        path: '/notify/register/email-verify-code',
        handler: mockPost.handler
      }
    ])
  })

  test('routes array defined', () => {
    expect(Array.isArray(routes)).toBe(true)
    expect(routes).toHaveLength(2)
  })

  test('controllers expose handlers', () => {
    expect(typeof emailVerifyGetController.handler).toBe('function')
    expect(typeof emailVerifyPostController.handler).toBe('function')
  })
})
