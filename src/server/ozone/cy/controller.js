import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const ozoneController = createWelshPollutantController({
  pollutantKey: 'ozone',
  englishPath: '/pollutants/ozone',
  viewTemplate: 'ozone/index',
  welshPathKey: 'oson',
  pageIdentifier: 'ozone'
})

export { ozoneController }
