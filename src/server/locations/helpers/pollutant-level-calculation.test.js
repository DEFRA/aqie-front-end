import { getPollutantLevel } from './pollutant-level-calculation'

describe('getPollutantLevel', () => {
  it('should return correct DAQI and band for PM10', () => {
    expect(getPollutantLevel(30, 'PM10')).toEqual({
      getDaqi: 1,
      getBand: 'Low'
    })
    expect(getPollutantLevel(60, 'PM10')).toEqual({
      getDaqi: 4,
      getBand: 'Moderate'
    })
    expect(getPollutantLevel(80, 'PM10')).toEqual({
      getDaqi: 7,
      getBand: 'High'
    })
    expect(getPollutantLevel(110, 'PM10')).toEqual({
      getDaqi: 10,
      getBand: 'Very high'
    })
  })

  it('should return correct DAQI and band for NO2', () => {
    expect(getPollutantLevel(150, 'NO2')).toEqual({
      getDaqi: 1,
      getBand: 'Low'
    })
    expect(getPollutantLevel(300, 'NO2')).toEqual({
      getDaqi: 4,
      getBand: 'Moderate'
    })
    expect(getPollutantLevel(500, 'NO2')).toEqual({
      getDaqi: 7,
      getBand: 'High'
    })
    expect(getPollutantLevel(700, 'NO2')).toEqual({
      getDaqi: 10,
      getBand: 'Very high'
    })
  })

  it('should return correct DAQI and band for PM25', () => {
    expect(getPollutantLevel(20, 'PM25')).toEqual({
      getDaqi: 1,
      getBand: 'Low'
    })
    expect(getPollutantLevel(40, 'PM25')).toEqual({
      getDaqi: 4,
      getBand: 'Moderate'
    })
    expect(getPollutantLevel(60, 'PM25')).toEqual({
      getDaqi: 7,
      getBand: 'High'
    })
    expect(getPollutantLevel(80, 'PM25')).toEqual({
      getDaqi: 10,
      getBand: 'Very high'
    })
  })

  it('should return correct DAQI and band for SO2', () => {
    expect(getPollutantLevel(200, 'SO2')).toEqual({
      getDaqi: 1,
      getBand: 'Low'
    })
    expect(getPollutantLevel(500, 'SO2')).toEqual({
      getDaqi: 4,
      getBand: 'Moderate'
    })
    expect(getPollutantLevel(800, 'SO2')).toEqual({
      getDaqi: 7,
      getBand: 'High'
    })
    expect(getPollutantLevel(1100, 'SO2')).toEqual({
      getDaqi: 10,
      getBand: 'Very high'
    })
  })

  it('should return correct DAQI and band for O3', () => {
    expect(getPollutantLevel(80, 'O3')).toEqual({ getDaqi: 1, getBand: 'Low' })
    expect(getPollutantLevel(120, 'O3')).toEqual({
      getDaqi: 4,
      getBand: 'Moderate'
    })
    expect(getPollutantLevel(200, 'O3')).toEqual({
      getDaqi: 7,
      getBand: 'High'
    })
    expect(getPollutantLevel(250, 'O3')).toEqual({
      getDaqi: 10,
      getBand: 'Very high'
    })
  })

  it('should return default values for unknown pollutant', () => {
    expect(getPollutantLevel(100, 'UNKNOWN')).toEqual({
      getDaqi: 0,
      getBand: ''
    })
  })
})
