import { createWelshPollutantController } from '../../common/helpers/cy/pollutant-controller-helper.js'

const sulphurDioxideController = createWelshPollutantController({
  pollutantKey: 'sulphurDioxide',
  englishPath: '/pollutants/sulphur-dioxide',
  viewTemplate: 'sulphur-dioxide/index',
  welshPathKey: 'sylffwr-deuocsid',
  pageIdentifier: 'Sulphur dioxide (SO₂)'
})

export { sulphurDioxideController }
