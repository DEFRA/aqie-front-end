function getPollutantLevel(polValue, pollutant) {
  let getDaqi = 0
  let getBand = ''
  if (pollutant === 'PM10' || pollutant === 'GE10') {
    if (polValue <= 50) {
      getDaqi = 1
      getBand = 'Low'
    }
    if (polValue > 50 && polValue <= 75) {
      getDaqi = 4
      getBand = 'Moderate'
    }
    if (polValue > 75 && polValue <= 100) {
      getDaqi = 7
      getBand = 'High'
    }
    if (polValue > 100) {
      getDaqi = 10
      getBand = 'Very high'
    }
  }
  if (pollutant === 'NO2') {
    if (polValue <= 200) {
      getDaqi = 1
      getBand = 'Low'
    }
    if (polValue > 200 && polValue <= 400) {
      getDaqi = 4
      getBand = 'Moderate'
    }
    if (polValue > 400 && polValue <= 600) {
      getDaqi = 7
      getBand = 'High'
    }
    if (polValue > 600) {
      getDaqi = 10
      getBand = 'Very high'
    }
  }
  if (pollutant === 'PM25') {
    if (polValue <= 36) {
      getDaqi = 1
      getBand = 'Low'
    }
    if (polValue > 36 && polValue <= 53) {
      getDaqi = 4
      getBand = 'Moderate'
    }
    if (polValue > 53 && polValue <= 70) {
      getDaqi = 7
      getBand = 'High'
    }
    if (polValue > 70) {
      getDaqi = 10
      getBand = 'Very high'
    }
  }
  if (pollutant === 'SO2') {
    if (polValue <= 266) {
      getDaqi = 1
      getBand = 'Low'
    }
    if (polValue > 266 && polValue <= 710) {
      getDaqi = 4
      getBand = 'Moderate'
    }
    if (polValue > 710 && polValue <= 1064) {
      getDaqi = 7
      getBand = 'High'
    }
    if (polValue > 1064) {
      getDaqi = 10
      getBand = 'Very high'
    }
  }
  if (pollutant === 'O3') {
    if (polValue <= 100) {
      getDaqi = 1
      getBand = 'Low'
    }
    if (polValue > 100 && polValue <= 160) {
      getDaqi = 4
      getBand = 'Moderate'
    }
    if (polValue > 160 && polValue <= 240) {
      getDaqi = 7
      getBand = 'High'
    }
    if (polValue > 240) {
      getDaqi = 10
      getBand = 'Very high'
    }
  }
  return { getDaqi, getBand }
}

export { getPollutantLevel }
