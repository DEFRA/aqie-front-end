// '' Unit tests for health-effects helpers
import { describe, it, expect, vi } from 'vitest' // '' Vitest
import {
  getReadableLocationName,
  buildBackLinkModel,
  buildHealthEffectsViewModel
} from './index.js' // '' Helpers

describe("'' getReadableLocationName", () => {
  it("'' returns query.locationName when present", () => {
    expect(getReadableLocationName({ locationName: 'Leeds' }, { id: 'leeds_city' })).toBe('Leeds')
  })

  it("'' returns query.searchTerms when locationName missing", () => {
    expect(getReadableLocationName({ searchTerms: 'Bristol' }, { id: 'bristol_city' })).toBe('Bristol')
  })

  it("'' normalises params.id (underscores & hyphens -> spaces)", () => {
    expect(getReadableLocationName({}, { id: 'bristol_city-of_brIsTol' })).toBe('bristol city of brIsTol')
  })

  it("'' collapses multiple delimiter groups", () => {
    expect(getReadableLocationName({}, { id: 'alpha__beta---gamma' })).toBe('alpha beta gamma')
  })

  it("'' returns empty string when no query or id", () => {
    expect(getReadableLocationName({}, {})).toBe('')
  })

  it("'' returns empty and logs warn on error", () => {
    const logger = { warn: vi.fn() }
    // '' Force error: .trim() on non-string (object without trim)
    const badQuery = { locationName: {} }
    expect(getReadableLocationName(badQuery, {}, logger)).toBe('')
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
})

describe("'' buildBackLinkModel", () => {
  it("'' builds with provided readableName", () => {
    const m = buildBackLinkModel('Leeds')
    expect(m.backLinkText).toBe('Air pollution in Leeds')
    expect(m.backLinkUrl).toBe('javascript:history.back()')
  })

  it("'' falls back to 'this location' when empty", () => {
    const m = buildBackLinkModel('')
    expect(m.backLinkText).toBe('Air pollution in this location')
  })
})

describe("'' buildHealthEffectsViewModel", () => {
  it("'' sets defaults when content empty", () => {
    const vm = buildHealthEffectsViewModel({ readableName: 'Leeds' })
    expect(vm.pageTitle).toBe('Health effects of air pollution')
    expect(vm.description).toBe('')
    expect(vm.locationName).toBe('Leeds')
    expect(vm.serviceName).toBe('')
    expect(vm.lang).toBe('en')
    expect(vm.backLinkUrl).toBe('javascript:history.back()')
    expect(vm.backLinkText).toBe('Air pollution in Leeds')
  })

  it("'' uses content overrides", () => {
    const content = {
      healthEffects: { pageTitle: 'Custom Health Title', description: 'Custom description.' },
      multipleLocations: { serviceName: 'Air Quality Service' },
      footerTxt: 'Footer copy',
      cookieBanner: { enabled: true },
      phaseBanner: { phase: 'beta' }
    }
    const vm = buildHealthEffectsViewModel({
      content,
      metaSiteUrl: 'https://example.test/location/leeds',
      readableName: 'Leeds',
      lang: 'cy'
    })
    expect(vm.pageTitle).toBe('Custom Health Title')
    expect(vm.description).toBe('Custom description.')
    expect(vm.serviceName).toBe('Air Quality Service')
    expect(vm.lang).toBe('cy')
    expect(vm.metaSiteUrl).toBe('https://example.test/location/leeds')
    expect(vm.footerTxt).toBe('Footer copy')
    expect(vm.cookieBanner).toEqual({ enabled: true })
    expect(vm.phaseBanner).toEqual({ phase: 'beta' })
  })

  it("'' backlink props are consistent", () => {
    const vm = buildHealthEffectsViewModel({ readableName: 'York' })
    expect(vm.backLinkText).toBe('Air pollution in York')
    expect(vm.backLinkHref).toBe(vm.backLinkUrl)
    expect(vm.backlink).toEqual({ text: vm.backLinkText, href: vm.backLinkUrl })
  })
})