import { describe, it, expect } from 'vitest'
import { routes } from './routes.js'

describe('email-details routes', () => {
  it('includes GET and POST /notify/register/email-details', () => {
    const paths = routes.map((r) => `${r.method}:${r.path}`)
    expect(paths).toContain('GET:/notify/register/email-details')
    expect(paths).toContain('POST:/notify/register/email-details')
  })
})
