import { pollutantTypes, siteTypeDescriptions } from './monitoring-sites.js'

/* global describe, it, expect */

describe('monitoring-sites data module', () => {
  describe('pollutantTypes', () => {
    it('should export pollutantTypes object', () => {
      expect(pollutantTypes).toBeDefined()
      expect(typeof pollutantTypes).toBe('object')
    })

    it('should have correct structure for all pollutant types', () => {
      const expectedKeys = ['NO2', 'PM10', 'GE10', 'PM25', 'O3', 'SO2']
      expect(Object.keys(pollutantTypes)).toEqual(
        expect.arrayContaining(expectedKeys)
      )
      expect(Object.keys(pollutantTypes)).toHaveLength(6)
    })

    it('should have correct data for NO2', () => {
      expect(pollutantTypes.NO2).toEqual({
        title: 'Nitrogen dioxide',
        href: '/pollutants/nitrogen-dioxide',
        low_range: '0 to 200'
      })
    })

    it('should have correct data for PM10', () => {
      expect(pollutantTypes.PM10).toEqual({
        title: 'PM10',
        href: '/pollutants/particulate-matter-10',
        low_range: '0 to 50'
      })
    })

    it('should have correct data for GE10', () => {
      expect(pollutantTypes.GE10).toEqual({
        title: 'PM10',
        href: '/pollutants/particulate-matter-10',
        low_range: '0 to 50'
      })
    })

    it('should have correct data for PM25', () => {
      expect(pollutantTypes.PM25).toEqual({
        title: 'PM2.5',
        href: '/pollutants/particulate-matter-25',
        low_range: '0 to 35'
      })
    })

    it('should have correct data for O3', () => {
      expect(pollutantTypes.O3).toEqual({
        title: 'Ozone',
        href: '/pollutants/ozone',
        low_range: '0 to 100'
      })
    })

    it('should have correct data for SO2', () => {
      expect(pollutantTypes.SO2).toEqual({
        title: 'Sulphur dioxide',
        href: '/pollutants/sulphur-dioxide',
        low_range: '0 to 100'
      })
    })

    it('should have consistent structure for all pollutant types', () => {
      Object.values(pollutantTypes).forEach((pollutant) => {
        expect(pollutant).toHaveProperty('title')
        expect(pollutant).toHaveProperty('href')
        expect(pollutant).toHaveProperty('low_range')
        expect(typeof pollutant.title).toBe('string')
        expect(typeof pollutant.href).toBe('string')
        expect(typeof pollutant.low_range).toBe('string')
        expect(pollutant.href).toMatch(/^\/pollutants\//)
        expect(pollutant.low_range).toMatch(/^\d{1,6} to \d{1,6}$/)
      })
    })
  })

  describe('siteTypeDescriptions', () => {
    it('should export siteTypeDescriptions object', () => {
      expect(siteTypeDescriptions).toBeDefined()
      expect(typeof siteTypeDescriptions).toBe('object')
    })

    it('should have correct structure for all site types', () => {
      const expectedKeys = [
        'Background Urban',
        'Background Suburban',
        'Background Rural',
        'Industrial Suburban',
        'Industrial Urban',
        'Traffic Urban'
      ]
      expect(Object.keys(siteTypeDescriptions)).toEqual(
        expect.arrayContaining(expectedKeys)
      )
      expect(Object.keys(siteTypeDescriptions)).toHaveLength(6)
    })

    it('should have correct description for Background Urban', () => {
      expect(siteTypeDescriptions['Background Urban']).toBe(
        'This monitoring area is located in a city or a town. It is located so pollutant measurements do not come from one specific source.'
      )
    })

    it('should have correct description for Background Suburban', () => {
      expect(siteTypeDescriptions['Background Suburban']).toBe(
        'This monitoring area is on the outskirts of an urban area or in an area of its own. It is located so pollutant measurements do not come from one specific source.'
      )
    })

    it('should have correct description for Background Rural', () => {
      expect(siteTypeDescriptions['Background Rural']).toBe(
        'This monitoring area is in small settlements or areas with natural ecosystems, forests or crops. It is located so pollutant measurements do not come from one specific source.'
      )
    })

    it('should have correct description for Industrial Suburban', () => {
      expect(siteTypeDescriptions['Industrial Suburban']).toBe(
        'This monitoring area is on the outskirts of an urban area or in an area of its own and downwind of an industrial source.'
      )
    })

    it('should have correct description for Industrial Urban', () => {
      expect(siteTypeDescriptions['Industrial Urban']).toBe(
        'This monitoring area is located in a city or a town downwind of an industrial source.'
      )
    })

    it('should have correct description for Traffic Urban', () => {
      expect(siteTypeDescriptions['Traffic Urban']).toBe(
        'This monitoring area is located in a city or a town close to roads, motorways or highways.'
      )
    })

    it('should have meaningful descriptions for all site types', () => {
      Object.entries(siteTypeDescriptions).forEach(
        ([siteType, description]) => {
          expect(typeof description).toBe('string')
          expect(description.length).toBeGreaterThan(50) // Ensure substantial descriptions
          expect(description).toMatch(/^This monitoring area/) // Common pattern
          expect(siteType).toMatch(/^(Background|Industrial|Traffic)/) // Valid category
        }
      )
    })
  })

  describe('data integrity', () => {
    it('should not have any undefined or null values', () => {
      // Check pollutantTypes
      Object.values(pollutantTypes).forEach((pollutant) => {
        Object.values(pollutant).forEach((value) => {
          expect(value).toBeDefined()
          expect(value).not.toBeNull()
          expect(value).not.toBe('')
        })
      })

      // Check siteTypeDescriptions
      Object.values(siteTypeDescriptions).forEach((description) => {
        expect(description).toBeDefined()
        expect(description).not.toBeNull()
        expect(description).not.toBe('')
      })
    })

    it('should have duplicate href values only for PM10 and GE10', () => {
      const hrefs = Object.values(pollutantTypes).map((p) => p.href)
      const uniqueHrefs = [...new Set(hrefs)]
      expect(hrefs).toHaveLength(6) // 6 pollutants
      expect(uniqueHrefs).toHaveLength(5) // 5 unique hrefs (PM10 and GE10 share one)

      // Verify PM10 and GE10 share the same href
      expect(pollutantTypes.PM10.href).toBe(pollutantTypes.GE10.href)
    })

    it('should have valid low_range formats', () => {
      Object.values(pollutantTypes).forEach((pollutant) => {
        expect(pollutant.low_range).toMatch(/^\d{1,6} to \d{1,6}$/)
        const [start, , end] = pollutant.low_range.split(' ')
        expect(parseInt(start)).toBeLessThan(parseInt(end))
      })
    })
  })
})
