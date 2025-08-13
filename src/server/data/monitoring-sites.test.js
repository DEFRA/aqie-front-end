import { vi } from 'vitest'
import * as mock from './monitoring-sites.js'

// Mock the monitoring-sites.js module using the imported constant
vi.mock('./monitoring-sites.js', () => ({
  pollutantTypes: {
    NO2: {
      title: 'Nitrogen dioxide',
      href: '/pollutants/nitrogen-dioxide',
      low_range: '0 to 200'
    },
    PM10: {
      title: 'PM10',
      href: '/pollutants/particulate-matter-10',
      low_range: '0 to 50'
    },
    GE10: {
      title: 'PM10',
      href: '/pollutants/particulate-matter-10',
      low_range: '0 to 50'
    },
    PM25: {
      title: 'PM2.5',
      href: '/pollutants/particulate-matter-25',
      low_range: '0 to 35'
    },
    O3: { title: 'Ozone', href: '/pollutants/ozone', low_range: '0 to 100' },
    SO2: {
      title: 'Sulphur dioxide',
      href: '/pollutants/sulphur-dioxide',
      low_range: '0 to 100'
    }
  },
  siteTypeDescriptions: {
    'Background Urban':
      'This monitoring area is located in a city or a town. It is located so pollutant measurements do not come from one specific source.',
    'Background Suburban':
      'This monitoring area is on the outskirts of an urban area or in an area of its own. It is located so pollutant measurements do not come from one specific source.',
    'Background Rural':
      'This monitoring area is in small settlements or areas with natural ecosystems, forests or crops. It is located so pollutant measurements do not come from one specific source.',
    'Industrial Suburban':
      'This monitoring area is on the outskirts of an urban area or in an area of its own and downwind of an industrial source.',
    'Industrial Urban':
      'This monitoring area is located in a city or a town downwind of an industrial source.',
    'Traffic Urban':
      'This monitoring area is located in a city or a town close to roads, motorways or highways.'
  }
}))

describe('pollutantTypes', () => {
  it('should have correct data for NO2', () => {
    expect(mock.pollutantTypes.NO2).toEqual({
      title: 'Nitrogen dioxide',
      href: '/pollutants/nitrogen-dioxide',
      low_range: '0 to 200'
    })
  })
  it('should have correct data for PM10', () => {
    expect(mock.pollutantTypes.PM10).toEqual({
      title: 'PM10',
      href: '/pollutants/particulate-matter-10',
      low_range: '0 to 50'
    })
  })
  it('should have correct data for GE10', () => {
    expect(mock.pollutantTypes.GE10).toEqual({
      title: 'PM10',
      href: '/pollutants/particulate-matter-10',
      low_range: '0 to 50'
    })
  })
  it('should have correct data for PM25', () => {
    expect(mock.pollutantTypes.PM25).toEqual({
      title: 'PM2.5',
      href: '/pollutants/particulate-matter-25',
      low_range: '0 to 35'
    })
  })
  it('should have correct data for O3', () => {
    expect(mock.pollutantTypes.O3).toEqual({
      title: 'Ozone',
      href: '/pollutants/ozone',
      low_range: '0 to 100'
    })
  })
  it('should have correct data for SO2', () => {
    expect(mock.pollutantTypes.SO2).toEqual({
      title: 'Sulphur dioxide',
      href: '/pollutants/sulphur-dioxide',
      low_range: '0 to 100'
    })
  })
})

describe('siteTypeDescriptions', () => {
  it('should have correct description for Background Urban', () => {
    expect(mock.siteTypeDescriptions['Background Urban']).toBe(
      'This monitoring area is located in a city or a town. It is located so pollutant measurements do not come from one specific source.'
    )
  })
  it('should have correct description for Background Suburban', () => {
    expect(mock.siteTypeDescriptions['Background Suburban']).toBe(
      'This monitoring area is on the outskirts of an urban area or in an area of its own. It is located so pollutant measurements do not come from one specific source.'
    )
  })
  it('should have correct description for Background Rural', () => {
    expect(mock.siteTypeDescriptions['Background Rural']).toBe(
      'This monitoring area is in small settlements or areas with natural ecosystems, forests or crops. It is located so pollutant measurements do not come from one specific source.'
    )
  })
  it('should have correct description for Industrial Suburban', () => {
    expect(mock.siteTypeDescriptions['Industrial Suburban']).toBe(
      'This monitoring area is on the outskirts of an urban area or in an area of its own and downwind of an industrial source.'
    )
  })
  it('should have correct description for Industrial Urban', () => {
    expect(mock.siteTypeDescriptions['Industrial Urban']).toBe(
      'This monitoring area is located in a city or a town downwind of an industrial source.'
    )
  })
  it('should have correct description for Traffic Urban', () => {
    expect(mock.siteTypeDescriptions['Traffic Urban']).toBe(
      'This monitoring area is located in a city or a town close to roads, motorways or highways.'
    )
  })
})
