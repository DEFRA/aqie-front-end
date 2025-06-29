import { pollutantTypes, siteTypeDescriptions } from './monitoring-sites.js'

describe('pollutantTypes', () => {
  it('should have correct data for PM25', () => {
    expect(pollutantTypes.PM25).toEqual({
      title: 'PM2.5',
      href: '/llygryddion/mater-gronynnol-25/cy',
      low_range: '0 i 35'
    })
  })

  it('should have correct data for MP10', () => {
    expect(pollutantTypes.MP10).toEqual({
      title: 'PM10',
      href: '/llygryddion/mater-gronynnol-10/cy',
      low_range: '0 i 50'
    })
  })

  it('should have correct data for GE10', () => {
    expect(pollutantTypes.GE10).toEqual({
      title: 'PM10',
      href: '/llygryddion/mater-gronynnol-10/cy',
      low_range: '0 i 50'
    })
  })

  it('should have correct data for NO2', () => {
    expect(pollutantTypes.NO2).toEqual({
      title: 'Nitrogen deuocsid',
      href: '/llygryddion/nitrogen-deuocsid/cy',
      low_range: '0 i 200'
    })
  })

  it('should have correct data for O3', () => {
    expect(pollutantTypes.O3).toEqual({
      title: 'Osôn',
      href: '/llygryddion/oson/cy',
      low_range: '0 i 100'
    })
  })

  it('should have correct data for SO2', () => {
    expect(pollutantTypes.SO2).toEqual({
      title: 'Sylffwr deuocsid',
      href: '/llygryddion/sylffwr-deuocsid/cy',
      low_range: '0 i 100'
    })
  })
})

describe('siteTypeDescriptions', () => {
  it('should have correct description for Background Urban', () => {
    expect(siteTypeDescriptions['Background Urban']).toBe(
      "Mae'r ardal fonitro hon wedi'i lleoli mewn dinas neu dref. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol."
    )
  })

  it('should have correct description for Background Suburban', () => {
    expect(siteTypeDescriptions['Background Suburban']).toBe(
      "Mae'r ardal fonitro hon ar gyrion ardal drefol neu mewn ardal ei hun. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol."
    )
  })

  it('should have correct description for Background Rural', () => {
    expect(siteTypeDescriptions['Background Rural']).toBe(
      "Mae'r ardal fonitro hon mewn aneddiadau bach neu ardaloedd ag ecosystemau, coedwigoedd neu gnydau naturiol. Mae wedi'i leoli fel nad yw mesuriadau llygryddion yn dod o un ffynhonnell benodol."
    )
  })

  it('should have correct description for Industrial Suburban', () => {
    expect(siteTypeDescriptions['Industrial Suburban']).toBe(
      "Mae'r ardal fonitro hon ar gyrion ardal drefol neu mewn ardal ar ei phen ei hun ac i lawr y gwynt o ffynhonnell ddiwydiannol"
    )
  })

  it('should have correct description for Industrial Urban', () => {
    expect(siteTypeDescriptions['Industrial Urban']).toBe(
      "Mae'r ardal fonitro hon wedi'i lleoli mewn dinas neu dref i lawr y gwynt o ffynhonnell ddiwydiannol."
    )
  })

  it('should have correct description for Traffic Urban', () => {
    expect(siteTypeDescriptions['Traffic Urban']).toBe(
      'Mae’r ardal fonitro hon wedi’i lleoli mewn dinas neu dref sy’n agos at ffyrdd, traffyrdd neu briffyrdd.'
    )
  })
})
