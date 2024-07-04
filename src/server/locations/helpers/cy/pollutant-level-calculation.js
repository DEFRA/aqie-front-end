/* eslint-disable prettier/prettier */
function getPollutantLevelCy(polValue, pollutant) {
  let getDaqi = 0
  let getBand = ''
  if (pollutant === 'PM10' || pollutant === 'GE10') {
    if (polValue <= 50) {
      getDaqi = 1
      getBand = 'Isel'
    }
    if (polValue > 50 && polValue <= 75) {
      getDaqi = 4
      getBand = 'Cymedrol'
    }
    if (polValue > 75 && polValue <= 100) {
      getDaqi = 7
      getBand = 'Uchel'
    }
    if (polValue > 100) {
      getDaqi = 10
      getBand = 'Uchel iawn'
    }
  }
  if (pollutant === 'NO2') {
    if (polValue <= 200) {
      getDaqi = 1
      getBand = 'Isel'
    }
    if (polValue > 200 && polValue <= 400) {
      getDaqi = 4
      getBand = 'Cymedrol'
    }
    if (polValue > 400 && polValue <= 600) {
      getDaqi = 7
      getBand = 'Uchel'
    }
    if (polValue > 600) {
      getDaqi = 10
      getBand = 'Uchel iawn'
    }
  }
  if (pollutant === 'PM25') {
    if (polValue <= 36) {
      getDaqi = 1
      getBand = 'Isel'
    }
    if (polValue > 36 && polValue <= 53) {
      getDaqi = 4
      getBand = 'Cymedrol'
    }
    if (polValue > 53 && polValue <= 70) {
      getDaqi = 7
      getBand = 'Uchel'
    }
    if (polValue > 70) {
      getDaqi = 10
      getBand = 'Uchel iawn'
    }
  }
  if (pollutant === 'SO2') {
    if (polValue <= 266) {
      getDaqi = 1
      getBand = 'Isel'
    }
    if (polValue > 266 && polValue <= 710) {
      getDaqi = 4
      getBand = 'Cymedrol'
    }
    if (polValue > 710 && polValue <= 1064) {
      getDaqi = 7
      getBand = 'Uchel'
    }
    if (polValue > 1064) {
      getDaqi = 10
      getBand = 'Uchel iawn'
    }
  }
  if (pollutant === 'O3') {
    if (polValue <= 100) {
      getDaqi = 1
      getBand = 'Isel'
    }
    if (polValue > 100 && polValue <= 160) {
      getDaqi = 4
      getBand = 'Cymedrol'
    }
    if (polValue > 160 && polValue <= 240) {
      getDaqi = 7
      getBand = 'Uchel'
    }
    if (polValue > 240) {
      getDaqi = 10
      getBand = 'Uchel iawn'
    }
  }
  return { getDaqi, getBand }
}

export { getPollutantLevelCy }
