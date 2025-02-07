import {
  pollutantTypes,
  siteTypeDescriptions
} from '~/src/server/data/en/monitoring-sites.js'

describe('pollutantTypes', () => {
  it('should have correct data for NO2', () => {
    expect(pollutantTypes.NO2).toEqual({
      title: 'Nitrogen dioxide',
      href: '/pollutants/nitrogen-dioxide',
      low_range: '0 to 200'
    })
  })

  it('should have correct data for MP10', () => {
    expect(pollutantTypes.MP10).toEqual({
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
})

describe('siteTypeDescriptions', () => {
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
})
