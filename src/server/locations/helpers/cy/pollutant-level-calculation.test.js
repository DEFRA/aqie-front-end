import { getPollutantLevelCy } from '~/src/server/locations/helpers/cy/pollutant-level-calculation'

describe('getPollutantLevelCy', () => {
  it('should return correct DAQI and band for PM10', () => {
    expect(getPollutantLevelCy(30, 'PM10')).toEqual({
      getDaqi: 1,
      getBand: 'Isel'
    })
    expect(getPollutantLevelCy(60, 'PM10')).toEqual({
      getDaqi: 4,
      getBand: 'Cymedrol'
    })
    expect(getPollutantLevelCy(80, 'PM10')).toEqual({
      getDaqi: 7,
      getBand: 'Uchel'
    })
    expect(getPollutantLevelCy(110, 'PM10')).toEqual({
      getDaqi: 10,
      getBand: 'Uchel iawn'
    })
  })

  it('should return correct DAQI and band for NO2', () => {
    expect(getPollutantLevelCy(150, 'NO2')).toEqual({
      getDaqi: 1,
      getBand: 'Isel'
    })
    expect(getPollutantLevelCy(300, 'NO2')).toEqual({
      getDaqi: 4,
      getBand: 'Cymedrol'
    })
    expect(getPollutantLevelCy(500, 'NO2')).toEqual({
      getDaqi: 7,
      getBand: 'Uchel'
    })
    expect(getPollutantLevelCy(700, 'NO2')).toEqual({
      getDaqi: 10,
      getBand: 'Uchel iawn'
    })
  })

  it('should return correct DAQI and band for PM25', () => {
    expect(getPollutantLevelCy(20, 'PM25')).toEqual({
      getDaqi: 1,
      getBand: 'Isel'
    })
    expect(getPollutantLevelCy(40, 'PM25')).toEqual({
      getDaqi: 4,
      getBand: 'Cymedrol'
    })
    expect(getPollutantLevelCy(60, 'PM25')).toEqual({
      getDaqi: 7,
      getBand: 'Uchel'
    })
    expect(getPollutantLevelCy(80, 'PM25')).toEqual({
      getDaqi: 10,
      getBand: 'Uchel iawn'
    })
  })

  it('should return correct DAQI and band for SO2', () => {
    expect(getPollutantLevelCy(200, 'SO2')).toEqual({
      getDaqi: 1,
      getBand: 'Isel'
    })
    expect(getPollutantLevelCy(500, 'SO2')).toEqual({
      getDaqi: 4,
      getBand: 'Cymedrol'
    })
    expect(getPollutantLevelCy(800, 'SO2')).toEqual({
      getDaqi: 7,
      getBand: 'Uchel'
    })
    expect(getPollutantLevelCy(1100, 'SO2')).toEqual({
      getDaqi: 10,
      getBand: 'Uchel iawn'
    })
  })

  it('should return correct DAQI and band for O3', () => {
    expect(getPollutantLevelCy(80, 'O3')).toEqual({
      getDaqi: 1,
      getBand: 'Isel'
    })
    expect(getPollutantLevelCy(120, 'O3')).toEqual({
      getDaqi: 4,
      getBand: 'Cymedrol'
    })
    expect(getPollutantLevelCy(200, 'O3')).toEqual({
      getDaqi: 7,
      getBand: 'Uchel'
    })
    expect(getPollutantLevelCy(250, 'O3')).toEqual({
      getDaqi: 10,
      getBand: 'Uchel iawn'
    })
  })

  it('should return default values for unknown pollutant', () => {
    expect(getPollutantLevelCy(100, 'UNKNOWN')).toEqual({
      getDaqi: 0,
      getBand: ''
    })
  })
})
