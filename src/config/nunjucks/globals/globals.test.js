import { describe, test, expect } from 'vitest'

describe('Nunjucks Globals', () => {
  test('should export govukRebrand flag', async () => {
    // ''
    const globals = await import('./globals.js')

    expect(globals.govukRebrand).toBe(true)
  })

  test('should have boolean value for govukRebrand', async () => {
    // ''
    const { govukRebrand } = await import('./globals.js')

    expect(typeof govukRebrand).toBe('boolean')
    expect(govukRebrand).toBe(true)
  })

  test('should export only govukRebrand', async () => {
    // ''
    const globals = await import('./globals.js')

    const exportKeys = Object.keys(globals)
    expect(exportKeys).toContain('govukRebrand')
    expect(exportKeys.length).toBe(1)
  })
})
