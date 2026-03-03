import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const nitrogenDioxideController = createWelshPollutantController({
  pollutantKey: 'nitrogenDioxide',
  englishPath: '/pollutants/nitrogen-dioxide',
  viewTemplate: 'nitrogen-dioxide/index',
  welshPathKey: 'nitrogen-deuocsid',
  pageIdentifier: 'nitrogen dioxide'
})

export { nitrogenDioxideController }
