import { describe, it, expect } from 'vitest'
import { routes } from './routes.js'

describe('notify-register/routes', () => {
  it('exports notify-register route definitions', () => {
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBeGreaterThan(6)
  })

  it('contains key notify-register paths', () => {
    const paths = routes.map((route) => route.path)

    expect(paths).toContain('/notify/text-alerts')
    expect(paths).toContain('/notify/email-alerts')
    expect(paths).toContain('/notify/confirm-alert')
    expect(paths).toContain('/notify/success')
    expect(paths).toContain('/notify/mobile-phone')
    expect(paths).toContain('/notify/activation-code')
    expect(paths).toContain('/notify/enter-email')
  })
})
